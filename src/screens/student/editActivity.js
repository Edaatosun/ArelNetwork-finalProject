import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from "../../connector/URL";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from '@react-navigation/native';
import { formatDateTimeToLocal } from '../../components/date';

export default function EditActivity() {
    const navigation = useNavigation();
    const route = useRoute();

    const event = route.params?.event || null;

    const [head, setHead] = useState(event?.head || '');
    const [companyName, setCompanyName] = useState(event?.companyName || '');
    const [location, setLocation] = useState(event?.location || '');
    const [localStartDate, setLocalStartDate] = useState(event?.startDate?.split('T')[0] || '');
    const [selectedTime, setSelectedTime] = useState(event?.startDate ? new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '');
    const [description, setDescription] = useState(event?.description || '');
    const [organizerFullName, setOrganizerFullName] = useState(event?.organizerFullName || '');
    const [contactInfo, setContactInfo] = useState(event?.contactInfo || '');
    const [photo, setPhoto] = useState(event?.photo || 'https://cdn-icons-png.flaticon.com/512/4709/4709457.png');
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);

    const handleConfirmDate = (event, selectedDate) => {
        if (selectedDate) {
            setSelectedDate(selectedDate);
            const formattedDate = selectedDate.toISOString().split('T')[0];
            setLocalStartDate(formattedDate);
        }
        setDatePickerVisibility(false);
    };


    const handleConfirmTime = (event, selectedTime) => {
        if (selectedTime) {
            const formattedTime = selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            setSelectedTime(formattedTime);
        }
        setTimePickerVisibility(false);
    };

    const handleSubmit = async () => {
        if (!head || !companyName || !location || !localStartDate || !selectedTime || !description || !organizerFullName || !contactInfo) {
            Alert.alert('Hata', 'Tüm alanları doldurduğunuzdan emin olun.');
            return;
        }
        console.log("handle");
        const startDate = formatDateTimeToLocal(localStartDate, selectedTime);
        const data = {
            head,
            companyName,
            location,
            startDate,
            description,
            photo,
            organizerFullName,
            contactInfo
        };

        try {
            const localToken = await AsyncStorage.getItem("token");
            console.log("hey2");
            const response = await api.put(`/editActivity/${event._id}`, data, {
                headers: {
                    'Authorization': `Bearer ${localToken}`,
                    'Content-Type': 'application/json',
                }
            });

            if (response.status === 200) {
                Alert.alert('Başarılı', 'Etkinlik başarıyla güncellendi.');
                navigation.navigate('DetailsActivity', { event_id: event._id, isEditMode: true })
            }
        } catch (error) {
            console.error('İşlem sırasında hata:', error);
            Alert.alert('Hata', 'Bir hata oluştu.');
        }
    };

    const showDatePicker = () => setDatePickerVisibility(true);
    const showTimePicker = () => setTimePickerVisibility(true);

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={{ flex: 1, paddingHorizontal: 20, backgroundColor: '#f8f8f8' }}>
                <View className="flex-row items-center mt-10">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                        <Icon name="arrow-back" size={30} color="black" />
                    </TouchableOpacity>
                    <Text className="text-xl text-black font-bold">Etkinliği Düzenle</Text>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 10 }}>

                    {/* Profile URL */}
                    <View className="flex-row items-center mt-6 justify-center">
                        <View className="relative rounded-full border-4 border-blue-600 h-32 w-32">
                            <Image
                                source={{ uri: photo }}
                                className="w-full h-full rounded-full"
                            />
                            <TouchableOpacity className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2">
                                <Icon name="add" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Input fields for event */}
                    <TextInput
                        className="bg-white p-4 mt-6 rounded-lg text-black shadow-sm"
                        placeholder="Etkinlik Başlığı"
                        value={head}
                        onChangeText={setHead}
                        placeholderTextColor="#A9A9A9"
                    />

                    <TextInput
                        className="bg-white p-4 mt-6 rounded-lg text-black shadow-sm"
                        placeholder="Şirket Adı"
                        value={companyName}
                        onChangeText={setCompanyName}
                        placeholderTextColor="#A9A9A9"
                    />

                    <View className="bg-white mt-6 p-2 rounded-lg shadow-sm flex-row items-center justify-between">
                        <TextInput
                            className=" text-black"
                            placeholder="Konum"
                            value={location}
                            onChangeText={setLocation}
                            placeholderTextColor="#A9A9A9"
                        />
                        <Icon name="location-sharp" size={20} color="#A9A9A9" />
                    </View>

                    {/* Date and Time Picker */}
                    <View className="flex-row justify-between items-center mt-6">
                        <View className="flex-1 mr-2">
                            <Text className="text-black font-semibold mb-2">Tarih</Text>
                            <TextInput
                                className="bg-white p-4 rounded-lg text-black shadow-sm border border-gray-300"
                                placeholder="Tarih Seçin"
                                value={localStartDate}
                                onTouchStart={showDatePicker}
                                placeholderTextColor="#A9A9A9"
                            />
                        </View>

                        <View className="flex-1 ml-2">
                            <Text className="text-black font-semibold mb-2">Saat</Text>
                            <TextInput
                                className="bg-white p-4 rounded-lg text-black shadow-sm border border-gray-300"
                                placeholder="Saat Seçin"
                                value={selectedTime}
                                onTouchStart={showTimePicker}
                                placeholderTextColor="#A9A9A9"
                            />
                        </View>
                    </View>

                    {/* Date and Time Picker Modals */}
                    {isDatePickerVisible && (
                        <DateTimePicker
                            value={selectedDate || new Date()}
                            mode="date"
                            is24Hour={true}
                            onChange={handleConfirmDate}
                        />
                    )}

                    {isTimePickerVisible && (
                        <DateTimePicker
                            value={new Date()}
                            mode="time"
                            is24Hour={true}
                            onChange={handleConfirmTime}
                        />
                    )}

                    <TextInput
                        className="bg-white p-4 mt-6 rounded-lg text-black h-40 shadow-sm text-left"
                        placeholder="Açıklama"
                        value={description}
                        onChangeText={setDescription}
                        placeholderTextColor="#A9A9A9"
                        multiline
                    />

                    <TextInput
                        className="bg-white p-4 mt-6 rounded-lg text-black shadow-sm"
                        placeholder="Organizatör Adı"
                        value={organizerFullName}
                        onChangeText={setOrganizerFullName}
                        placeholderTextColor="#A9A9A9"
                    />

                    <TextInput
                        className="bg-white p-4 mt-6 rounded-lg text-black shadow-sm"
                        placeholder="İletişim Bilgisi"
                        value={contactInfo}
                        onChangeText={setContactInfo}
                        placeholderTextColor="#A9A9A9"
                    />


                    <TouchableOpacity onPress={handleSubmit} className="bg-red-500 p-4 rounded-lg mt-6 items-center shadow-md">
                        <Text className="text-white text-lg font-bold">Etkinliği Güncelle</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
}
