import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import ModalSelector from 'react-native-modal-selector';
import api from "../../connector/URL";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from '@react-navigation/native';
import { formatDate } from '../../components/date';

export default function Home() {
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedTab, setSelectedTab] = useState('İş İlanları');
    const [showSelector, setShowSelector] = useState(false);
    const [activities, setActivities] = useState([]);
    const [jobData, setJobData] = useState([]);
    const [internshipData, setInternshipData] = useState([]);
    // burası filtreleme için array
    const departmentData = [
        { key: "Tümü", label: "Tümü" },
        { key: 'Bilgisayar Mühendisliği', label: 'Bilgisayar Mühendisliği' },
        { key: 'Elektrik Mühendisliği', label: 'Elektrik Mühendisliği' },
        { key: 'Makine Mühendisliği', label: 'Makine Mühendisliği' },
    ];

    let selectedData = [];
    if (selectedTab === 'İş İlanları') {
        selectedData = jobData;
    } else if (selectedTab === 'Staj İlanları') {
        selectedData = internshipData;
    } else if (selectedTab === 'Etkinlikler') {
        selectedData = activities;
    }
    // fetchlerr
    const fetchActivities = async () => {
        try {
            const localToken = await AsyncStorage.getItem("token");
            const response = await api.get('/getAllActivities', {
                headers: {
                    'Authorization': `Bearer ${localToken}`,
                    'Content-Type': 'application/json',
                },
            });
            setActivities(response.data.activities);
        } catch (error) {
            console.error("Etkinlikler alınırken hata oluştu:", error.response || error);
        }
    };

    const fetchJobData = async () => {
        try {
            const localToken = await AsyncStorage.getItem("token");
            const response = await api.get('/getJobs', {
                headers: {
                    'Authorization': `Bearer ${localToken}`,
                    'Content-Type': 'application/json',
                },
            });
            setJobData(response.data.jobs);
        } catch (error) {
            console.error("İş ilanları alınırken hata oluştu:", error.response || error);
        }
    };

    const fetchInternshipData = async () => {
        try {
            const localToken = await AsyncStorage.getItem("token");
            const response = await api.get('/getInternship', {
                headers: {
                    'Authorization': `Bearer ${localToken}`,
                    'Content-Type': 'application/json',
                },
            });
            setInternshipData(response.data.internships);
        } catch (error) {
            console.error("Staj ilanları alınırken hata oluştu:", error.response || error);
        }
    };



    const fetchFilteredJobData = async () => {
        console.log("heyyyyy");
        try {
            const localToken = await AsyncStorage.getItem("token");

            
            const params = {
                jobType: selectedTab === 'İş İlanları' ? 'iş' : 'staj', 
                department: selectedDepartment || '', 
            };
            console.log(params);
            const response = await api.get('/getFilteredJobs', {
                headers: {
                    'Authorization': `Bearer ${localToken}`,
                    'Content-Type': 'application/json',
                },
                params: params, 
            });
            if (selectedTab === "İş İlanları") {
                setJobData(response.data.jobs);
                console.log("aaaaaaaaaaa", jobData);
            }
            else {
                setInternshipData(response.data.jobs);
                console.log("else de", internshipData);
            }

        } catch (error) {
            console.error("İş ilanları alınırken hata oluştu:", error.response || error);
        }
    };

    ////////////////////////////////////////////////////
    // selectedTab değiştikçe burdaki iş ilanınnı seçtiyse iş ilanlarını gösterir

    useFocusEffect(
        React.useCallback(() => {
            if (selectedTab === 'İş İlanları') {
                fetchJobData();
            } else if (selectedTab === 'Staj İlanları') {
                fetchInternshipData();
            }
            else if (selectedTab === 'Etkinlikler') {
                fetchActivities();;
            }
        }, [selectedTab])
    );

   
    // card yapısı
    const renderCard = ({ item }) => {
        const isActivity = selectedTab === 'Etkinlikler';
        const title = item.head;
        const company = item.companyName;
        const location = item.location;
        const startDate = formatDate(item.startDate);
        const endDate = formatDate(item.finishDate);



        return (
            <TouchableOpacity
                className="mb-4"
                onPress={() =>
                    navigation.navigate(isActivity ? 'DetailsActivity' : 'DetailsAdvert', {
                        [isActivity ? 'event_id' : 'advert_id']: item._id
                    })
                }
            >
                <View className="flex-row rounded-t-xl p-4 border-white shadow-xl items-center bg-white">
                    <Image
                        source={item.photo ? { uri: item.photo } : { uri: "https://cdn-icons-png.flaticon.com/512/4709/4709457.png" }}
                        style={{ width: 60, height: 60, borderRadius: 10, borderWidth: 1 }}
                    />
                    <Text className="ml-4 text-lg font-bold" style={{ flexShrink: 1 }} numberOfLines={1} ellipsizeMode="tail">{title}</Text>

                </View>

                <View className="bg-gray-200 p-4 rounded-b-xl">
                    <View className="flex-row items-center mb-1">
                        <Icon name="business" size={16} color="black" />
                        <Text className="ml-2 text-black">{company}</Text>
                    </View>
                    <View className="flex-row items-center mb-2">
                        <Icon name="location" size={16} color="black" />
                        <Text className="ml-2 text-black">{location}</Text>
                    </View>
                    <View className="flex-row items-center mb-2">
                        <Icon name="calendar" size={16} color="black" />
                        <Text className="ml-2 text-black">
                            {startDate}
                            {!isActivity && endDate && ` - ${endDate}`}
                        </Text>
                    </View>
                    
                </View>
            </TouchableOpacity>
        );

    };

    useEffect(() => {
        if (selectedDepartment) {
            console.log("Güncellenmiş Departman:", selectedDepartment);  
            fetchFilteredJobData();  
        }
    }, [selectedDepartment]); 

    const handleSelectorPress = (option) => {
        console.log("hfdbhjv");
        setSelectedDepartment(option.key);
        setShowSelector(false);
    };

    const filteredData = selectedData.filter(item =>
        item.head.toLowerCase().includes(searchQuery.toLowerCase())
    );




    return (
        <View className="flex-1 p-4 bg-gray-100">
            <View className="flex-row justify-between items-center mt-5">
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <Icon name="menu" size={45} />
                </TouchableOpacity>
                <View className="flex-row space-x-2">
                    {['İş İlanları', 'Staj İlanları', 'Etkinlikler'].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setSelectedTab(tab)}
                            className={`p-3 border-b-2 ${selectedTab === tab ? 'border-blue-500' : 'border-transparent'}`}
                        >
                            <Text className={`font-bold ${selectedTab === tab ? 'text-black' : 'text-gray-400'}`}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View className="flex-row items-center my-2">
                <View className="flex-1 bg-white rounded-lg">
                    <TextInput
                        className="text-lg p-2"
                        placeholder="İlan ara..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                {(selectedTab !== 'Etkinlikler') && (
                    <TouchableOpacity className="ml-2 p-2" onPress={() => setShowSelector(true)}>
                        <Icon name="filter" size={24} color="black" />
                    </TouchableOpacity>
                )}
                {showSelector && selectedTab !== 'Etkinlikler' && (
                    <ModalSelector
                        data={departmentData}
                        onChange={(option) => {
                            handleSelectorPress(option);
                        }}
                        onModalClose={() => setShowSelector(false)}
                        visible={showSelector}
                        selectStyle={{ display: 'none' }}
                    />
                )}
            </View>

            <FlatList
            showsVerticalScrollIndicator= {false}
                data={filteredData || []}
                renderItem={renderCard}
                keyExtractor={(item) => item._id}
                extraData={selectedTab}
                ListEmptyComponent={
                    <View className="mt-10 items-center">
                        <Text className="text-gray-500 text-lg font-semibold">
                            {
                                selectedTab === 'İş İlanları' ? 'Herhangi bir iş ilanı bulunmamaktadır.' :
                                    selectedTab === 'Staj İlanları' ? 'Herhangi bir staj ilanı bulunmamaktadır.' :
                                        'Herhangi bir etkinlik bulunmamaktadır.'
                            }
                        </Text>
                    </View>
                }
            />
        </View>
    );
}
