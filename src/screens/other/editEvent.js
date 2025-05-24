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

export default function EditEvent() {
    const navigation = useNavigation();
    const route = useRoute();
    const { item_id } = route.params;

    const [eventTitle, setEventTitle] = useState('');
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
    const [loading, setLoading] = useState(false); // Yüklenme durumu için state

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
        setShowFromDatePicker(false);
        if (currentDate) {
            setSelectedFromDateObj(currentDate);
            setFromDate(currentDate.toISOString().split('T')[0]); // YYYY-MM-DD formatında sakla
        }
    };

    const onToDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || selectedToDateObj;
        setShowToDatePicker(false);
        if (currentDate) {
            setSelectedToDateObj(currentDate);
            setToDate(currentDate.toISOString().split('T')[0]); // YYYY-MM-DD formatında sakla
        }
    };


    const fetchEventDetails = async () => {
        try {
            console.log("Etkinlik detayları çekiliyor...");
            setLoading(true); // Yükleme başlıyor
            const localToken = await AsyncStorage.getItem("token");
            if (!localToken) {
                Alert.alert("Hata", "Kimlik doğrulama token'ı bulunamadı. Lütfen tekrar giriş yapın.");
                navigation.navigate('Login'); // Örnek olarak giriş sayfasına yönlendirme
                return;
            }

            const response = await graduateApi.get(`/update/event/${item_id}`, {
                headers: {
                    'Authorization': `Bearer ${localToken}`,
                    'Content-Type': 'application/json',
                },
            });

            // API yanıtının yapısına göre düzeltme burada yapılıyor
            // `response.data.event` bir dizi ise, ilk elemanı alıyoruz.
            const eventDataArray = response.data.event;

            if (!eventDataArray || eventDataArray.length === 0) {
                Alert.alert("Hata", "Etkinlik verisi bulunamadı veya boş döndü.");
                navigation.goBack(); // Bir önceki sayfaya dönebiliriz
                return;
            }
            const eventData = eventDataArray[0]; // **Buradaki değişiklik**

            console.log("API'den Gelen Ham Veri:", response.data);
            console.log("İşlenen Event Data:", eventData); // Kontrol için

            setEventTitle(eventData.eventTitle);
            setCompanyName(eventData.company);
            setLocation(eventData.location);
            setFromDate(eventData.fromDate); // API'den gelen formatı doğrudan set et
            setToDate(eventData.toDate);     // API'den gelen formatı doğrudan set et
            setDescription(eventData.description);
            setSelectedFields(eventData.eventField ? eventData.eventField.split(',').map(f => f.trim()) : []);

            // Eğer tarih objelerini de başlangıçta set etmek isterseniz (opsiyonel)
            if (eventData.fromDate) {
                setSelectedFromDateObj(new Date(eventData.fromDate));
            }
            if (eventData.toDate) {
                setSelectedToDateObj(new Date(eventData.toDate));
            }

        } catch (error) {
            console.error("İlan verisi alınamadı:", error.response?.data?.message || error.message);
            Alert.alert("Hata", "Etkinlik detayları yüklenirken bir sorun oluştu.");
        } finally {
            setLoading(false); // Yükleme bitiyor
        }
    };

    useEffect(() => {
        fetchEventDetails();

        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            (e) => setKeyboardHeight(e.endCoordinates.height)
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => setKeyboardHeight(0)
        );

        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, [item_id]); // item_id değiştiğinde useEffect'in tekrar çalışması için ekledik



    const handleEditEvent = async () => {
        if (!eventTitle || !companyName || !location || !fromDate || !toDate || !description || selectedFields.length === 0) {
            Alert.alert('Hata', 'Lütfen tüm alanları doldurun ve en az bir bölüm seçin.');
            return;
        }

        if (new Date(fromDate) > new Date(toDate)) {
            Alert.alert('Hata', 'Başlangıç tarihi bitiş tarihinden sonra olamaz.');
            return;
        }

        const updatedEvent = { // Nesne adı `newEvent` yerine `updatedEvent` olarak değiştirildi
            eventTitle,
            description,
            company: companyName,
            location,
            fromDate,
            toDate,
            eventField: selectedFields.join(', '),
        };

        try {
            setLoading(true); // Güncelleme işlemi başlıyor
            const localToken = await AsyncStorage.getItem("token");
            if (!localToken) {
                Alert.alert("Hata", "Giriş yapmanız gerekiyor.");
                return;
            }

            const response = await graduateApi.post(`/update/event/${item_id}`, updatedEvent, {
                headers: {
                    'Authorization': `Bearer ${localToken}`,
                    'Content-Type': 'application/json',
                }
            });

            if (response.status === 200) {
                Alert.alert('Başarılı', 'Etkinlik başarıyla güncellendi.');
                navigation.goBack();
            } else {
                Alert.alert('Hata', response.data?.message || 'Etkinlik güncellenirken bir hata oluştu.');
            }
        } catch (error) {
            console.error('Etkinlik güncellenirken bir hata oluştu:', error.response?.data?.message || error.message);
            Alert.alert('Hata', error.response?.data?.message || 'Beklenmeyen bir hata oluştu.');
        } finally {
            setLoading(false); // Güncelleme işlemi bitiyor
        }
    };

    // Tarihlerin kullanıcıya gösterilecek formatı
    const displayFromDate = fromDate ? new Date(fromDate).toLocaleDateString('tr-TR') : '';
    const displayToDate = toDate ? new Date(toDate).toLocaleDateString('tr-TR') : '';
    return (
        <KeyboardAvoidingView
            className="flex-1"
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            <View className="flex-1  bg-gray-100">
                {/* Yükleniyor Göstergesi */}
                {loading && (
                    <View className="absolute inset-0 z-10 justify-center items-center bg-black bg-opacity-30">
                        <ActivityIndicator size="large" color="#0000ff" />
                    </View>
                )}
                <View className="p-4 flex-row items-center mt-5 bg-gray-100 z-10">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Icon name="arrow-back" size={30} color="black" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold ml-4">Etkinlik Güncelle</Text>

                </View>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingBottom: 50 + keyboardHeight,
                        paddingHorizontal: 20
                    }}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Etkinlik Başlığı */}
                    <Text className="text-gray-800 font-semibold mb-2 mt-4">Etkinlik Başlığı</Text>
                    <TextInput
                        className="bg-white p-4 rounded-lg text-gray-800 shadow-sm border border-gray-300 w-full"
                        placeholder="Etkinlik Başlığı"
                        value={eventTitle}
                        onChangeText={setEventTitle}
                        placeholderTextColor="#A9A9A9"
                    />

                    {/* Bölüm Seçimi */}
                    <Text className="text-gray-800 font-semibold mt-4 mb-2">Bölümler</Text>
                    <TouchableOpacity
                        className="bg-white p-4 rounded-lg shadow-sm border border-gray-300 flex-row justify-between items-center w-full"
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
                        className="bg-white p-4 rounded-lg text-gray-800 shadow-sm border border-gray-300 w-full"
                        placeholder="Şirket Adı"
                        value={companyName}
                        onChangeText={setCompanyName}
                        placeholderTextColor="#A9A9A9"
                    />

                    {/* Yer (Konum) */}
                    <Text className="text-gray-800 font-semibold mb-2 mt-4">Yer</Text>
                    <View className="bg-white p-2 rounded-lg shadow-sm flex-row items-center justify-between border border-gray-300 w-full">
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
                                className="bg-white p-4 rounded-lg text-gray-800 shadow-sm border border-gray-300 w-full"
                                placeholder="gg.aa.yyyy"
                                value={displayFromDate}
                                onTouchStart={() => setShowFromDatePicker(true)}
                                placeholderTextColor="#A9A9A9"
                            />
                        </View>

                        <View className="flex-1 ml-2">
                            <Text className="text-gray-800 font-semibold mb-2">Bitiş Tarihi</Text>
                            <TextInput
                                className="bg-white p-4 rounded-lg text-gray-800 shadow-sm border border-gray-300 w-full"
                                placeholder="gg.aa.yyyy"
                                value={displayToDate}
                                onTouchStart={() => setShowToDatePicker(true)}
                                placeholderTextColor="#A9A9A9"
                            />
                        </View>
                    </View>

                    {/* Tarih Seçici Modals */}
                    {showFromDatePicker && (
                        <DateTimePicker
                            value={selectedFromDateObj || (fromDate ? new Date(fromDate) : new Date())}
                            mode="date"
                            is24Hour={true}
                            onChange={onFromDateChange}
                            display={Platform.OS === 'ios' ? 'inline' : 'default'}
                        />
                    )}
                    {showToDatePicker && (
                        <DateTimePicker
                            value={selectedToDateObj || (toDate ? new Date(toDate) : new Date())}
                            mode="date"
                            is24Hour={true}
                            onChange={onToDateChange}
                            display={Platform.OS === 'ios' ? 'inline' : 'default'}
                        />
                    )}

                    {/* Açıklama */}
                    <Text className="text-gray-800 font-semibold mb-2 mt-4">Açıklama</Text>
                    <TextInput
                        className="bg-white p-4 rounded-lg text-gray-800 h-32 shadow-sm border border-gray-300 w-full"
                        placeholder="Etkinlik hakkında detaylı bilgi..."
                        value={description}
                        onChangeText={setDescription}
                        placeholderTextColor="#A9A9A9"
                        multiline
                        textAlignVertical="top"
                    />

                    {/* Etkinlik Güncelle Butonu */}
                    <TouchableOpacity
                        onPress={handleEditEvent}
                        className="bg-green-600 p-4 rounded-lg mt-4 mb-10 items-center shadow-md active:bg-green-700 w-full"
                        disabled={loading}
                    >
                        <Text className="text-white text-lg font-bold">Güncelle</Text>
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