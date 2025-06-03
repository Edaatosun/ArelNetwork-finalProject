// 🔧 Optimize edilmiş DetailsJob bileşeni: Çökme sorunlarına karşı güncellenmiş sürüm

import React, { useEffect, useState, useRef, useCallback } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Image,
    Dimensions,
    Linking,
    Modal,
} from "react-native";
import {
    useFocusEffect,
    useNavigation,
    useRoute,
} from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { commonApi, graduateApi } from "../../connector/URL";
import DefaultJobImage from "../../../assets/images/default_job_image.jpg";
import * as DocumentPicker from "expo-document-picker";

export default function DetailsJob() {
    const navigation = useNavigation();
    const route = useRoute();
    const { item_id } = route.params;
    const isEditMode = route.params?.isEditMode || false;
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isApplied, setIsApplied] = useState(false);
    const [resumeData, setResumeData] = useState(null);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [isJobOwner, setIsJobOwner] = useState(false);
    const [userType, setUserType] = useState(null);
    const isExpired = job?.toDate ? new Date(job.toDate) < new Date() : false;

    useEffect(() => {
        const getUserType = async () => {
            const type = await AsyncStorage.getItem("userType");
            setUserType(type);
        };
        getUserType();
    }, []);

    useEffect(() => {
        if (!userType) return;
        console.log("userType", userType);

        const fetchData = async () => {
            const localToken = await AsyncStorage.getItem("token");
            if (!localToken) return;

            await fetchJobDetails(localToken);

            if (userType !== "student") {
                await checkIsOwner(localToken);
            } else {
                setIsJobOwner(false);
            }

            await checkIfApplied(localToken);
        };

        const fetchJobDetails = async (token) => {
            try {
                setLoading(true);
                const response = await commonApi.get(`/get/job/${item_id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                setJob(response.data.job);
            } catch (error) {
                Alert.alert("Hata", "İlan detayları yüklenirken bir sorun oluştu.");
                setJob(null);
            } finally {
                setLoading(false);
            }
        };

        const checkIsOwner = async (token) => {
            try {
                const response = await graduateApi.get(`/jobs/${item_id}/isOwner`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                setIsJobOwner(response.data.isOwner);
            } catch (error) {
                setIsJobOwner(false);
                Alert.alert("Hata", "İlan sahibi kontrol edilirken bir sorun oluştu.");
            }
        };

        const checkIfApplied = async (token) => {
            try {
                const response = await commonApi.get(`/check/myJob/${item_id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                console.log(response);
                if (response.status === 200 && response.data.message === "Başvuru yapılmış.") {
                    setIsApplied(true);
                    setResumeData(response.data.resume);
                } else if (response.status === 200 && response.data.message === "Başvuru yapılmamış.") {
                    setIsApplied(false);
                    setResumeData(null);
                }
                else {
                    setIsApplied(false);
                    setResumeData(null);
                }
            } catch (error) {
                setIsApplied(false);
                setResumeData(null);
                if (!(error.response && error.response.status === 404)) {
                    Alert.alert(
                        "Hata",
                        "Başvuru durumu kontrol edilirken bir sorun oluştu."
                    );
                }
            }
        };

        fetchData();
    }, [userType]);

    /*  useFocusEffect(
      useCallback(() => {
        if (!userType) return; // userType yüklenmeden fetchData çağrılmasın
  
        const fetchData = async () => {
          const localToken = await AsyncStorage.getItem("token");
          if (!localToken) return;
  
          await fetchJobDetails(localToken);
  
          if (userType !== "student") {
            await checkIsOwner(localToken);
          } else {
            setIsJobOwner(false);
          }
  
          await checkIfApplied(localToken);
        };
  
        const fetchJobDetails = async (token) => {
          try {
            setLoading(true);
            const response = await commonApi.get(`/get/job/${item_id}`, {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });
            if (isActive) {
              setJob(response.data.job);
            }
          } catch (error) {
            if (isActive) {
              Alert.alert("Hata", "İlan detayları yüklenirken bir sorun oluştu.");
              setJob(null);
            }
          } finally {
            if (isActive) setLoading(false);
          }
        };
  
        const checkIsOwner = async (token) => {
          try {
            const response = await graduateApi.get(`/jobs/${item_id}/isOwner`, {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });
            if (isActive) setIsJobOwner(response.data.isOwner);
          } catch (error) {
            if (isActive) {
              setIsJobOwner(false);
              Alert.alert(
                "Hata",
                "İlan sahibi kontrol edilirken bir sorun oluştu."
              );
            }
          }
        };
  
        const checkIfApplied = async (token) => {
          try {
            const response = await commonApi.get(`/check/myJob/${item_id}`, {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });
            if (isActive) {
              if (
                response.status === 200 &&
                response.data.message === "Başvuru yapılmış."
              ) {
                setIsApplied(true);
                setResumeData(response.data.resume);
              } else {
                setIsApplied(false);
                setResumeData(null);
              }
            }
          } catch (error) {
            if (isActive) {
              setIsApplied(false);
              setResumeData(null);
              if (!(error.response && error.response.status === 404)) {
                Alert.alert(
                  "Hata",
                  "Başvuru durumu kontrol edilirken bir sorun oluştu."
                );
              }
            }
          }
        };
  
        fetchData();
        return () => {
          isActive = false;
          setJob(null);
          setIsApplied(false);
          setResumeData(null);
          setIsJobOwner(false);
        };
      }, [item_id, userType])
    ); */

    const handleApply = async () => {
        if (isApplied) {
            // Eğer isApplied true ise, CV'yi gösterme işlevini çalıştır
            if (resumeData) {
                try {
                    const supported = await Linking.canOpenURL(resumeData);
                    if (supported) {
                        await Linking.openURL(resumeData);
                    } else {
                        Alert.alert(
                            "Hata",
                            "CV dosyası açılamıyor veya geçersiz bir bağlantı."
                        );
                    }
                } catch (error) {
                    console.error("CV açılırken hata:", error);
                    Alert.alert("Hata", "CV'yi açarken bir sorun oluştu.");
                }
            } else {
                Alert.alert(
                    "Bilgi",
                    "Başvurunuz onaylandı ancak CV dosyası bulunamadı."
                );
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
                type: "application/pdf", // Sadece PDF dosyaları
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
            formData.append("_id", item_id); // Backend'de req.body.jobId olarak alınacak
            formData.append("resume", {
                // Backend'de req.file olarak alınacak
                uri: uri,
                name: name,
                type: mimeType || "application/pdf", // mimeType bulunamazsa varsayılan
            });

            console.log("Gönderilen FormData:", formData); // Debug için

            const response = await commonApi.post(`/apply/job`, formData, {
                headers: {
                    Authorization: `Bearer ${localToken}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.status === 200) {
                setIsApplied(true);
                setResumeData(response.data.resume); // Backend'den gelen CV URL'sini kaydet
                Alert.alert(
                    "Başarılı",
                    response.data.msg || "Başvurunuz başarıyla alındı!"
                );
            } else {
                Alert.alert(
                    "Hata",
                    response.data.msg || "Başvuru sırasında bir hata oluştu."
                );
            }
        } catch (error) {
            console.error("Başvuru hatası:", error);
            // Hata durumunda başvurulmamış kabul et
            setIsApplied(false);
            setResumeData(null);
            if (error.response && error.response.data && error.response.data.msg) {
                Alert.alert("Hata", error.response.data.msg);
            } else {
                Alert.alert("Hata", "Beklenmeyen bir hata oluştu.");
            }
        } finally {
            setLoading(false); // Yükleme durumunu kapat
        }
    };

    const renderRichText = (text, type = "paragraph") => {
        if (!text) return null;
        const paragraphs = text.split("\n").filter((p) => p.trim() !== "");

        return paragraphs.map((paragraph, index) => (
            <Text
                key={index}
                className="text-gray-800 text-base leading-relaxed mb-1"
            >
                {type === "list" && (
                    <Text className="text-green-700 text-lg mr-2">• </Text>
                )}
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

    if (!job) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <Text className="text-black text-lg">İlan verisi alınamadı.</Text>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="mt-4 p-2 bg-blue-500 rounded-md"
                >
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
            console.log();
            console.log(job._id);
            const response = await graduateApi.delete(`/job/${job._id}`, {
                headers: {
                    Authorization: `Bearer ${localToken}`,
                    "Content-Type": "application/json",
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
                        <TouchableOpacity
                            onPress={() =>
                                navigation.navigate("EditJob", {
                                    item_id: item_id,
                                })
                            }
                        >
                            <Icon name="create-outline" size={28} color="black" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="ml-3"
                            onPress={() => setDeleteModalVisible(true)}
                        >
                            <Icon name="trash-outline" size={28} color="red" />
                        </TouchableOpacity>
                    </View>
                ) : null}
            </View>

            <View className="flex-1">
                <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                    <View className="w-full flex-row justify-center mt-4">
                        {job.imageUrl ? (
                            <Image
                                source={{ uri: job.imageUrl }}
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
                        <Text className="text-2xl font-bold mb-4 text-black ">
                            {job.jobTitle}
                        </Text>

                        <View className="flex-row items-center mb-2">
                            <FontAwesome5 name="home" size={20} color="#4B5563" />
                            <Text className="mx-2 text-gray-700 text-base">
                                {job.company}
                            </Text>
                        </View>

                        <View className="flex-row items-center mb-2">
                            <Icon name="location-outline" size={20} color="#4B5563" />
                            <Text className="mx-2 text-gray-700 text-base">
                                {job.location}
                            </Text>
                        </View>

                        <View className="flex-row items-center mb-2">
                            <Icon name="calendar-outline" size={20} color="#4B5563" />
                            <Text className="mx-2 text-gray-700 text-base">
                                {job.fromDate
                                    ? new Date(job.fromDate).toLocaleDateString("tr-TR")
                                    : "Tarih Yok"}{" "}
                                -{" "}
                                {job.toDate
                                    ? new Date(job.toDate).toLocaleDateString("tr-TR")
                                    : "Tarih Yok"}
                            </Text>
                        </View>

                        {job.jobField && job.jobField.length > 0 && (
                            <View className="flex-row items-center mb-4">
                                <FontAwesome5 name="building" size={18} color="#4B5563" />
                                <Text className="mx-2 text-gray-700 text-base">
                                    {Array.isArray(job.jobField)
                                        ? job.jobField.join(", ")
                                        : job.jobField}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Açıklama ve Diğer Detaylar */}
                    <View className="px-4">
                        {job.description && (
                            <View className="mb-4">
                                <Text className="text-lg font-bold text-blue-700 mb-2">
                                    Açıklama
                                </Text>
                                {renderRichText(job.description, "paragraph")}
                            </View>
                        )}
                    </View>
                </ScrollView>
            </View>


            {!isEditMode && !isJobOwner && (
                <View className="p-4 pt-0 mb-10 mt-2">
                    {isExpired ? (
                        <View className="bg-gray-400 p-4 rounded-lg items-center justify-center">
                            <Text className="text-white font-bold text-lg">İlan süresi dolmuştur</Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            onPress={handleApply}
                            disabled={isApplied && !resumeData}
                            className={`${isApplied && resumeData ? 'bg-green-600' : (isApplied ? 'bg-gray-400' : 'bg-blue-600')} p-4 rounded-lg items-center justify-center`}
                        >
                            <Text className="text-white font-bold text-lg">
                                {isApplied ? (resumeData ? 'CV\'yi GÖR' : 'Başvuruldu (CV Yok)') : 'CV Gönder'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}


            {isEditMode ? (
                <View className="p-4 pt-0 mb-10 mt-2">
                    <TouchableOpacity
                        onPress={() => navigation.navigate("JobApplicant", { job_id: job._id })}
                        className={`bg-green-600 p-4 rounded-lg items-center justify-center`}
                    >
                        <Text className="text-white font-bold text-lg">
                            Başvurular
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
                        <Text className="text-[#F76C6A] font-bold text-sm">
                            Etkinliği Sil
                        </Text>
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