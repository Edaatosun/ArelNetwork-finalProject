import React, { useState, useEffect } from "react";
import { Text, View, Image, TouchableOpacity, Button, Linking, Alert } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import storage, { uploadImageToStorage, uploadPdfToStorage, uploadResumeToStorage } from '../../../firebase'; // Firebase Storage
import * as ImagePicker from 'expo-image-picker';
import api from "../../connector/denemeUrl.js"; // API bağlantı
import { useNavigation } from "@react-navigation/native";
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';

export default function Profile() {
    const [userInfo, setUserInfo] = useState(null);
    const [photo, setPhoto] = useState(null);
    const [cvUrl, setCvUrl] = useState(null);
    const navigation = useNavigation();


    const fetchUserInfo = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            const response = await api.get("/me", {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.data) {
                setUserInfo(response.data.info);
                setPhoto(response.data.info.photo);
                setCvUrl(response.data.info.resume);
            }
        } catch (error) {
            console.error("Kullanıcı bilgileri çekilirken hata:", error);
        }
    };

    useEffect(() => {
        fetchUserInfo();
    }, []);


    const pickImage = async () => {

        console.log("pickkk");
        const resultAccess = await ImagePicker.requestMediaLibraryPermissionsAsync();
        console.log(resultAccess);
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
                        }
                    },
                    { text: "İptal", style: "cancel" }
                ]
            );
        }
    };
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
                const fileName = `${Date.now()}.png`;

                const photoFile = {
                    uri: photoUri,
                    type: 'image/jpeg',
                    name: `photo_${Date.now()}.jpg`,
                };

                const formData = new FormData();
                formData.append('photo', photoFile);

                const token = await AsyncStorage.getItem("token");

                try {
                    const response = await fetch('https://bitirme-projesi-17w9.onrender.com/upload/photo', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                        body: formData,
                    });

                    const responseData = await response.json();
                    if (responseData.photoUrl) {
                        setPhoto(responseData.photoUrl);
                        alert("Fotoğraf başarıyla güncellendi.");
                    }
                } catch (error) {
                    console.error("Resim yüklenirken hata:", error);
                    alert("Resim yüklenirken bir hata oluştu.");
                }

            }
        } catch (error) {
            console.error("Galeriyi açarken hata:", error);
        }
    };



    const uploadCV = async () => {
        console.log("Uploading CV...");

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

                const response = await fetch('https://bitirme-projesi-17w9.onrender.com/upload/resume', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    body: formData,
                });

                const responseData = await response.json();

                if (response.status === 200 && responseData.resumeUrl) {
                    setCvUrl(responseData.resumeUrl);
                    alert("CV başarıyla yüklendi.");
                } else {
                    console.error("Sunucu hatası:", responseData);
                    alert("CV yüklenirken sunucu hatası oluştu.");
                }
            } else {
                console.log("Kullanıcı dosya seçimini iptal etti.");
            }
        } catch (error) {
            console.error("CV yüklenirken hata:", error);
            alert("CV yüklenirken bir hata oluştu.");
        }
    };



    const openCvProfile = () => {
        console.log("heyy");
        console.log(userInfo.resume);
        Linking.openURL(userInfo?.resume);
    };

    if (!userInfo) {
        return (
            <View>
                <Text>Yükleniyor...</Text>
            </View>
        );
    }

    const InfoItem = ({ label, value }) => (
        <View className="flex-row justify-between items-center bg-[#b6dcfa] p-3 rounded-xl mb-2">
            <View className="flex-row items-center">
                <Text className="text-[#1e40af] font-medium">{label}</Text>
            </View>
            <Text className="text-[#0f172a] font-semibold max-w-[60%] mr-2" numberOfLines={1}>
                {value}
            </Text>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-100">
            {/* Üst alan */}
            <View className="bg-[#A5D3FF] pt-10  items-center rounded-b-3xl">

                <View className="flex-row w-full items-center px-5 mb-6">
                    <TouchableOpacity onPress={() => navigation.openDrawer()}>
                        <Icon color={"white"} name="menu" size={45} />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold ml-4 text-white">Profilim</Text>
                </View>

                <View className="items-center mb-5">
                    <View className="relative">
                        <Image
                            className="w-36 h-36 rounded-full border-4 border-blue-600"
                            source={{
                                uri: photo || 'https://e7.pngegg.com/pngimages/869/483/png-clipart-profile-illustration-computer-icons-user-profile-icon-profile-size-silhouette-desktop-wallpaper-thumbnail.png',
                            }}
                        />
                        <TouchableOpacity className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2" onPress={pickImage}>
                            <Icon name="pencil" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                    <Text className="text-3xl font-semibold mt-3">{userInfo.firstName} {userInfo.lastName}</Text>
                    <Text className="text-lg text-gray-600">{userInfo.eMail.toLowerCase()}</Text>
                </View>
            </View>

            {/* Kişisel Bilgi Kartı */}
            <View className="mx-5 p-5 rounded-2xl mt-2 bg-[#cfe9fc] shadow-md">
                <View className="flex-row justify-between items-center mb-5">
                    <Text className="text-[#1e3a8a] text-lg font-bold">Kişisel Bilgiler</Text>
                </View>

                <InfoItem label="İsim" value={userInfo.firstName || "Yok"} />
                <InfoItem label="Soyisim" value={userInfo.lastName || "Belirtilmedi"} />
                <InfoItem label="Bölüm" value={userInfo.department || "Bilinmiyor"} />
                <InfoItem
                    label="Durum"
                    value={userInfo.status === "aktif" ? "Öğrenci" : "Mezun"}
                />
            </View>

            <View className="px-5 mt-5 space-y-4">


                {/* CV Kartı veya Yükleme Butonu */}
                {cvUrl ? (
                    <TouchableOpacity
                        onPress={openCvProfile}
                        className="flex-row items-center bg-white p-4 rounded-2xl shadow-md"
                    >
                        <Icon name="document-text-outline" size={28} color="#0077b5" />
                        <Text className="text-lg ml-4 font-semibold text-[#0077b5]">CV Görüntüle</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        onPress={uploadCV}
                        className="flex-row items-center bg-blue-500 p-4 rounded-2xl shadow-md justify-center"
                    >
                        <Icon name="cloud-upload-outline" size={28} color="#ffffff" />
                        <Text className="text-lg ml-2 font-semibold text-white">CV Yükle</Text>
                    </TouchableOpacity>
                )}
            </View>


        </View>
    );
}

/*{/* LinkedIn Kartı
<TouchableOpacity
onPress={openLinkedInProfile}
className="flex-row items-center bg-white p-4 rounded-2xl shadow-md"
>
<Icon name="logo-linkedin" size={28} color="#0077b5" />
<Text className="text-lg ml-4 font-semibold text-[#0077b5]">LinkedIn Profilim</Text>
</TouchableOpacity> */



// // LinkedIn profilini açma
// const openLinkedInProfile = () => {
//     Linking.openURL(userInfo?.linkedIn || "https://www.linkedin.com");
// };

