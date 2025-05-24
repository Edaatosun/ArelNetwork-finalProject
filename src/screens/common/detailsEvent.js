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
    const [loading, setLoading] = useState(true);
    const [isApplied, setIsApplied] = useState(false);
    const [resumeData, setResumeData] = useState(null);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    useFocusEffect(
        useCallback(() => {
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

            const checkIfApplied = async () => {
                try {
                    const localToken = await AsyncStorage.getItem("token");
                    if (!localToken) {
                        console.warn("Token bulunamadı, başvuru durumu kontrol edilemiyor.");
                        setIsApplied(false);
                        setResumeData(null);
                        return;
                    }

                    const response = await commonApi.get(`/check/myEvent/${item_id}`, {
                        headers: {
                            'Authorization': `Bearer ${localToken}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    if (response.status === 200 && response.data.message === "Başvuru yapılmış.") {
                        setIsApplied(true);
                        setResumeData(response.data.resume);
                        console.log("Başvuruldu: true, CV Yolu:", response.data.resume);
                    } else {
                        setIsApplied(false);
                        setResumeData(null);
                        console.log("Başvuruldu: false");
                    }
                } catch (error) {
                    console.error("Başvuru durumu kontrol edilirken hata:", error);
                    if (error.response && error.response.status === 404) {
                        setIsApplied(false);
                        setResumeData(null);
                        console.log("Başvuru bulunamadı (404).");
                    } else {
                        setIsApplied(false);
                        setResumeData(null);
                        Alert.alert("Hata", "Başvuru durumu kontrol edilirken bir sorun oluştu.");
                    }
                }
            };

            fetchEventDetails();
            checkIfApplied();

            // cleanup function (isteğe bağlı, odaktan çıkıldığında çalışır)
            return () => {
                setEvent(null);
                setIsApplied(false);
                setResumeData(null);
            };
        }, [item_id])
    );

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    const handleApply = async () => {
        if (isApplied) {
            // Eğer isApplied true ise, CV'yi gösterme işlevini çalıştır
            if (resumeData) {
                try {
                    const supported = await Linking.canOpenURL(resumeData);
                    if (supported) {
                        await Linking.openURL(resumeData);
                    } else {
                        Alert.alert("Hata", "CV dosyası açılamıyor veya geçersiz bir bağlantı.");
                    }
                } catch (error) {
                    console.error("CV açılırken hata:", error);
                    Alert.alert("Hata", "CV'yi açarken bir sorun oluştu.");
                }
            } else {
                Alert.alert("Bilgi", "Başvurunuz onaylandı ancak CV dosyası bulunamadı.");
            }
            return;
        }

        // isApplied false ise, başvuru yapma işlevini çalıştır
        setLoading(true); // Yükleme durumunu başlat

        try {
            const localToken = await AsyncStorage.getItem("token");
            if (!localToken) {
                Alert.alert("Hata", "Giriş yapmanız gerekiyor.");
                return;
            }

            // CV seçiciyi aç
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf', // Sadece PDF dosyaları
                copyToCacheDirectory: true, // Android'de dosya yolunu alabilmek için
            });

            if (result.canceled) {
                Alert.alert("Bilgi", "CV seçimi iptal edildi.");
                setLoading(false); // Yükleme durumunu kapat
                return;
            }

            const { uri, name, mimeType, size } = result.assets[0];

            // FormData oluştur
            const formData = new FormData();
            formData.append('_id', item_id);
            formData.append('resume', {
                uri: uri,
                name: name,
                type: mimeType || 'application/pdf', // mimeType bulunamazsa varsayılan
            });

            console.log("Gönderilen FormData:", formData); // Debug için

            const response = await commonApi.post(`/apply/event`, formData, {
                headers: {
                    'Authorization': `Bearer ${localToken}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                setIsApplied(true);
                setResumeData(response.data.resume); // Backend'den gelen CV URL'sini kaydet
                Alert.alert("Başarılı", response.data.msg || 'Başvurunuz başarıyla alındı!');
            } else {
                Alert.alert("Hata", response.data.msg || 'Başvuru sırasında bir hata oluştu.');
            }
        } catch (error) {
            console.error("Başvuru hatası:", error);
            // Hata durumunda başvurulmamış kabul et
            setIsApplied(false);
            setResumeData(null);
            if (error.response && error.response.data && error.response.data.msg) {
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


            {!isEditMode && (
                <View className="p-4 pt-0 mb-10 mt-2">
                    <TouchableOpacity
                        onPress={handleApply}
                        disabled={isApplied && !resumeData} // Eğer başvurulduysa ama CV yoksa disabled olmasın
                        className={`${isApplied && resumeData ? 'bg-green-600' : (isApplied ? 'bg-gray-400' : 'bg-blue-600')} p-4 rounded-lg items-center justify-center`}
                    >
                        <Text className="text-white font-bold text-lg">
                            {isApplied ? (resumeData ? 'CV\'yi GÖR' : 'Başvuruldu (CV Yok)') : 'CV Gönder'}
                        </Text>
                    </TouchableOpacity>
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
        </View>
    );
}