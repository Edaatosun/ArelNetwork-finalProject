import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Animated, ActivityIndicator, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../connector/URL";
import { formatDate } from '../../components/date';

export default function DetailsActivity() {
    const route = useRoute();
    const event_id  = route.params;
    const isEditMode = route.params?.isEditMode || false;
    const navigation = useNavigation();
    const fadeAnim = new Animated.Value(0); 
    const [loading, setLoading] = useState(false);
    const [event, setEvent] = useState();


    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    

    useEffect(() => {
        const fetchActivityDetails = async () => {
            try {
                console.log("heyyyyyy");
                setLoading(true);
                const localToken = await AsyncStorage.getItem("token");
                console.log("Token:", localToken);

                const response = await api.get(`/getActivity/${event_id.event_id}`, {
                    headers: {
                        'Authorization': `Bearer ${localToken}`,
                        'Content-Type': 'application/json',
                    },
                });
    
                console.log("API'den gelen veri:", response.data);
    
                const activityData = response.data.activity;
                console.log("//////////////",activityData);
                setEvent(activityData);
            } catch (error) {
                console.error("Aktivite verisi alınamadı:", error);
                setEvent(null);
            } finally {
                setLoading(false);
            }
        };
    
        if (event_id) {
            fetchActivityDetails();
        }
    }, []);

    useEffect(() => {
        if (event) {
           
            console.log('Etkinlik verisi güncellendi:', event);
    
            
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        }
    }, [event]); 
    
    
    if (!event) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-900">
                <Text className="text-white text-lg">Etkinlik verisi alınamadı.</Text>
            </View>
        );
    }
    
    const handleDelete = async () => {
        try {
            setLoading(true);
            console.log("heyyyy");
            setDeleteModalVisible(false); 
            const localToken = await AsyncStorage.getItem("token");
            console.log()
            console.log(event._id);
            const response = await api.delete(`/deleteActivity/${event._id}`, {
                headers: {
                    'Authorization': `Bearer ${localToken}`,
                    'Content-Type': 'application/json',
                },
            });

            Alert.alert("Başarılı", response.data.msg);
            navigation.goBack();
            setLoading(false);
        } catch (err) {
            setLoading(false);
            Alert.alert("Hata", response.data.msg);
            console.error(err);
        }
    };

   

    const renderImage = (photoUrl) => {
        const validUrl = photoUrl && photoUrl.trim() !== "" ? photoUrl : 'https://example.com/placeholder-image.png'; 
        return (
            <Image
                source={{ uri: validUrl }}
                className="w-36 h-36 rounded-full border-2 bg-white"
                style={{ resizeMode: 'cover' }}
            />
        );
    };

    return (
        <ScrollView className="flex-1 bg-gray-800 p-4">
            <View className="flex-row justify-between items-center mt-6 px-2">
                <View className="flex-row items-center">
                    {/* Geri Dön Butonu */}
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                        <Icon name="arrow-back" size={30} color="white" />
                    </TouchableOpacity>

                    {/* Başlık */}
                    <Text className="text-xl text-white font-bold">Aktivite Detayları</Text>
                </View>

                {isEditMode ? (
                    <View className="flex-row items-center ml-20">
                        <TouchableOpacity onPress={() => navigation.navigate('EditActivity', {
                            event: event, // Düzenlenecek etkinlik
                        })}>
                            <Icon name="create-outline" size={28} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity className="ml-3" onPress={() => setDeleteModalVisible(true)}>
                            <Icon name="trash-outline" size={28} color="red" />
                        </TouchableOpacity>
                    </View>
                ) : null}
            </View>


            <View className="flex-1 justify-center items-center mb-6 mt-10">
                {renderImage(event.photo)}
            </View>

            <Animated.View style={{ opacity: fadeAnim }} className="mb-6">
                <Text className="text-4xl font-extrabold text-indigo-500">{event.head}</Text>
                <View className="flex-row items-center mt-2">
                    <Icon name="location-outline" size={22} color="#FF6347" />
                    <Text className="ml-2 text-lg text-gray-300">{event.location}</Text>
                </View>
                <View className="flex-row items-center mt-1">
                    <Icon name="calendar" size={22} color="#FF6347" />
                    <Text className="ml-2 text-lg text-gray-300">{formatDate(event.startDate)}</Text>
                </View>
            </Animated.View>

            <View className="border-b border-gray-500 my-2" />

            <Animated.View style={{ opacity: fadeAnim }} className="rounded-xl">
                <Text className="text-xl font-bold text-[#FF6347] mb-2">Organizasyon Sahibi:</Text>
                <Text className="text-lg text-white">{event.organizerFullName}</Text>
                <Text className="text-lg text-white">{event.contactInfo}</Text>
            </Animated.View>

            <View className="border-b border-gray-500 my-4" />

            <Animated.View style={{ opacity: fadeAnim }} className="mb-6">
                <Text className="text-lg font-bold text-green-500 mb-1">Açıklama</Text>
                <Text className="text-lg text-white">{event.description}</Text>
            </Animated.View>

            {loading && (
                <View className="mt-4">
                    <ActivityIndicator size="large" color="#FF6347" />
                </View>
            )}
            <Modal
                animationType="fade"
                transparent={true}
                visible={deleteModalVisible}
                onRequestClose={() => setDeleteModalVisible(false)}
            >
                <View className="flex-1 justify-end items-center bg-black/50">
                    <TouchableOpacity
                        className="bg-white p-5 rounded-2xl w-[80%] items-center my-2"
                        onPress={handleDelete}
                    >
                        <Text className="text-[#F76C6A] font-bold text-sm">Etkinliği Sil</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="bg-white p-5 rounded-2xl w-[80%] items-center my-2 mb-10"
                        onPress={() => setDeleteModalVisible(false)}
                    >
                        <Text className="text-[#00FF19] opacity-50 text-sm">İptal</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </ScrollView>
    );
}
