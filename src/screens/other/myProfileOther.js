import { useState, useEffect } from "react";
import { Text, View, Image, TouchableOpacity, Button, Linking, Alert, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from "@react-navigation/native";
import * as DocumentPicker from 'expo-document-picker';
import { graduateApi, uploadApi } from "../../connector/URL.js";
import default_image_background from "../../../assets/images/profile_background.jpg"

export default function ProfileOther() {
    const [userInfo, setUserInfo] = useState(null);
    const [photo, setPhoto] = useState(null);
    const [cvUrl, setCvUrl] = useState(null);
    const navigation = useNavigation();

    // Kullanıcının bilgileri için fetch
    const fetchUserInfo = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            const response = await graduateApi.get("/me", {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.data && response.data.info) {
                setUserInfo(response.data.info);
                // Önbelleği kırmak için zaman ekliyoruz
                const photoUrl = response.data.info.photo
                    ? `${response.data.info.photo}?t=${Date.now()}`
                    : null;
                setPhoto(photoUrl);
                setCvUrl(response.data.info.resume);
            }
        } catch (error) {
            console.error("Kullanıcı bilgileri çekilirken hata:", error);
        }
    };

    // Sayfa ilk yüklendiğinde bilgileri çek
    useEffect(() => {
        fetchUserInfo();
    }, []);

    // izin kısmı
    const pickImage = async () => {
        const resultAccess = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (resultAccess.status === "granted") {
            openGallery();
        } else {
            Alert.alert(
                "İzin Gerekli",
                "Galeriye erişim izni vermelisiniz.",
                [
                    {
                        text: "Tamam",
                        onPress: () => {
                            Linking.openSettings();
                        },
                    },
                    { text: "İptal", style: "cancel" }
                ]
            );
        }
    };

    // Galeri açılıp fotoğraf seçme ve yükleme
    const openGallery = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeImagesAndVideos,
                allowsEditing: true,
                aspect: [3, 3],
                quality: 0.5,
            });

            if (!result.canceled) {
                const photoUri = result.assets[0].uri;
                const fileName = result.assets[0].fileName || `photo_${Date.now()}.jpg`;

                const photoFile = {
                    uri: photoUri,
                    type: 'image/jpeg',
                    name: fileName,
                };

                const formData = new FormData();
                formData.append('photo', photoFile);

                const token = await AsyncStorage.getItem("token");

                try {
                    const response = await uploadApi.post('/photo', formData, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data',
                        },
                    });

                    const responseData = response.data;
                    if (response.status === 200 && responseData.photoUrl) {
                        setPhoto(responseData.photoUrl);
                        alert("Fotoğraf başarıyla güncellendi.");
                        fetchUserInfo();
                    } else {
                        console.error("Sunucu hatası:", responseData);
                        alert("Resim yüklenirken sunucu hatası oluştu.");
                    }
                } catch (error) {
                    console.error("Resim yüklenirken ağ hatası:", error);
                    alert("Resim yüklenirken bir ağ hatası oluştu.");
                }
            }
        } catch (error) {
            console.error("Galeriyi açarken hata:", error);
        }
    };

    // CV yükleme fonskiyonu
    const uploadCV = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
            });

            if (!result.canceled && result.assets.length > 0) {
                const fileUri = result.assets[0].uri;
                const fileName = result.assets[0].name || `${Date.now()}.pdf`;

                const formData = new FormData();
                formData.append('resume', {
                    uri: fileUri,
                    name: fileName,
                    type: 'application/pdf',
                });

                const token = await AsyncStorage.getItem("token");

                const response = await uploadApi.post('/resume', formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                });

                const responseData = response.data;
                if (response.status === 200 && responseData.resumeUrl) {
                    setCvUrl(responseData.resumeUrl);
                    alert("CV başarıyla yüklendi.");
                    fetchUserInfo();
                } else {
                    console.error("Sunucu hatası:", responseData);
                    alert("CV yüklenirken sunucu hatası oluştu.");
                }
            }
        } catch (error) {
            console.error("CV yüklenirken hata:", error);
            alert("CV yüklenirken bir hata oluştu.");
        }
    };

    // CV'yi görüntüle
    const openCvProfile = () => {
        if (cvUrl) {
            Linking.openURL(cvUrl).catch(err => {
                console.error("CV açılırken hata oluştu:", err);
                Alert.alert("Hata", "CV açılamadı. Cihazınızda PDF görüntüleyici olduğundan emin olun veya URL'yi kontrol edin.");
            });
        } else {
            Alert.alert("Hata", "Görüntülenecek bir CV bulunamadı.");
        }
    };

    // CV silme
    const deleteCV = () => {
        Alert.alert(
            "CV'yi Sil",
            "Yüklü CV'nizi silmek istediğinizden emin misiniz?",
            [
                {
                    text: "İptal",
                    style: "cancel",
                },
                {
                    text: "Evet",
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem("token");
                            const response = await graduateApi.get("/remove/resume", {
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json',
                                },
                            });

                            if (response.status === 200) {
                                setCvUrl(null);
                                alert("CV başarıyla silindi.");
                                fetchUserInfo();
                            } else {
                                const errorData = response.data;
                                console.error("CV silinirken sunucu hatası:", errorData);
                                alert("CV silinirken bir hata oluştu.");
                            }
                        } catch (error) {
                            console.error("CV silinirken ağ hatası:", error);
                            alert("CV silinirken bir ağ hatası oluştu.");
                        }
                    },
                },
            ]
        );
    };

    // Profil fotoğrafı silme
    const deletePhoto = () => {
        Alert.alert(
            "Fotoğrafı Sil",
            "Profil fotoğrafınızı silmek istediğinizden emin misiniz?",
            [
                {
                    text: "İptal",
                    style: "cancel",
                },
                {
                    text: "Evet",
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem("token");
                            const response = await graduateApi.get("/remove/photo", {
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json',
                                },
                            });

                            if (response.status === 200) {
                                setPhoto(null);
                                alert("Fotoğraf silindi.");
                                fetchUserInfo();

                            } else {
                                const errorData = response.data;
                                console.error("Fotoğraf silinirken sunucu hatası:", errorData);
                                alert("Fotoğraf silinirken bir hata oluştu.");
                            }
                        } catch (error) {
                            console.error("Fotoğraf silinirken ağ hatası:", error);
                            alert("Fotoğraf silinirken bir ağ hatası oluştu.");
                        }
                    },
                },
            ]
        );
    };

    if (!userInfo) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-100">
                <Text className="text-xl text-gray-700">Yükleniyor...</Text>
            </View>
        );
    }

     // Bilgi satırı
    const InfoItem = ({ label, value }) => (
        <View className="flex-row justify-between items-center bg-[#b6dcfa] p-3 rounded-xl mb-2">
            <Text
                className="text-[#0f172a] mr-2"
                numberOfLines={1}
            >
                {value}
            </Text>
        </View>
    );

    return (
        <ScrollView className="flex-1 bg-gray-100">
            {/* Header */}
            <View className="relative w-full h-64 rounded-b-3xl overflow-hidden">
                <Image
                    source={default_image_background}
                    className="absolute top-0 left-0 w-full h-full"
                    resizeMode="cover"
                />
                <View className="absolute top-0 left-0 w-full pt-10 px-5 flex-row items-center z-10">
                    <TouchableOpacity onPress={() => navigation.openDrawer()}>
                        <Icon color={"black"} name="menu" size={45} />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold ml-4 text-black">Profilim</Text>
                </View>
            </View>

            {/* Profil Fotoğrafı ve Kullanıcı Bilgileri */}
            <View className="absolute top-56 w-full items-center z-20">
                <View className="w-full bg-white h-screen rounded-2xl shadow-md p-2 items-center">
                    <View className="relative mb-3 -mt-20">
                        <Image
                            className="w-36 h-36 rounded-full border-4 border-blue-600"
                            source={{
                                uri:
                                    photo ||
                                    "https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg",
                            }}
                        />
                        <TouchableOpacity
                            className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2"
                            onPress={pickImage}
                        >
                            <Icon name="pencil" size={20} color="white" />
                        </TouchableOpacity>

                    </View>
                    <Text className="text-3xl font-semibold mt-3 mb-5 text-gray-800">
                        {userInfo.firstName} {userInfo.lastName}
                    </Text>

                    {/* Kişisel bilgiler*/}
                    <View className="px-5 w-full">
                        <View className="p-5 rounded-2xl bg-[#cfe9fc] shadow-md">
                            <View className="flex-row justify-between items-center mb-5">
                                <Text className="text-[#1e3a8a] text-lg font-bold">Kişisel Bilgiler</Text>
                            </View>
                            <InfoItem label="Mail" value={userInfo.eMail || "Yok"} />
                            <InfoItem label="Bölüm" value={userInfo.department || "Bilinmiyor"} />
                            <InfoItem
                                label="Durum"
                                value={userInfo.status === "aktif" ? "Öğrenci" : "Mezun"}
                            />
                        </View>

                        {/* CV İşlemleri */}
                        <View className="mt-5 space-y-4 mb-10">
                            {cvUrl ? (
                                <View className="flex-row justify-between ">
                                    <TouchableOpacity
                                        onPress={openCvProfile}
                                        className="flex-row items-center bg-blue-600 p-4 rounded-2xl shadow-md mr-2 flex-1 justify-center"
                                    >
                                        <Icon name="document-text-outline" size={28} color="white" />
                                        <Text className="text-lg mx-2 font-semibold text-white">CV'yi Gör</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={deleteCV}
                                        className="flex-row items-center bg-red-600 p-4 rounded-2xl shadow-md ml-2 flex-1 justify-center"
                                    >
                                        <Icon name="trash-outline" size={24} color="white" />
                                        <Text className="text-lg mx-2 font-semibold text-white">CV'yi Sil</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    onPress={uploadCV}
                                    className="flex-row items-center bg-blue-500 p-4 rounded-2xl shadow-md justify-center"
                                >
                                    <Icon name="cloud-upload-outline" size={28} color="#ffffff" />
                                    <Text className="text-lg ml-2 font-semibold text-white">CV Yükle</Text>
                                </TouchableOpacity>
                            )}

                            {/* Fotoğraf silme butonu */}
                            {photo ? (
                                <View className="flex-row items-center bg-red-600 p-4 rounded-2xl shadow-md justify-center">
                                    <TouchableOpacity
                                        onPress={deletePhoto}
                                        className="flex-row items-center"
                                    >
                                        <Icon name="trash-outline" size={24} color="white" />
                                        <Text className="text-lg ml-4 font-semibold text-white">Profil fotoğrafını sil</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : null}
                        </View>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}