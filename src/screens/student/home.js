import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, Modal, TouchableWithoutFeedback } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import ModalSelector from 'react-native-modal-selector'; // This might not be needed if using DropDownPicker exclusively
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from '@react-navigation/native';
import { formatDate } from '../../components/date';
import { commonApi } from '../../connector/URL';
import DropDownPicker from 'react-native-dropdown-picker';

export default function Home() {
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');

    const [selectedTab, setSelectedTab] = useState('İş İlanları');
    const [showFilterModal, setShowFilterModal] = useState(false); // Renamed for clarity

    const [activities, setActivities] = useState([]);
    const [jobData, setJobData] = useState([]);
    const [internshipData, setInternshipData] = useState([]);

    const [selectedLocation, setSelectedLocation] = useState(null);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState(null); // Changed initial state to null

    const [locationOpen, setLocationOpen] = useState(false);
    const [companyOpen, setCompanyOpen] = useState(false);
    const [departmentOpen, setDepartmentOpen] = useState(false);

    // Filter data for DropDownPickers
    const uniqueDepartments = useMemo(() => {
        const departments = [
            "Tümü", // Add "Tümü" option for departments
            "Bilgisayar Mühendisliği",
            "Elektrik-Elektronik Mühendisliği",
            "Makine Mühendisliği",
            "Endüstri Mühendisliği",
            "İnşaat Mühendisliği"

        ];
        return departments.map(department => ({
            key: department,
            label: department,
            value: department
        }));
    }, []);

    const uniqueLocations = useMemo(() => {
        const combined = [...jobData, ...internshipData, ...activities];
        const locations = Array.from(new Set(combined.map(item => item.location).filter(Boolean)));
        return [{ key: "Tümü", label: "Tümü", value: null }, ...locations.map(location => ({
            key: location,
            label: location,
            value: location,
        }))];
    }, [jobData, internshipData, activities]);

    const uniqueCompanies = useMemo(() => {
        const combined = [...jobData, ...internshipData, ...activities];
        const companies = Array.from(new Set(combined.map(item => item.company || item.internCompany).filter(Boolean)));
        return [{ key: "Tümü", label: "Tümü", value: null }, ...companies.map(company => ({ key: company, label: company, value: company }))];
    }, [jobData, internshipData, activities]);


    // Fetch functions
    const fetchActivities = async () => {
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
        }
    };

    const fetchJobData = async () => {
        try {
            const localToken = await AsyncStorage.getItem("token");
            const response = await commonApi.get('/get/all_job', {
                headers: {
                    'Authorization': `Bearer ${localToken}`,
                    'Content-Type': 'application/json',
                },
            });
            setJobData(response.data.jobs);
            console.log(response.data.jobs);
        } catch (error) {
            console.error("İş ilanları alınırken hata oluştu");
            console.log(error);

            if (error.response?.status === 400) {
                await AsyncStorage.removeItem("token");
                await AsyncStorage.removeItem("userType");
                navigation.navigate("MainScreen");
            }
        }
    };

    const fetchInternshipData = async () => {
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

    // Determine which data to display based on the selected tab
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

    // Apply filters and search query
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

    // Function to fetch all data based on the current tab (for "İptal" button)
    const fetchAllDataBasedOnTab = useCallback(() => {
        if (selectedTab === 'İş İlanları') {
            fetchJobData();
        } else if (selectedTab === 'Staj İlanları') {
            fetchInternshipData();
        } else if (selectedTab === 'Etkinlikler') {
            fetchActivities();
        }
    }, [selectedTab]);

    // Function to apply filters from the modal
    const applyFilters = useCallback(() => {
        if (selectedTab === 'İş İlanları') {
            fetchFilteredJobData();
        } else if (selectedTab === 'Staj İlanları') {
            fetchFilteredInternData();
        } else if (selectedTab === 'Etkinlikler') {
            fetchFilteredEventData();
        }
    }, [selectedTab, selectedDepartment, selectedLocation, selectedCompany, searchQuery]);


    // Sekme değiştiğinde veya filtreler değiştiğinde ilgili veriyi fetch et
    useFocusEffect(
        useCallback(() => {
            // If filters are applied, fetch filtered data
            if (selectedDepartment || selectedLocation || selectedCompany || searchQuery.trim()) {
                applyFilters();
            } else {
                // Otherwise, fetch all data for the selected tab
                fetchAllDataBasedOnTab();
            }
        }, [selectedTab])
    );

    // card yapısı
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

        if (isActivity) {
            title = item.eventTitle;
            company = item.company;
            location = item.location;
            startDate = formatDate(item.fromDate);
            endDate = formatDate(item.toDate);
            field = item.eventField;
            targetScreen = "DetailsEvent";

        } else if (isJob) {
            title = item.jobTitle;
            company = item.company;
            location = item.location;
            startDate = formatDate(item.fromDate);
            endDate = formatDate(item.toDate);
            field = item.jobField;
            targetScreen = "DetailsJob";

        } else if (isInternship) {
            title = item.internTitle;
            company = item.internCompany;
            location = item.location;
            startDate = formatDate(item.fromDate);
            endDate = formatDate(item.toDate);
            field = item.internField;
            targetScreen = 'DetailsInternship';
        }

        return (
            <TouchableOpacity
                className="mb-4 border border-gray-200 rounded-lg"
                onPress={() =>
                    navigation.navigate(targetScreen, {
                        item_id: item._id
                    })
                }
            >
                {/* Üst - Şirket İsmi */}
                <View className="flex-row items-center p-2 bg-gray-100 ">
                    <Text className="ml-2 font-bold text-lg text-black">{company}</Text>
                </View>

                {/* Alt - İçerik */}
                <View className="bg-white p-4 rounded-b-xl">
                    {/* Başlık */}
                    <View className=" items-start mb-1">
                        <Text
                            className="font-bold text-lg text-red-600 mb-2"
                            style={{ flexShrink: 1 }}
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

                    <View className="flex-row items-center mb-2">
                        <Icon name="calendar" size={16} color="black" />
                        <Text className="ml-2 text-black">
                            {startDate}
                            {!isActivity && endDate && ` - ${endDate}`}
                        </Text>
                    </View>

                    {/* Branş */}

                    <View className="flex-row items-center mb-4">
                        <FontAwesome5 name="award" size={16} color="black" />
                        <Text className="ml-2 text-black">{field}</Text>
                    </View>

                    <TouchableOpacity onPress={() =>
                        navigation.navigate(targetScreen, {
                            item_id: item._id
                        })
                    } className="bg-blue-700 rounded-md py-2">
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

                                        {/* Dropdowns for filters */}
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

                                        {/* Buttons */}
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
        </View>
    );
}