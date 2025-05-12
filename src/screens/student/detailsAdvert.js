import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../connector/URL";

export default function DetailsAdvert() {
    const navigation = useNavigation();
    const route = useRoute();
    const { advert_id } = route.params;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [advert, setAdvert] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isApplied, setIsApplied] = useState();

    useEffect(() => {
        const fetchActivityDetails = async () => {
            try {
                setLoading(true);
                const localToken = await AsyncStorage.getItem("token");

                const response = await api.get(`/getJobs/${advert_id}`, {
                    headers: {
                        'Authorization': `Bearer ${localToken}`,
                        'Content-Type': 'application/json',
                    },
                });

                const activityData = response.data.job;
                setAdvert(activityData);
                console.log(response.data.job);
            } catch (error) {
                console.error("Aktivite verisi alınamadı:", error);
                setAdvert(null);
            } finally {
                setLoading(false);
            }
        };

        const checkIfApplied = async () => {
            console.log("heyyy");
            try {
                const localToken = await AsyncStorage.getItem("token");

                const response = await api.get(`/check-application/${advert_id}`, {
                    headers: {
                        'Authorization': `Bearer ${localToken}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.data.isApplied === true) {
                    setIsApplied(true);
                    console.log("trueee");
                } else {
                    setIsApplied(false);
                    console.log("falseeee");
                }
            } catch (error) {
                console.log("eroor");
                console.error("Başvuru durumu kontrol edilirken hata:", error);
            }
        };

        fetchActivityDetails();
        checkIfApplied();
    }, [advert_id]);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, []);



    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (!advert) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <Text className="text-black text-lg">İlan verisi alınamadı.</Text>
            </View>
        );
    }

    const handleApply = async () => {
        setIsApplied(true);
        try {
            const localToken = await AsyncStorage.getItem("token");
            const response = await api.post(`/apply/${advert_id}`, {}, {
                headers: {
                    'Authorization': `Bearer ${localToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 200) {
                alert(response.data.msg || 'Başvuru başarılı!');
            }
            else {
                setIsApplied(false);
            }
        } catch (error) {
            setIsApplied(false);

            // Hata mesajını backend'den al ve göster
            if (error.response && error.response.data && error.response.data.msg) {
                alert(error.response.data.msg);
            } else {
                alert('Beklenmeyen bir hata oluştu.');
            }
        }
    };

    return (
        <View className="flex-1 bg-white">
            <View className="p-4 flex-row items-center mt-5">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={30} color="black" />
                </TouchableOpacity>
                <Text className="text-xl font-bold ml-4">İlan Detayları</Text>
            </View>

            <Animated.View style={{ opacity: fadeAnim }} className="flex-1 p-4">
                <View className="bg-gray-200/50  rounded-lg p-4 shadow ">
                    <Text className="text-lg font-bold mb-2 text-blue-600">{advert.head}</Text>
                    <View className="flex-row items-center mb-1">
                        <Icon name="business" size={16} color="black" />
                        <Text className="ml-2 text-gray-700">{advert.companyName}</Text>
                    </View>
                    <View className="flex-row items-center mb-1">
                        <Icon name="location" size={16} color="black" />
                        <Text className="ml-2 text-gray-700">{advert.location}</Text>
                    </View>
                    <View className="flex-row items-center mb-2">
                        <Icon name="calendar" size={16} color="black" />
                        <Text className="ml-2 text-gray-700">
                            {new Date(advert.startDate).toLocaleDateString()} - {new Date(advert.finishDate).toLocaleDateString()}
                        </Text>
                    </View>
                </View>

                <View className="border-b border-gray-300 my-1" />

                <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 5 }}>
                    <Text className="text-sm font-bold text-green-700 mb-1">Bölüm</Text>
                    <Text className="text-gray-800 text-sm">{advert.department.join(', ')}</Text>

                    <View className="border-b border-gray-300 my-2" />
                    <Text className="text-lg font-bold text-green-700 mb-1">Açıklama</Text>
                    <Text className="text-gray-800">{advert.description}</Text>
                </ScrollView>
            </Animated.View>

            <View className="p-4 mb-10">
                <TouchableOpacity
                    onPress={handleApply}
                    disabled={isApplied}
                    className={`${isApplied ? 'bg-gray-400' : 'bg-blue-500'} p-4 rounded-lg  items-center`}
                >
                    <Text className="text-white font-bold">
                        {isApplied ? 'Başvuruldu' : 'Başvur'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
