import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, Modal, TouchableWithoutFeedback, BackHandler } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from '@react-navigation/native';
import { commonApi } from '../../connector/URL';
import DropDownPicker from 'react-native-dropdown-picker';
import { ActivityIndicator } from 'react-native-paper';

export default function Home() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');

    //Hangi sekmenin seçili olduğunu tutar
    const [selectedTab, setSelectedTab] = useState('İş İlanları');
    const [showFilterModal, setShowFilterModal] = useState(false);

    const [activities, setActivities] = useState([]);
    const [jobData, setJobData] = useState([]);
    const [internshipData, setInternshipData] = useState([]);

    //Filtre için seçilen veriler
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState(null);

    // DropDownPicker bileşenlerinin açık/kapalı kontrolü
    const [locationOpen, setLocationOpen] = useState(false);
    const [companyOpen, setCompanyOpen] = useState(false);
    const [departmentOpen, setDepartmentOpen] = useState(false);

    //Geri butonu için 
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                return true; // Geri butonu engelle
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => subscription.remove();
        }, [])
    );

    //DropDownPicker için filter datalar
    const uniqueDepartments = useMemo(() => {
        const departments = [
            "Tümü",
            "Bilgisayar Mühendisliği",
            "Elektrik-Elektronik Mühendisliği",
            "Makine Mühendisliği",
            "Endüstri Mühendisliği",
            "İnşaat Mühendisliği",
            "Grafik Tasarım",
            "Finans/Ekonomi"

        ];
        return departments.map(department => ({
            key: department,
            label: department,
            value: department
        }));
    }, []);

    const uniqueLocations = useMemo(() => {
        const cities = [
            "Tümü",
            "İstanbul",
            "Ankara",
            "İzmir",
            "Bursa",
            "Antalya",
            "Konya",
            "Adana",
            "Gaziantep",
            "Mersin",
            "Kayseri",
            "Eskişehir",
            "Samsun",
            "Trabzon",
            "Denizli",
            "Manisa",
            "Sakarya",
            "Kocaeli",
            "Malatya",
            "Erzurum",
            "Aydın",
            "Balıkesir",
            "Çanakkale",
            "Şanlıurfa",
            "Elazığ",
            "Van",
            "Afyonkarahisar",
            "Kütahya",
            "Zonguldak",
            "Tekirdağ"
        ];

        return cities.map(city => ({
            key: city,
            label: city,
            value: city === "Tümü" ? null : city
        }));
    }, []);


    const uniqueCompanies = useMemo(() => {
        const combined = [...jobData, ...internshipData, ...activities];
        const companies = Array.from(new Set(combined.map(item => item.company || item.internCompany).filter(Boolean)));
        return [{ key: "Tümü", label: "Tümü", value: null }, ...companies.map(company => ({ key: company, label: company, value: company }))];
    }, [jobData, internshipData, activities]);

    // Fetch fonksiyonları
    const fetchActivities = async () => {
        setLoading(true);
        try {
            const localToken = await AsyncStorage.getItem("token");
            const response = await commonApi.get('/get/all_event', {
                headers: {
                    'Authorization': `Bearer ${localToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 400 || !response.data.events || response.data.msg) {
                setActivities([]);
            } else {
                setActivities(response.data.events);
            }

        } catch (error) {
            console.log("Etkinlikler alınırken hata oluştu:", error.response || error);
            setActivities([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchJobData = async () => {
        setLoading(true);
        try {
            const localToken = await AsyncStorage.getItem("token");
            const response = await commonApi.get('/get/all_job', {
                headers: {
                    'Authorization': `Bearer ${localToken}`,
                    'Content-Type': 'application/json',
                },
            });
            setJobData(response.data.jobs);

        } catch (error) {
            console.error("İş ilanları alınırken hata oluştu");
            console.log(error);

            if (error.response?.status === 400) {
                await AsyncStorage.removeItem("token");
                await AsyncStorage.removeItem("userType");
                navigation.navigate("MainScreen");
            }
        }
        finally {
            setLoading(false);
        }
    };

    const fetchInternshipData = async () => {
        setLoading(true);
        try {
            const localToken = await AsyncStorage.getItem("token");
            const response = await commonApi.get('/get/all_intern', {
                headers: {
                    'Authorization': `Bearer ${localToken}`,
                    'Content-Type': 'application/json',
                },
            });
            setInternshipData(response.data.interns);
        } catch (error) {
            console.error("Staj ilanları alınırken hata oluştu:", error.response || error);
        }
        finally {
            setLoading(false);
        }
    };

    const fetchFilteredJobData = async () => {
        try {
            const localToken = await AsyncStorage.getItem("token");
            const params = {};

            if (selectedDepartment && selectedDepartment !== 'Tümü') params.jobField = selectedDepartment;
            if (selectedLocation) params.location = selectedLocation;
            if (selectedCompany) params.company = selectedCompany;
            if (searchQuery) params.jobTitle = searchQuery;

            const response = await commonApi.get('/search/job', {
                headers: {
                    'Authorization': `Bearer ${localToken}`,
                    'Content-Type': 'application/json',
                },
                params: params,
            });
            setJobData(response.data.jobs);
        } catch (error) {
            console.error("Filtrelenmiş iş ilanları alınırken hata oluştu:", error.response || error);
            setJobData([]); // Clear data on error
        }
    };

    const fetchFilteredInternData = async () => {
        try {
            const localToken = await AsyncStorage.getItem("token");
            const params = {};

            if (selectedDepartment && selectedDepartment !== 'Tümü') params.internField = selectedDepartment;
            if (selectedLocation) params.location = selectedLocation;
            if (selectedCompany) params.company = selectedCompany;
            if (searchQuery) params.internTitle = searchQuery; // Corrected typo here

            const response = await commonApi.get('/search/intern', {
                headers: {
                    'Authorization': `Bearer ${localToken}`,
                    'Content-Type': 'application/json',
                },
                params: params,
            });
            setInternshipData(response.data.interns);
        } catch (error) {
            console.error("Filtrelenmiş staj ilanları alınırken hata oluştu:", error.response || error);
            setInternshipData([]); // Clear data on error
        }
    };

    const fetchFilteredEventData = async () => {
        try {
            const localToken = await AsyncStorage.getItem("token");
            const params = {};

            if (selectedDepartment && selectedDepartment !== 'Tümü') params.eventField = selectedDepartment;
            if (selectedLocation) params.location = selectedLocation;
            if (selectedCompany) params.company = selectedCompany;
            if (searchQuery) params.eventTitle = searchQuery;

            const response = await commonApi.get('/search/event', {
                headers: {
                    'Authorization': `Bearer ${localToken}`,
                    'Content-Type': 'application/json',
                },
                params: params,
            });
            setActivities(response.data.events);
        } catch (error) {
            console.error("Filtrelenmiş etkinlikler alınırken hata oluştu:", error.response || error);
            setActivities([]); // Clear data on error
        }
    };




    // Seçilen sekmeye göre hangi veriler gösterilecek onu belirler
    const selectedData = useMemo(() => {
        if (selectedTab === 'İş İlanları') {
            return jobData;
        } else if (selectedTab === 'Staj İlanları') {
            return internshipData;
        } else if (selectedTab === 'Etkinlikler') {
            return activities;
        }
        return [];
    }, [selectedTab, jobData, internshipData, activities]);

    // Filtreleri ve arama sorgusunu uygulamak için
    const filteredData = useMemo(() => {
        return selectedData.filter(item => {
            let titleToCheck = '';
            let fieldToCheck = '';
            let locationToCheck = '';
            let companyToCheck = '';

            if (selectedTab === 'İş İlanları') {
                titleToCheck = item.jobTitle || '';
                fieldToCheck = item.jobField || '';
                locationToCheck = item.location || '';
                companyToCheck = item.company || '';
            } else if (selectedTab === 'Staj İlanları') {
                titleToCheck = item.internTitle || '';
                fieldToCheck = item.internField || '';
                locationToCheck = item.location || '';
                companyToCheck = item.internCompany || '';
            } else if (selectedTab === 'Etkinlikler') {
                titleToCheck = item.eventTitle || '';
                fieldToCheck = item.eventField || '';
                locationToCheck = item.location || '';
                companyToCheck = item.company || '';
            }

            const matchesSearchQuery = searchQuery
                ? titleToCheck.toLowerCase().includes(searchQuery.toLowerCase())
                : true;

            const matchesDepartment = selectedDepartment && selectedDepartment !== 'Tümü'
                ? fieldToCheck.toLowerCase().includes(selectedDepartment.toLowerCase())
                : true;

            const matchesLocation = selectedLocation && selectedLocation !== 'Tümü'
                ? locationToCheck.toLowerCase().includes(selectedLocation.toLowerCase())
                : true;

            const matchesCompany = selectedCompany && selectedCompany !== 'Tümü'
                ? companyToCheck.toLowerCase().includes(selectedCompany.toLowerCase())
                : true;

            return matchesSearchQuery && matchesDepartment && matchesLocation && matchesCompany;
        });
    }, [selectedData, searchQuery, selectedDepartment, selectedLocation, selectedCompany, selectedTab]);

    // Filtre iptal butonu
    const fetchAllDataBasedOnTab = useCallback(() => {
        if (selectedTab === 'İş İlanları') {
            fetchJobData();
        } else if (selectedTab === 'Staj İlanları') {
            fetchInternshipData();
        } else if (selectedTab === 'Etkinlikler') {
            fetchActivities();
        }
    }, [selectedTab]);

    // Filtre uygula butonuna basıldığında tetiklenir
    const applyFilters = useCallback(() => {
        if (selectedTab === 'İş İlanları') {
            fetchFilteredJobData();
        } else if (selectedTab === 'Staj İlanları') {
            fetchFilteredInternData();
        } else if (selectedTab === 'Etkinlikler') {
            fetchFilteredEventData();
        }
    }, [selectedTab, selectedDepartment, selectedLocation, selectedCompany, searchQuery]);


    // Sayfa her odaklandığında veri çek
    useFocusEffect(
        useCallback(() => {
            if (selectedDepartment || selectedLocation || selectedCompany || searchQuery.trim()) {
                applyFilters();
            } else {
                fetchAllDataBasedOnTab();
            }
        }, [selectedTab])
    );

    const renderCard = ({ item }) => {
        const isActivity = selectedTab === 'Etkinlikler';
        const isJob = selectedTab === 'İş İlanları';
        const isInternship = selectedTab === 'Staj İlanları';

        let title = '';
        let company = '';
        let location = '';
        let startDate = '';
        let endDate = '';
        let field = '';
        let targetScreen = '';
        let endDateRaw = null;

        // Türlere göre alanlar
        if (isActivity) {
            title = item.eventTitle;
            company = item.company;
            location = item.location;
            startDate = item.fromDate ? new Date(item.fromDate).toLocaleDateString('tr-TR') : 'Tarih Yok';
            endDate = item.toDate ? new Date(item.toDate).toLocaleDateString('tr-TR') : 'Tarih Yok';
            endDateRaw = item.toDate ? new Date(item.toDate) : null;
            field = item.eventField;
            targetScreen = "DetailsEvent";
        } else if (isJob) {
            title = item.jobTitle;
            company = item.company;
            location = item.location;
            startDate = item.fromDate ? new Date(item.fromDate).toLocaleDateString('tr-TR') : 'Tarih Yok';
            endDate = item.toDate ? new Date(item.toDate).toLocaleDateString('tr-TR') : 'Tarih Yok';
            endDateRaw = item.toDate ? new Date(item.toDate) : null;
            field = item.jobField;
            targetScreen = "DetailsJob";
        } else if (isInternship) {
            title = item.internTitle;
            company = item.company;
            location = item.location;
            startDate = item.fromDate ? new Date(item.fromDate).toLocaleDateString('tr-TR') : 'Tarih Yok';
            endDate = item.toDate ? new Date(item.toDate).toLocaleDateString('tr-TR') : 'Tarih Yok';
            endDateRaw = item.toDate ? new Date(item.toDate) : null;
            field = item.internField;
            targetScreen = 'DetailsIntern';
        }

        // aktif pasif yakında başlıkları
        const now = new Date();
        const isExpired = endDateRaw ? endDateRaw < now : false;
        const isUpcoming = item.fromDate ? new Date(item.fromDate) > now : false;

        let statusLabel = 'Aktif';
        let statusColor = 'bg-green-500';

        if (isExpired) {
            statusLabel = 'Pasif';
            statusColor = 'bg-red-500';
        } else if (isUpcoming) {
            statusLabel = 'Yakında';
            statusColor = 'bg-yellow-500';
        }


        return (
            <TouchableOpacity
                className="mb-4 border border-gray-200 rounded-lg"
                onPress={() => navigation.navigate(targetScreen, { item_id: item._id })}
            >
                {/* Üst Satır - Şirket Adı + Aktif/Pasif Etiketi */}
                <View className="flex-row items-center justify-between p-2 bg-gray-100">
                    <Text
                        className="font-bold text-lg text-black flex-1 mr-2"
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {company}
                    </Text>
                    <View className={`px-2 py-1 rounded-full ${statusColor}`}>
                        <Text className="text-white text-xs font-semibold">{statusLabel}</Text>
                    </View>
                </View>

                {/* Kart İçeriği */}
                <View className="bg-white p-4 rounded-b-xl">
                    {/* Başlık */}
                    <View className="items-start mb-1">
                        <Text
                            className="font-bold text-lg text-red-600 mb-2"
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {title}
                        </Text>
                    </View>

                    {/* Lokasyon */}
                    <View className="flex-row items-center mb-2">
                        <Icon name="location" size={16} color="black" />
                        <Text className="ml-2 text-black">{location}</Text>
                    </View>

                    {/* Tarih */}
                    <View className="flex-row items-center mb-2">
                        <Icon name="calendar" size={16} color="black" />
                        <Text className="ml-2 text-black">{startDate} - {endDate}</Text>
                    </View>

                    {/* Branş */}
                    <View className="flex-row items-center mb-4">
                        <FontAwesome5 name="award" size={16} color="black" />
                        <Text className="ml-2 text-black">{field}</Text>
                    </View>

                    {/* Buton */}
                    <TouchableOpacity
                        onPress={() => navigation.navigate(targetScreen, { item_id: item._id })}
                        className="bg-blue-700 rounded-md py-2"
                    >
                        <Text className="text-white text-center font-semibold">İlana Git</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };



    return (
        <View className="flex-1 p-4 bg-white">
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
                <View className="flex-1 bg-gray-100 rounded-lg">
                    <TextInput
                        className="text-lg p-2"
                        placeholder="İlan ara..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <TouchableOpacity className="ml-2 p-2" onPress={() => setShowFilterModal(true)}>
                    <Icon name="filter" size={24} color="black" />
                </TouchableOpacity>

                {showFilterModal && (
                    <Modal
                        visible={showFilterModal}
                        animationType="slide"
                        transparent={true}
                    >
                        <TouchableWithoutFeedback onPress={() => setShowFilterModal(false)}>
                            <View className="flex-1 justify-center items-center bg-black/50">
                                <TouchableWithoutFeedback onPress={() => { }}>
                                    <View className="bg-white rounded-xl w-11/12  h-[450px] p-5 items-center ">
                                        <Text className="text-xl font-bold mb-10 mt-10 text-center">Filtrele</Text>

                                        {/* filtreler için Dropdownlar */}
                                        <DropDownPicker
                                            open={locationOpen}
                                            maxHeight={120}
                                            value={selectedLocation}
                                            items={uniqueLocations}
                                            setOpen={(isOpen) => {
                                                setLocationOpen(isOpen);
                                                setCompanyOpen(false);
                                                setDepartmentOpen(false);
                                            }}
                                            setValue={setSelectedLocation}
                                            placeholder="İl seçin"
                                            zIndex={3000}
                                            zIndexInverse={1000}
                                            style={{ borderColor: '#E5E7EB', height: 50 }}
                                            containerStyle={{ width: '100%', marginBottom: 10 }}
                                            onClose={() => {
                                                setLocationOpen(false);
                                                setShowFilterModal(false);
                                            }}
                                        />

                                        <DropDownPicker
                                            open={departmentOpen}
                                            value={selectedDepartment}
                                            items={uniqueDepartments}
                                            maxHeight={120}
                                            setOpen={(isOpen) => {
                                                setDepartmentOpen(isOpen);
                                                setLocationOpen(false);
                                                setCompanyOpen(false);
                                            }}
                                            setValue={setSelectedDepartment}
                                            placeholder="Bölüm seçin"
                                            zIndex={2000}
                                            zIndexInverse={2000}
                                            style={{ borderColor: '#E5E7EB', height: 50 }}
                                            containerStyle={{ width: '100%', marginTop: 10, marginBottom: 10 }}
                                            onClose={() => {
                                                setDepartmentOpen(false);
                                                setShowFilterModal(false);
                                            }}

                                        />

                                        <DropDownPicker
                                            open={companyOpen}
                                            value={selectedCompany}
                                            items={uniqueCompanies}
                                            maxHeight={120}
                                            setOpen={(isOpen) => {
                                                setCompanyOpen(isOpen);
                                                setLocationOpen(false);
                                                setDepartmentOpen(false);
                                            }}
                                            setValue={setSelectedCompany}
                                            placeholder="Şirket seçin"
                                            zIndex={1000}
                                            zIndexInverse={3000}
                                            style={{ borderColor: '#E5E7EB', height: 50 }}
                                            containerStyle={{ width: '100%', marginTop: 10, marginBottom: 20 }}
                                            onClose={() => {
                                                setCompanyOpen(false);
                                                setShowFilterModal(false);
                                            }}
                                        />

                                        {/* İptal butonu */}
                                        <View className="flex-row justify-between mt-4 w-full">
                                            <TouchableOpacity
                                                onPress={() => {
                                                    setShowFilterModal(false);
                                                    setSelectedLocation(null);
                                                    setSelectedCompany(null);
                                                    setSelectedDepartment(null);
                                                    setSearchQuery('');
                                                    fetchAllDataBasedOnTab();
                                                }}
                                                className="bg-blue-700 flex-1 py-2 rounded-lg ml-2"
                                            >
                                                <Text className="text-white text-center font-semibold">İptal</Text>
                                            </TouchableOpacity>


                                        </View>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>
                )}

            </View>
            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            ) : (
                <FlatList
                    showsVerticalScrollIndicator={false}
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
            )}
        </View>

    );
}