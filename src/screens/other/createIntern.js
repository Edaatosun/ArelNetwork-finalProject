import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { graduateApi } from "../../connector/URL";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Checkbox, Dialog, Portal, Button as PaperButton } from 'react-native-paper';

export default function CreateIntern() {
    const navigation = useNavigation();

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
            Alert.alert("Hata", "Bugünden önceki bir tarih seçilemez.");
            return;
        }

        setShowFromDatePicker(Platform.OS === 'ios');
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
            Alert.alert("Hata", "Bitiş tarihi başlangıç tarihinden önce olamaz.");
            return;
        }

        setShowToDatePicker(Platform.OS === 'ios');
        setSelectedToDateObj(currentDate);
        setToDate(currentDate.toISOString().split('T')[0]);
    };

    const handleCreateIntern = async () => {
        if (!internTitle || !companyName || !location || !fromDate || !toDate || !description || selectedFields.length === 0) {
            Alert.alert('Hata', 'Lütfen tüm alanları doldurun ve en az bir bölüm seçin.');
            return;
        }

        if (new Date(fromDate) > new Date(toDate)) {
            Alert.alert('Hata', 'Başlangıç tarihi bitiş tarihinden sonra olamaz.');
            return;
        }

        const newIntern = {
            internTitle,
            description,
            company: companyName,
            location,
            fromDate,
            toDate,
            internField: selectedFields.join(', '),
        };

        try {
            const localToken = await AsyncStorage.getItem("token");
            if (!localToken) {
                Alert.alert("Hata", "Giriş yapmanız gerekiyor.");
                return;
            }

            const response = await graduateApi.post('/create/internAd', newIntern, {
                headers: {
                    'Authorization': `Bearer ${localToken}`,
                    'Content-Type': 'application/json',
                }
            });

            if (response.status === 200) {
                Alert.alert('Başarılı', 'Staj ilanı başarıyla oluşturuldu.');
                navigation.goBack();
            } else {
                Alert.alert('Hata', response.data?.message || 'Staj ilanı oluşturulurken bir hata oluştu.');
            }
        } catch (error) {
            Alert.alert('Hata', error.response?.data?.message || 'Beklenmeyen bir hata oluştu.');
        }
    };

    useEffect(() => {
        const showListener = Keyboard.addListener('keyboardDidShow', e => setKeyboardHeight(e.endCoordinates.height));
        const hideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));
        return () => {
            showListener.remove();
            hideListener.remove();
        };
    }, []);

    const displayFromDate = fromDate ? new Date(fromDate).toLocaleDateString('tr-TR') : '';
    const displayToDate = toDate ? new Date(toDate).toLocaleDateString('tr-TR') : '';

    return (
        <KeyboardAvoidingView
            className="flex-1"
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            <View className="flex-1 px-5 bg-gray-100">
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 50 + keyboardHeight }}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text className="text-gray-800 font-semibold mb-2 mt-4">Staj İlanı Başlığı</Text>
                    <TextInput
                        className="bg-white p-4 rounded-lg text-gray-800 shadow-sm border border-gray-300"
                        placeholder="Staj ilanı Başlığı"
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
                            value={selectedToDateObj || (selectedFromDateObj || new Date())}
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
                        onPress={handleCreateIntern}
                        className="bg-green-600 p-4 rounded-lg mt-4 mb-10 items-center shadow-md active:bg-green-700"
                    >
                        <Text className="text-white text-lg font-bold">Oluştur</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            <Portal>
                <Dialog visible={showFieldDialog} onDismiss={() => setShowFieldDialog(false)} className="rounded-lg">
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
                    <Dialog.Actions className="justify-end">
                        <PaperButton onPress={() => setShowFieldDialog(false)} className="text-blue-600">
                            Tamam
                        </PaperButton>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </KeyboardAvoidingView>
    );
}
