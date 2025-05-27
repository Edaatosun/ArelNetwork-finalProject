import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, Animated, ScrollView, ActivityIndicator, Alert, Image, Dimensions, Linking, Modal } from 'react-native'; // Linking eklendi
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { commonApi, graduateApi } from "../../connector/URL";
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import DefaultJobImage from '../../../assets/images/default_job_image.jpg';
import * as DocumentPicker from 'expo-document-picker';


export default function DetailsEvent() {
    const navigation = useNavigation();
    const route = useRoute();
    const { item_id } = route.params;
    const isEditMode = route.params?.isEditMode || false;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isApplied, setIsApplied] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    const [isEventOwner, setIsEventOwner] = useState(false);
    const [userType, setUserType] = useState(null);

    useEffect(() => {
        const getUserType = async () => {
            const type = await AsyncStorage.getItem('userType');
            setUserType(type);
        };
        getUserType();
    }, []);


    useFocusEffect(
        useCallback(() => {

            const fetchData = async () => {
                await fetchEventDetails();

                const localToken = await AsyncStorage.getItem("token");

                if (userType !== "student") {
                    await checkIsOwner(localToken);
                } else {
                    console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaelse");
                    setIsEventOwner(false);
                }

                console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaa");


                await checkIfApplied(localToken);
            };

            const fetchEventDetails = async () => {
                try {
                    setLoading(true);
                    const localToken = await AsyncStorage.getItem("token");

                    const response = await commonApi.get(`/get/event/${item_id}`, {
                        headers: {
                            'Authorization': `Bearer ${localToken}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    const eventData = response.data.event;
                    setEvent(eventData);
                    console.log("İlan Verisi:", eventData);
                } catch (error) {
                    console.error("İlan verisi alınamadı:", error);
                    setEvent(null);
                    Alert.alert("Hata", "İlan detayları yüklenirken bir sorun oluştu.");
                } finally {
                    setLoading(false);
                }
            };

            const checkIsOwner = async (localToken) => {
                if (!localToken) {
                    console.warn("Token bulunamadı, ilan sahibi kontrolü yapılamıyor.");
                    setIsEventOwner(false);
                    return;
                }

                try {
                    const response = await graduateApi.get(`/events/${item_id}/isOwner`, {
                        headers: {
                            'Authorization': `Bearer ${localToken}`,
                            'Content-Type': 'application/json',
                        },
                    });
                    if (response.status === 200) {
                        const isOwner = response.data.isOwner;
                        setIsEventOwner(isOwner);
                        console.log("İlan sahibi:", isOwner);
                    } else {
                        setIsEventOwner(false);
                        console.log("İlan sahibi değil: false");
                    }
                } catch (error) {
                    console.error("İlan sahibi kontrolü sırasında hata:", error);
                    setIsEventOwner(false);
                    Alert.alert("Hata", "İlan sahibi kontrol edilirken bir sorun oluştu.");
                }
            };

            const checkIfApplied = async (localToken) => {
                try {
                    if (!localToken) {
                        console.warn("Token bulunamadı, başvuru durumu kontrol edilemiyor.");
                        setIsApplied(false);

                        return;
                    }
                    console.log("hdagsfhjg");
                    const response = await commonApi.get(`/check/myEvent/${item_id}`, {
                        headers: {
                            'Authorization': `Bearer ${localToken}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    if (response.status === 200) {
                        setIsApplied(true);
                        console.log("heyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy");
                    } else {
                        setIsApplied(false);
                        console.log("Başvuruldu: false");
                    }
                } catch (error) {
                    console.error("Başvuru durumu kontrol edilirken hata:", error);

                    if (error.response && error.response.status === 404) {
                        setIsApplied(false);

                        console.log("Başvuru bulunamadı (404).");
                    } else {
                        setIsApplied(false);

                        Alert.alert("Hata", "Başvuru durumu kontrol edilirken bir sorun oluştu.");
                    }
                }
            };

            fetchData();

            return () => {
                setEvent(null);
                setIsApplied(false);
                setIsEventOwner(false);

            };
        }, [item_id, userType])
    );

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    const handleApply = async () => {
        setLoading(true); // Yükleme durumunu başlat

        try {
            // JSON formatında body oluştur
            const body = {
                _id: item_id
            };
            const localToken = await AsyncStorage.getItem("token");
            console.log("Gönderilen JSON:", body); // Debug için

            const response = await commonApi.post(`/apply/event`, body, {
                headers: {
                    'Authorization': `Bearer ${localToken}`,
                    'Content-Type': 'application/json', // JSON gönderdiğimiz için gerekli
                },
            });

            if (response.status === 200) {
                setIsApplied(true);
                Alert.alert("Başarılı", response.data.msg || 'Başvurunuz başarıyla alındı!');
            } else {
                Alert.alert("Hata", response.data.msg || 'Başvuru sırasında bir hata oluştu.');
            }
        } catch (error) {
            console.error("Başvuru hatası:", error);
            setIsApplied(false);
            if (error.response?.data?.msg) {
                Alert.alert("Hata", error.response.data.msg);
            } else {
                Alert.alert("Hata", 'Beklenmeyen bir hata oluştu.');
            }
        } finally {
            setLoading(false); // Yükleme durumunu kapat
        }
    };


    const renderRichText = (text, type = 'paragraph') => {
        if (!text) return null;
        const paragraphs = text.split('\n').filter(p => p.trim() !== '');

        return paragraphs.map((paragraph, index) => (
            <Text key={index} className="text-gray-800 text-base leading-relaxed mb-1">
                {type === 'list' && <Text className="text-green-700 text-lg mr-2">• </Text>}
                {paragraph.trim()}
            </Text>
        ));
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#0000ff" />
                <Text className="mt-2 text-gray-600">İlan detayları yükleniyor...</Text>
            </View>
        );
    }

    if (!event) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <Text className="text-black text-lg">İlan verisi alınamadı.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4 p-2 bg-blue-500 rounded-md">
                    <Text className="text-white">Geri Dön</Text>
                </TouchableOpacity>
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
            const response = await graduateApi.delete(`/event/${event._id}`, {
                headers: {
                    'Authorization': `Bearer ${localToken}`,
                    'Content-Type': 'application/json',
                },
            });

            Alert.alert("Başarılı", "Silindi");
            navigation.goBack();
            setLoading(false);
        } catch (err) {
            setLoading(false);
            Alert.alert("Hata", "yeniden deneyiniz!");
            console.error(err);
        }
    };

    const handleCancelApplication = async () => {
        setLoading(true); // Yükleme durumunu başlat

        try {

            const body = {
                _id: item_id
            };
            const localToken = await AsyncStorage.getItem("token");
            console.log("İptal Edilecek JSON:", body);

            const response = await commonApi.post(`/cancel/event`, body, {
                headers: {
                    'Authorization': `Bearer ${localToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 200) {
                setIsApplied(false);
                Alert.alert("Başarılı", response.data.msg || 'Başvurunuz başarıyla iptal edildi!');

            } else {
                Alert.alert("Hata", response.data.msg || 'Başvuru iptali sırasında bir hata oluştu.');
            }
        } catch (error) {
            console.error("Başvuru iptal hatası:", error);
            if (error.response?.data?.msg) {
                Alert.alert("Hata", error.response.data.msg);
            } else {
                Alert.alert("Hata", 'Beklenmeyen bir hata oluştu.');
            }
        } finally {
            setLoading(false); // Yükleme durumunu kapat
        }
    };

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="p-4 flex-row items-center mt-5 bg-white z-10">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={30} color="black" />
                </TouchableOpacity>
                <Text className="text-xl font-bold ml-4">İlan Detayları</Text>

                {isEditMode ? (
                    <View className="flex-row items-center ml-32">
                        <TouchableOpacity onPress={() => navigation.navigate('EditEvent', {
                            item_id: item_id,
                        })}>
                            <Icon name="create-outline" size={28} color="black" />
                        </TouchableOpacity>
                        <TouchableOpacity className="ml-3" onPress={() => setDeleteModalVisible(true)}>
                            <Icon name="trash-outline" size={28} color="red" />
                        </TouchableOpacity>
                    </View>
                ) : null}
            </View>

            <Animated.View style={{ opacity: fadeAnim }} className="flex-1">
                <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                    <View className="w-full flex-row justify-center mt-4">
                        {event.imageUrl ? (
                            <Image
                                source={{ uri: event.imageUrl }}
                                className="w-11/12 h-52 rounded-lg"
                                resizeMode="cover"
                            />
                        ) : (
                            <Image
                                source={DefaultJobImage}
                                className="w-11/12 h-52 rounded-lg"
                                resizeMode="cover"
                            />
                        )}
                    </View>

                    {/* Ayırıcı Çizgi */}
                    <View className="border-b border-gray-300 mx-4 my-4" />

                    {/* Temel Bilgiler (Tek Sütun) */}
                    <View className="p-4">
                        <Text className="text-2xl font-bold mb-4 text-black ">{event.eventTitle}</Text>

                        <View className="flex-row items-center mb-2">
                            <FontAwesome5 name="home" size={20} color="#4B5563" />
                            <Text className="ml-2 text-gray-700 text-base">{event.company}</Text>
                        </View>

                        <View className="flex-row items-center mb-2">
                            <Icon name="location-outline" size={20} color="#4B5563" />
                            <Text className="ml-2 text-gray-700 text-base">{event.location}</Text>
                        </View>

                        <View className="flex-row items-center mb-2">
                            <Icon name="calendar-outline" size={20} color="#4B5563" />
                            <Text className="ml-2 text-gray-700 text-base">
                                {event.fromDate ? new Date(event.fromDate).toLocaleDateString('tr-TR') : 'Tarih Yok'} - {event.toDate ? new Date(event.toDate).toLocaleDateString('tr-TR') : 'Tarih Yok'}
                            </Text>
                        </View>

                        {event.eventField && event.eventField.length > 0 && (
                            <View className="flex-row items-center mb-4">
                                <FontAwesome5 name="building" size={18} color="#4B5563" />
                                <Text className="ml-2 text-gray-700 text-base">
                                    {Array.isArray(event.eventField) ? event.eventField.join(', ') : event.eventField}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Açıklama ve Diğer Detaylar */}
                    <View className="px-4">
                        {event.description && (
                            <View className="mb-4">
                                <Text className="text-lg font-bold text-blue-700 mb-2">Açıklama</Text>
                                {renderRichText(event.description, 'paragraph')}
                            </View>
                        )}

                    </View>
                </ScrollView>
            </Animated.View>


            {!isEditMode && !isEventOwner && (
                <View className="p-4 pt-0 mb-10 mt-2">
                    {isApplied ? (
                        <TouchableOpacity
                            onPress={handleCancelApplication}
                            className="bg-red-600 p-4 rounded-lg items-center justify-center"
                        >
                            <Text className="text-white font-bold text-lg">
                                İptal Et
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            onPress={handleApply}
                            className="bg-blue-600 p-4 rounded-lg items-center justify-center"
                        >
                            <Text className="text-white font-bold text-lg">
                                Katıl
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {isEditMode ? (
                <View className="p-4 pt-0 mb-10 mt-2">
                    <TouchableOpacity
                        onPress={() => navigation.navigate("EventApplicant", { event_id: event._id })}
                        className={`bg-green-600 p-4 rounded-lg items-center justify-center`}
                    >
                        <Text className="text-white font-bold text-lg">
                            Katılımcılar
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : null}



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
        </View>
    );
}