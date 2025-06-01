import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    Keyboard,
    Platform,
    KeyboardAvoidingView,
    ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { graduateApi } from "../../connector/URL";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Checkbox, Dialog, Portal, Button as PaperButton } from 'react-native-paper';

export default function EditIntern() {
    const navigation = useNavigation();
    const route = useRoute();
    const { item_id } = route.params;

    const [internTitle, setInternTitle] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [location, setLocation] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [description, setDescription] = useState('');
    const [showFromDatePicker, setShowFromDatePicker] = useState(false);
    const [showToDatePicker, setShowToDatePicker] = useState(false);
    const [selectedFromDateObj, setSelectedFromDateObj] = useState(null);
    const [selectedToDateObj, setSelectedToDateObj] = useState(null);
    const [selectedFields, setSelectedFields] = useState([]);
    const [showFieldDialog, setShowFieldDialog] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [loading, setLoading] = useState(false);

    const availableFields = [
        "Mühendislik", "Yazılım Geliştirme", "Tasarım", "Pazarlama",
        "İnsan Kaynakları", "Finans", "Sağlık", "Eğitim",
        "Sanat", "Medya", "Hukuk", "Danışmanlık", "Diğer"
    ];

    const handleFieldSelection = (field) => {
        if (selectedFields.includes(field)) {
            setSelectedFields(selectedFields.filter(f => f !== field));
        } else {
            setSelectedFields([...selectedFields, field]);
        }
    };

    const onFromDateChange = (event, selectedDate) => {
        if (event.type === 'dismissed') {
            setShowFromDatePicker(false);
            return;
        }

        const currentDate = selectedDate || selectedFromDateObj;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (currentDate < today) {
            Alert.alert("Hata", "Bugün veya daha sonraki bir tarih seçin.");
            return;
        }

        setShowFromDatePicker(false);
        setSelectedFromDateObj(currentDate);
        setFromDate(currentDate.toISOString().split('T')[0]);

        if (selectedToDateObj && currentDate > selectedToDateObj) {
            setSelectedToDateObj(null);
            setToDate('');
        }
    };

    const onToDateChange = (event, selectedDate) => {
        if (event.type === 'dismissed') {
            setShowToDatePicker(false);
            return;
        }

        const currentDate = selectedDate || selectedToDateObj;

        if (selectedFromDateObj && currentDate < selectedFromDateObj) {
            Alert.alert("Hata", "Bitiş tarihi, başlangıç tarihinden önce olamaz.");
            return;
        }

        setShowToDatePicker(false);
        setSelectedToDateObj(currentDate);
        setToDate(currentDate.toISOString().split('T')[0]);
    };

    const fetchInternDetails = async () => {
        try {
            setLoading(true);
            const localToken = await AsyncStorage.getItem("token");
            if (!localToken) {
                Alert.alert("Hata", "Kimlik doğrulama token'ı bulunamadı. Lütfen tekrar giriş yapın.");
                navigation.navigate('Login');
                return;
            }

            const response = await graduateApi.get(`/update/intern/${item_id}`, {
                headers: {
                    'Authorization': `Bearer ${localToken}`,
                    'Content-Type': 'application/json',
                },
            });

            const internDataArray = response.data.intern;

            if (!internDataArray || internDataArray.length === 0) {
                Alert.alert("Hata", "Staj ilanı verisi bulunamadı veya boş döndü.");
                navigation.goBack();
                return;
            }
            const internData = internDataArray[0];

            setInternTitle(internData.internTitle);
            setCompanyName(internData.company);
            setLocation(internData.location);
            setFromDate(internData.fromDate);
            setToDate(internData.toDate);
            setDescription(internData.description);
            setSelectedFields(internData.internField ? internData.internField.split(',').map(f => f.trim()) : []);

            if (internData.fromDate) {
                setSelectedFromDateObj(new Date(internData.fromDate));
            }
            if (internData.toDate) {
                setSelectedToDateObj(new Date(internData.toDate));
            }

        } catch (error) {
            Alert.alert("Hata", "Staj ilanı detayları yüklenirken bir sorun oluştu.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInternDetails();

        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => setKeyboardHeight(e.endCoordinates.height));
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));

        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, [item_id]);

    const handleEditIntern = async () => {
        if (!internTitle || !companyName || !location || !fromDate || !toDate || !description || selectedFields.length === 0) {
            Alert.alert('Hata', 'Lütfen tüm alanları doldurun ve en az bir bölüm seçin.');
            return;
        }

        if (new Date(fromDate) > new Date(toDate)) {
            Alert.alert('Hata', 'Başlangıç tarihi bitiş tarihinden sonra olamaz.');
            return;
        }

        const updatedIntern = {
            internTitle,
            description,
            company: companyName,
            location,
            fromDate,
            toDate,
            internField: selectedFields.join(', '),
        };

        try {
            setLoading(true);
            const localToken = await AsyncStorage.getItem("token");
            if (!localToken) {
                Alert.alert("Hata", "Giriş yapmanız gerekiyor.");
                return;
            }

            const response = await graduateApi.post(`/update/intern/${item_id}`, updatedIntern, {
                headers: {
                    'Authorization': `Bearer ${localToken}`,
                    'Content-Type': 'application/json',
                }
            });

            if (response.status === 200) {
                Alert.alert('Başarılı', 'Staj ilanı başarıyla güncellendi.');
                navigation.goBack();
            } else {
                Alert.alert('Hata', response.data?.message || 'Staj ilanı güncellenirken bir hata oluştu.');
            }
        } catch (error) {
            Alert.alert('Hata', error.response?.data?.message || 'Beklenmeyen bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const displayFromDate = fromDate ? new Date(fromDate).toLocaleDateString('tr-TR') : '';
    const displayToDate = toDate ? new Date(toDate).toLocaleDateString('tr-TR') : '';

    return (
        <KeyboardAvoidingView
            className="flex-1"
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            <View className="flex-1 bg-gray-100">
                {loading && (
                    <View className="absolute inset-0 z-10 justify-center items-center bg-black bg-opacity-30">
                        <ActivityIndicator size="large" color="#0000ff" />
                    </View>
                )}
                <View className="p-4 flex-row items-center mt-5 bg-gray-100 z-10">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Icon name="arrow-back" size={30} color="black" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold ml-4">Staj İlanı Güncelle</Text>

                </View>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingBottom: 50 + keyboardHeight,
                        paddingHorizontal: 20
                    }}
                    keyboardShouldPersistTaps="handled"

                >
                    <Text className="text-gray-800 font-semibold mb-2 mt-4">Staj İlanı Başlığı</Text>
                    <TextInput
                        className="bg-white p-4 rounded-lg text-gray-800 shadow-sm border border-gray-300"
                        placeholder="Staj İlanı Başlığı"
                        value={internTitle}
                        onChangeText={setInternTitle}
                        placeholderTextColor="#A9A9A9"
                    />

                    <Text className="text-gray-800 font-semibold mt-4 mb-2">Bölümler</Text>
                    <TouchableOpacity
                        className="bg-white p-4 rounded-lg shadow-sm border border-gray-300 flex-row justify-between items-center"
                        onPress={() => setShowFieldDialog(true)}
                    >
                        <Text className={`flex-1 ${selectedFields.length > 0 ? 'text-gray-800' : 'text-gray-400'}`}>
                            {selectedFields.length > 0 ? selectedFields.join(', ') : "Bölüm(ler) Seçin"}
                        </Text>
                        <Icon name="chevron-down-outline" size={20} color="#A9A9A9" />
                    </TouchableOpacity>

                    <Text className="text-gray-800 font-semibold mb-2 mt-4">Firma Adı</Text>
                    <TextInput
                        className="bg-white p-4 rounded-lg text-gray-800 shadow-sm border border-gray-300"
                        placeholder="Şirket Adı"
                        value={companyName}
                        onChangeText={setCompanyName}
                        placeholderTextColor="#A9A9A9"
                    />

                    <Text className="text-gray-800 font-semibold mb-2 mt-4">Yer</Text>
                    <View className="bg-white p-2 rounded-lg shadow-sm flex-row items-center justify-between border border-gray-300">
                        <TextInput
                            className="flex-1 text-gray-800"
                            placeholder="Konum"
                            value={location}
                            onChangeText={setLocation}
                            placeholderTextColor="#A9A9A9"
                        />
                        <Icon name="location-sharp" size={18} color="#6B7280" />
                    </View>

                    <View className="flex-row justify-between items-center mt-4">
                        <View className="flex-1 mr-2">
                            <Text className="text-gray-800 font-semibold mb-2">Başlangıç Tarihi</Text>
                            <TextInput
                                className="bg-white p-4 rounded-lg text-gray-800 shadow-sm border border-gray-300"
                                placeholder="gg.aa.yyyy"
                                value={displayFromDate}
                                onTouchStart={() => setShowFromDatePicker(true)}
                                placeholderTextColor="#A9A9A9"
                            />
                        </View>
                        <View className="flex-1 ml-2">
                            <Text className="text-gray-800 font-semibold mb-2">Bitiş Tarihi</Text>
                            <TextInput
                                className="bg-white p-4 rounded-lg text-gray-800 shadow-sm border border-gray-300"
                                placeholder="gg.aa.yyyy"
                                value={displayToDate}
                                onTouchStart={() => setShowToDatePicker(true)}
                                placeholderTextColor="#A9A9A9"
                            />
                        </View>
                    </View>

                    {showFromDatePicker && (
                        <DateTimePicker
                            value={selectedFromDateObj || new Date()}
                            mode="date"
                            is24Hour={true}
                            onChange={onFromDateChange}
                            display={Platform.OS === 'ios' ? 'inline' : 'default'}
                            minimumDate={new Date()}
                        />
                    )}
                    {showToDatePicker && (
                        <DateTimePicker
                            value={selectedToDateObj || new Date()}
                            mode="date"
                            is24Hour={true}
                            onChange={onToDateChange}
                            display={Platform.OS === 'ios' ? 'inline' : 'default'}
                            minimumDate={selectedFromDateObj || new Date()}
                        />
                    )}

                    <Text className="text-gray-800 font-semibold mb-2 mt-4">Açıklama</Text>
                    <TextInput
                        className="bg-white p-4 rounded-lg text-gray-800 h-32 shadow-sm border border-gray-300"
                        placeholder="Staj ilanı hakkında detaylı bilgi..."
                        value={description}
                        onChangeText={setDescription}
                        placeholderTextColor="#A9A9A9"
                        multiline
                        textAlignVertical="top"
                    />

                    <TouchableOpacity
                        onPress={handleEditIntern}
                        className="bg-green-600 p-4 rounded-lg mt-4 mb-10 items-center shadow-md active:bg-green-700"
                    >
                        <Text className="text-white text-lg font-bold">Güncelle</Text>
                    </TouchableOpacity>
                </ScrollView>

                <Portal>
                    <Dialog visible={showFieldDialog} onDismiss={() => setShowFieldDialog(false)}>
                        <Dialog.Title className="text-lg font-bold text-gray-800">Bölüm Seçin</Dialog.Title>
                        <Dialog.Content>
                            <ScrollView className="max-h-[300px]">
                                {availableFields.map((field) => (
                                    <Checkbox.Item
                                        key={field}
                                        label={field}
                                        status={selectedFields.includes(field) ? 'checked' : 'unchecked'}
                                        onPress={() => handleFieldSelection(field)}
                                        color="#10B981"
                                        labelStyle={{ color: '#374151' }}
                                    />
                                ))}
                            </ScrollView>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <PaperButton onPress={() => setShowFieldDialog(false)}>Tamam</PaperButton>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
            </View>
        </KeyboardAvoidingView>
    );
}