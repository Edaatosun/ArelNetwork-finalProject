import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Keyboard, // Klavye olaylarını dinlemek için eklendi
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { graduateApi } from "../../connector/URL";
import AsyncStorage from "@react-native-async-storage/async-storage";

// react-native-paper importları
import { Checkbox, Dialog, Portal, Button as PaperButton } from 'react-native-paper';

export default function CreateEvent() {
    const navigation = useNavigation();

    // Form state variables
    const [eventTitle, setEventTitle] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [location, setLocation] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [description, setDescription] = useState('');

    // Date Picker Visibility
    const [showFromDatePicker, setShowFromDatePicker] = useState(false);
    const [showToDatePicker, setShowToDatePicker] = useState(false);
    const [selectedFromDateObj, setSelectedFromDateObj] = useState(null);
    const [selectedToDateObj, setSelectedToDateObj] = useState(null);

    // Bölümler için state
    const [selectedFields, setSelectedFields] = useState([]);
    const [showFieldDialog, setShowFieldDialog] = useState(false);

    // Klavye yüksekliğini tutmak için state
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
        const currentDate = selectedDate || selectedFromDateObj;
        setShowFromDatePicker(Platform.OS === 'ios');
        if (currentDate) {
            setSelectedFromDateObj(currentDate);
            setFromDate(currentDate.toISOString().split('T')[0]);
        }
    };

    const onToDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || selectedToDateObj;
        setShowToDatePicker(Platform.OS === 'ios');
        if (currentDate) {
            setSelectedToDateObj(currentDate);
            setToDate(currentDate.toISOString().split('T')[0]);
        }
    };

    const handleCreateEvent = async () => {
        if (!eventTitle || !companyName || !location || !fromDate || !toDate || !description || selectedFields.length === 0) {
            Alert.alert('Hata', 'Lütfen tüm alanları doldurun ve en az bir bölüm seçin.');
            return;
        }

        if (new Date(fromDate) > new Date(toDate)) {
            Alert.alert('Hata', 'Başlangıç tarihi bitiş tarihinden sonra olamaz.');
            return;
        }

        const newEvent = {
            eventTitle,
            description,
            company: companyName,
            location,
            fromDate,
            toDate,
            eventField: selectedFields.join(', '),
        };

        try {
            console.log("newEvent:", newEvent);
            const localToken = await AsyncStorage.getItem("token");
            if (!localToken) {
                Alert.alert("Hata", "Giriş yapmanız gerekiyor.");
                return;
            }

            const response = await graduateApi.post('/create/eventAd', newEvent, {
                headers: {
                    'Authorization': `Bearer ${localToken}`,
                    'Content-Type': 'application/json',
                }
            });

            if (response.status === 200) {
                Alert.alert('Başarılı', 'Etkinlik başarıyla oluşturuldu.');
                navigation.goBack();
                setEventTitle('');
                setCompanyName('');
                setLocation('');
                setFromDate('');
                setToDate('');
                setDescription('');
                setSelectedFields([]);
                setSelectedFromDateObj(null);
                setSelectedToDateObj(null);
            } else {
                Alert.alert('Hata', response.data?.message || 'Etkinlik oluşturulurken bir hata oluştu.');
            }
        } catch (error) {
            console.error('Etkinlik oluşturulurken bir hata oluştu:', error);
            Alert.alert('Hata', error.response?.data?.message || 'Beklenmeyen bir hata oluştu.');
        }
    };

    // Klavye açıldığında ve kapandığında padding'i ayarlamak için useEffect kullanıyoruz
    React.useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            (e) => {
                setKeyboardHeight(e.endCoordinates.height);
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardHeight(0);
            }
        );

        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, []);


    return (
        <KeyboardAvoidingView
            className="flex-1"
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} // iOS için offset gerekebilir
        >
            <View className="flex-1 px-5 bg-gray-100">
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingBottom: 50 + keyboardHeight, // Klavye yüksekliği kadar ekstra padding
                    }}
                    // klavye açıldığında TextInput'un görünür olmasını sağlamak için ek ayarlar
                    keyboardShouldPersistTaps="handled" // Klavye açıkken dokunmaların düzgün çalışmasını sağlar
                >
                    {/* Etkinlik Başlığı */}
                    <Text className="text-gray-800 font-semibold mb-2 mt-4">Etkinlik Başlığı</Text>
                    <TextInput
                        className="bg-white p-4 rounded-lg text-gray-800 shadow-sm border border-gray-300"
                        placeholder="Etkinlik Başlığı"
                        value={eventTitle}
                        onChangeText={setEventTitle}
                        placeholderTextColor="#A9A9A9"
                    />

                    {/* Bölüm Seçimi */}
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

                    {/* Firma Adı */}
                    <Text className="text-gray-800 font-semibold mb-2 mt-4">Firma Adı</Text>
                    <TextInput
                        className="bg-white p-4 rounded-lg text-gray-800 shadow-sm border border-gray-300"
                        placeholder="Şirket Adı"
                        value={companyName}
                        onChangeText={setCompanyName}
                        placeholderTextColor="#A9A9A9"
                    />

                    {/* Yer (Konum) */}
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

                    {/* Tarih Seçiciler */}
                    <View className="flex-row justify-between items-center mt-4">
                        <View className="flex-1 mr-2">
                            <Text className="text-gray-800 font-semibold mb-2">Başlangıç Tarihi</Text>
                            <TextInput
                                className="bg-white p-4 rounded-lg text-gray-800 shadow-sm border border-gray-300"
                                placeholder="Tarih Seçin"
                                value={fromDate}
                                onTouchStart={() => setShowFromDatePicker(true)}
                                placeholderTextColor="#A9A9A9"
                            />
                        </View>

                        <View className="flex-1 ml-2">
                            <Text className="text-gray-800 font-semibold mb-2">Bitiş Tarihi</Text>
                            <TextInput
                                className="bg-white p-4 rounded-lg text-gray-800 shadow-sm border border-gray-300"
                                placeholder="Tarih Seçin"
                                value={toDate}
                                onTouchStart={() => setShowToDatePicker(true)}
                                placeholderTextColor="#A9A9A9"
                            />
                        </View>
                    </View>

                    {/* Tarih Seçici Modals */}
                    {showFromDatePicker && (
                        <DateTimePicker
                            value={selectedFromDateObj || new Date()}
                            mode="date"
                            is24Hour={true}
                            onChange={onFromDateChange}
                            display={Platform.OS === 'ios' ? 'inline' : 'default'}
                        />
                    )}
                    {showToDatePicker && (
                        <DateTimePicker
                            value={selectedToDateObj || new Date()}
                            mode="date"
                            is24Hour={true}
                            onChange={onToDateChange}
                            display={Platform.OS === 'ios' ? 'inline' : 'default'}
                        />
                    )}

                    {/* Açıklama */}
                    <Text className="text-gray-800 font-semibold mb-2 mt-4">Açıklama</Text>
                    <TextInput
                        className="bg-white p-4 rounded-lg text-gray-800 h-40 shadow-sm border border-gray-300"
                        placeholder="Etkinlik hakkında detaylı bilgi..."
                        value={description}
                        onChangeText={setDescription}
                        placeholderTextColor="#A9A9A9"
                        multiline
                        textAlignVertical="top"
                    />

                    {/* Etkinlik Oluştur Butonu */}
                    <TouchableOpacity
                        onPress={handleCreateEvent}
                        className="bg-green-600 p-4 rounded-lg mt-6 mb-10 items-center shadow-md active:bg-green-700"
                    >
                        <Text className="text-white text-lg font-bold">Etkinlik Oluştur</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            {/* Bölüm Seçim Diyaloğu */}
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