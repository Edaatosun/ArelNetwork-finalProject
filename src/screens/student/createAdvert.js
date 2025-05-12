import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Image, KeyboardAvoidingView, Platform, Modal, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from "../../connector/URL";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CreateAdvert() {
    const navigation = useNavigation();

    // Form state variables
    const [head, setHead] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [location, setLocation] = useState('');
    const [startDate, setStartDate] = useState('');
    const [finishDate, setFinishDate] = useState('');
    const [description, setDescription] = useState('');
    const [photo, setPhoto] = useState('');
    const [department, setDepartment] = useState([]);
    const [isStartDatePickerVisible, setStartDatePickerVisibility] = useState(false);
    const [isFinishDatePickerVisible, setFinishDatePickerVisibility] = useState(false);
    const [selectedStartDate, setSelectedStartDate] = useState(null);
    const [selectedFinishDate, setSelectedFinishDate] = useState(null);
    const [isDepartmentModalVisible, setDepartmentModalVisible] = useState(false);
    const [selectedTab, setSelectedTab] = useState('İş İlanları');
    const [jobType, setJobType] = useState('iş'); 

   
    const departmentOptions = [
        'Bilgisayar Mühendisliği',
        'Yazılım Mühendisliği',
        'Elektrik Mühendisliği',
        'Makine Mühendisliği',
        'Endüstri Mühendisliği',
        'Psikoloji'
    ];

    
    const handleStartDateConfirm = (event, selectedDate) => {
        if (selectedDate) {
            setSelectedStartDate(selectedDate); 
            setStartDate(selectedDate.toString()); 
        }
        setStartDatePickerVisibility(false); 
    };

 
    const handleFinishDateConfirm = (event, selectedDate) => {
        if (selectedDate) {
            setSelectedFinishDate(selectedDate); 
            setFinishDate(selectedDate.toString()); 
        }
        setFinishDatePickerVisibility(false); 
    };

    
    const handleCreateAdvert = async () => {
        // Check for empty fields
        if (!head || !companyName || !location || !startDate || !finishDate || !department.length || !description) {
            Alert.alert('Hata', 'Tüm alanları doldurduğunuzdan emin olun.'); 
            return;
        }

        
        if (new Date(startDate) > new Date(finishDate)) {
            Alert.alert('Hata', 'Başlangıç tarihi bitiş tarihinden önce olmalıdır.'); 
            return;
        }

        
        const newAdvert = {
            head,               
            companyName,        
            location,           
            startDate,          
            finishDate,         
            department,         
            description,      
            photo,              
            jobType,           
        };

        try {
            
            const localToken = await AsyncStorage.getItem("token");

            
            const response = await api.post('/added/job', newAdvert, {
                headers: {
                    'Authorization': `Bearer ${localToken}`, 
                    'Content-Type': 'application/json',      
                }
            });

            // Check if the request was successful
            if (response.status === 201) {
                Alert.alert('Başarılı', 'İlan başarıyla oluşturuldu.'); 
                navigation.goBack(); 
            }
        } catch (error) {
           
            console.error('İlan eklenirken bir hata oluştu:', error);
            Alert.alert('Hata', 'İlan eklenirken bir hata oluştu.'); 
        }
    };

    
    const showStartDatePicker = () => {
        setStartDatePickerVisibility(true);
    };

   
    const showFinishDatePicker = () => {
        setFinishDatePickerVisibility(true);
    };

   
    const handleDepartmentSelect = (department) => {
        setDepartment((prevDepartments) => {
            if (prevDepartments.includes(department)) {
                return prevDepartments.filter(item => item !== department);
            } else {
                return [...prevDepartments, department];
            }
        });
    };

   
    const handleTabChange = (tab) => {
        setSelectedTab(tab);
        setJobType(tab === 'İş İlanları' ? 'iş' : 'staj'); 
        
    };
    console.log(jobType);
    
    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={{ flex: 1, paddingHorizontal: 20, backgroundColor: '#f8f8f8' }}>
                <View className="flex-row items-center mt-10">
                    {/* Geri Dön Butonu */}
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                        <Icon name="arrow-back" size={30} color="black" />
                    </TouchableOpacity>

                    {/* Başlık */}
                    <Text className="text-xl text-black font-bold">İlan Oluştur</Text>
                </View>

                {/* Sekme Navigasyonu */}
                <View className="flex-row w-full justify-center">
                    {['İş İlanları', 'Staj İlanları'].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => handleTabChange(tab)}
                            className={`flex-1 p-3 border-b-2 items-center ${selectedTab === tab ? 'border-blue-500' : 'border-transparent'}`}
                        >
                            <Text className={`font-bold ${selectedTab === tab ? 'text-black' : 'text-gray-400'}`}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <ScrollView contentContainerStyle={{ paddingVertical: 10 }}>
                    {/* Profile Image */}
                    <View className="flex-row items-center mt-6 justify-center">
                        <View className="relative rounded-full border-4 border-blue-600 h-32 w-32">
                            <Image
                                source={photo ? { uri: photo } : { uri: "https://cdn-icons-png.flaticon.com/512/4709/4709457.png" }}
                                className="w-full h-full rounded-full"
                            />
                            <TouchableOpacity className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2">
                                <Icon name="add" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Event Title */}
                    <TextInput
                        className="bg-white p-4 mt-6 rounded-lg text-black shadow-sm"
                        placeholder="Etkinlik Başlığı"
                        value={head}
                        onChangeText={setHead}
                        placeholderTextColor="#A9A9A9"
                    />

                    {/* Company Name */}
                    <TextInput
                        className="bg-white p-4 mt-6 rounded-lg text-black shadow-sm"
                        placeholder="Şirket Adı"
                        value={companyName}
                        onChangeText={setCompanyName}
                        placeholderTextColor="#A9A9A9"
                    />

                    {/* Location */}
                    <View className="bg-white mt-6 p-2 rounded-lg shadow-sm flex-row items-center justify-between">
                        <TextInput
                            className="text-black"
                            placeholder="Konum"
                            value={location}
                            onChangeText={setLocation}
                            placeholderTextColor="#A9A9A9"
                        />
                        <Icon name="location-sharp" size={20} color="#A9A9A9" />
                    </View>

                    {/* Start Date Picker */}
                    <TouchableOpacity onPress={showStartDatePicker} className="bg-white p-4 mt-6 rounded-lg shadow-sm flex-row items-center justify-between">
                        <Text className="text-black">
                            {selectedStartDate ? selectedStartDate.toLocaleString('tr-TR', {
                            timeZone: 'Europe/Istanbul'
                            }) : "Başlangıç Tarihi Seçin"}
                        </Text>
                        <Icon name="calendar" size={20} color="#A9A9A9" />
                    </TouchableOpacity>

                    {/* Finish Date Picker */}
                    <TouchableOpacity onPress={showFinishDatePicker} className="bg-white p-4 mt-6 rounded-lg shadow-sm flex-row items-center justify-between">
                        <Text className="text-black">
                            {selectedFinishDate ? selectedFinishDate.toLocaleString() : "Bitiş Tarihi Seçin"}
                        </Text>
                        <Icon name="calendar" size={20} color="#A9A9A9" />
                    </TouchableOpacity>

                    {/* Date Pickers */}
                    {isStartDatePickerVisible && (
                        <DateTimePicker
                            value={selectedStartDate || new Date()}
                            mode="date"
                            onChange={handleStartDateConfirm}
                        />
                    )}

                    {isFinishDatePickerVisible && (
                        <DateTimePicker
                            value={selectedFinishDate || new Date()}
                            mode="date"
                            onChange={handleFinishDateConfirm}
                        />
                    )}

                    {/* Event Description */}
                    <TextInput
                        className="bg-white p-4 mt-6 rounded-lg text-black h-24 shadow-sm"
                        placeholder="Açıklama"
                        value={description}
                        onChangeText={setDescription}
                        placeholderTextColor="#A9A9A9"
                        multiline
                    />

                    {/* Department Selection */}
                    <TouchableOpacity onPress={() => setDepartmentModalVisible(true)} className="bg-white p-4 mt-6 rounded-lg shadow-sm flex-row items-center justify-between">
                        <Text className="text-black">
                            {department.length > 0 ? department.join(", ") : "Bölüm Seçin"}
                        </Text>
                        <Icon name="chevron-down" size={20} color="#A9A9A9" />
                    </TouchableOpacity>

                    {/* Department Modal */}
                    <Modal visible={isDepartmentModalVisible} animationType="slide" transparent>
                        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
                            <View className="bg-white rounded-lg p-6 w-80">
                                <FlatList
                                    data={departmentOptions}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity onPress={() => handleDepartmentSelect(item)} className="p-4">
                                            <Text className="text-black">{item}</Text>
                                        </TouchableOpacity>
                                    )}
                                    keyExtractor={(item) => item}
                                />
                                <TouchableOpacity
                                    onPress={() => setDepartmentModalVisible(false)}
                                    className="mt-4 p-4 bg-blue-500 rounded-full items-center"
                                >
                                    <Text className="text-white">Kapat</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>

                    {/* Create Advert Button */}
                    <TouchableOpacity
                        onPress={handleCreateAdvert}
                        className="mt-6 p-4 bg-blue-500 rounded-full items-center"
                    >
                        <Text className="text-white font-bold">İlanı Oluştur</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
}
