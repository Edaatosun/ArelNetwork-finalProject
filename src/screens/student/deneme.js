import React, { useState, useEffect } from "react";
import { Text, View, Image, TouchableOpacity, Button, Linking, Alert } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from "@react-navigation/native";
import * as DocumentPicker from 'expo-document-picker';
import { studentApi } from "../../connector/URL.js"; // studentApi yolunuzun doğru olduğundan emin olun
import default_image_background from "../../../assets/images/profile_background.jpg" // Bu yolu kendi resminizin konumuna göre ayarlayın

export default function Profile() {
    const [userInfo, setUserInfo] = useState(null);
    const [photo, setPhoto] = useState(null);
    const [cvUrl, setCvUrl] = useState(null);
    const [selectedPhotoFileName, setSelectedPhotoFileName] = useState("Seçilen dosya yok"); // Yeni: Seçilen fotoğraf dosya adı
    const navigation = useNavigation();

    // Kullanıcı bilgilerini ve fotoğraf/CV URL'lerini çeken fonksiyon
    const fetchUserInfo = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            const response = await studentApi.get("/me", {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.data && response.data.info) {
                setUserInfo(response.data.info);
                setPhoto(response.data.info.photo);
                setCvUrl(response.data.info.resume);

                // Veritabanından gelen fotoğraf URL'sinden dosya adını ayrıştır
                if (response.data.info.photo) {
                    const filename = response.data.info.photo.split("/").pop();
                    setSelectedPhotoFileName(filename);
                } else {
                    setSelectedPhotoFileName("Seçilen dosya yok");
                }
            }
        } catch (error) {
            console.error("Kullanıcı bilgileri çekilirken hata:", error);
        }
    };

    // Bileşen yüklendiğinde kullanıcı bilgilerini çek
    useEffect(() => {
        fetchUserInfo();
    }, []);

    // Fotoğraf seçme işlemini başlatan fonksiyon
    const pickImage = async () => {
        console.log("Fotoğraf seçme başlatılıyor...");
        const resultAccess = await ImagePicker.requestMediaLibraryPermissionsAsync();
        console.log("Galeri erişim izni durumu:", resultAccess.status);

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

    // Galeriyi açıp fotoğrafı yükleyen fonksiyon
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
                const fileName = result.assets[0].fileName || `photo_${Date.now()}.jpg`; // Expo'nun sağladığı dosya adını kullan, yoksa kendin oluştur
                setSelectedPhotoFileName(fileName); // Seçilen dosya adını göster

                const photoFile = {
                    uri: photoUri,
                    type: 'image/jpeg', // Doğru MIME tipi
                    name: fileName,
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
                    console.log("Fotoğraf yükleme yanıtı:", responseData);

                    if (response.ok && responseData.photoUrl) { // HTTP OK (200) kontrolü eklendi
                        setPhoto(responseData.photoUrl);
                        alert("Fotoğraf başarıyla güncellendi.");
                        fetchUserInfo(); // Fotoğraf yüklendikten sonra tüm kullanıcı bilgilerini tekrar çek
                    } else {
                        console.error("Sunucu hatası:", responseData);
                        alert("Resim yüklenirken sunucu hatası oluştu.");
                    }
                } catch (error) {
                    console.error("Resim yüklenirken ağ hatası:", error);
                    alert("Resim yüklenirken bir ağ hatası oluştu.");
                }
            } else {
                console.log("Kullanıcı fotoğraf seçimini iptal etti.");
                // İptal edildiğinde mevcut fotoğrafın adını koru veya "Seçilen dosya yok" olarak ayarla
                if (!photo) { // Eğer zaten bir fotoğraf yoksa ve iptal edildiyse
                    setSelectedPhotoFileName("Seçilen dosya yok");
                } else { // Eğer mevcut bir fotoğraf varsa, onun adını tekrar göster
                    const filename = photo.split("/").pop();
                    setSelectedPhotoFileName(filename);
                }
            }
        } catch (error) {
            console.error("Galeriyi açarken hata:", error);
        }
    };

    // CV yükleme işlemini başlatan fonksiyon
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
                console.log("CV yükleme yanıtı:", responseData); // Ekstra log

                if (response.ok && responseData.resumeUrl) { // response.ok kontrolü eklendi
                    setCvUrl(responseData.resumeUrl);
                    alert("CV başarıyla yüklendi.");
                    fetchUserInfo(); // CV yüklendikten sonra tüm kullanıcı bilgilerini tekrar çek
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

    // Yüklü CV'yi açan fonksiyon
    const openCvProfile = () => {
        console.log("CV görüntüleme başlatılıyor. URL:", cvUrl); // Log cvUrl
        if (cvUrl) { // cvUrl state'ini kullan
            Linking.openURL(cvUrl).catch(err => {
                console.error("CV açılırken hata oluştu:", err);
                Alert.alert("Hata", "CV açılamadı. Cihazınızda PDF görüntüleyici olduğundan emin olun veya URL'yi kontrol edin.");
            });
        } else {
            Alert.alert("Hata", "Görüntülenecek bir CV bulunamadı.");
        }
    };

    // CV'yi silme fonksiyonu
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
                            const response = await fetch('https://bitirme-projesi-17w9.onrender.com/upload/resume', { // Backend'deki CV silme endpoint'inizi buraya girin
                                method: 'DELETE', // HTTP DELETE metodu
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                },
                            });

                            if (response.ok) {
                                setCvUrl(null); // CV URL'sini sıfırla
                                alert("CV başarıyla silindi.");
                                fetchUserInfo(); // Bilgileri tekrar çek
                            } else {
                                const errorData = await response.json();
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

    // Profil fotoğrafını silme fonksiyonu
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
                            const response = await fetch('https://bitirme-projesi-17w9.onrender.com/upload/photo', { // Backend'deki fotoğraf silme endpoint'inizi buraya girin
                                method: 'DELETE', // HTTP DELETE metodu
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                },
                            });

                            if (response.ok) {
                                setPhoto(
                                    "https://e7.pngegg.com/pngimages/869/483/png-clipart-profile-illustration-computer-icons-user-profile-icon-profile-size-silhouette-desktop-wallpaper-thumbnail.png"
                                ); // Varsayılan fotoğrafa dön
                                setSelectedPhotoFileName("Seçilen dosya yok"); // Dosya adını sıfırla
                                alert("Fotoğraf silindi.");
                                fetchUserInfo(); // Bilgileri tekrar çek
                            } else {
                                const errorData = await response.json();
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

    // Kullanıcı bilgileri yüklenirken gösterilecek yükleme ekranı
    if (!userInfo) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-100">
                <Text className="text-xl text-gray-700">Yükleniyor...</Text>
            </View>
        );
    }

    // Bilgi kartı için yardımcı bileşen
    const InfoItem = ({ label, value }) => (
        <View className="flex-row justify-between items-center bg-[#b6dcfa] p-3 rounded-xl mb-2">
            <View className="flex-row items-center">
                <Text className="text-[#1e40af] font-medium">{label}</Text>
            </View>
            <Text
                className="text-[#0f172a] font-semibold max-w-[60%] mr-2"
                numberOfLines={1}
            >
                {value}
            </Text>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-100">
            {/* Üst alan - Arka plan resmi ve içerik */}
            <View className="pt-10 items-center rounded-b-3xl">
                
                <Image
                    source={default_image_background} // Yeni arka plan resminiz
                    className="absolute top-0 left-0 w-full h-full rounded-b-3xl"
                    resizeMode="cover"
                />
                <View className="relative flex-row w-full items-center px-5 mb-6 z-10"> {/* z-index ekledik */}
                    <TouchableOpacity onPress={() => navigation.openDrawer()}>
                        <Icon color={"black"} name="menu" size={45} />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold ml-4 text-black">Profilim</Text>
                </View>

                <View className="relative items-center  z-10"> {/* z-index ekledik */}
                    <View className="relative">
                        <Image
                            className="w-36 h-36 rounded-full border-4 border-blue-600"
                            source={{
                                uri:
                                    photo ||
                                    "https://e7.pngegg.com/pngimages/869/483/png-clipart-profile-illustration-computer-icons-user-profile-icon-profile-size-silhouette-desktop-wallpaper-thumbnail.png",
                            }}
                        />
                        {/* Fotoğraf düzenleme butonu (küçük kalem) */}
                        <TouchableOpacity
                            className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2"
                            onPress={pickImage}
                        >
                            <Icon name="pencil" size={20} color="white" />
                        </TouchableOpacity>
                        {/* Profil fotoğrafını silme butonu */}
                        {photo && photo !== "https://e7.pngegg.com/pngimages/869/483/png-clipart-profile-illustration-computer-icons-user-profile-icon-profile-size-silhouette-desktop-wallpaper-thumbnail.png" && (
                            <TouchableOpacity
                                className="absolute top-0 right-0 bg-red-500 rounded-full p-1"
                                onPress={deletePhoto}
                            >
                                <Icon name="close" size={20} color="white" />
                            </TouchableOpacity>
                        )}
                    </View>
                    <Text className="text-3xl font-semibold mt-3 text-white"> {/* Metin rengini beyaz yaptık */}
                        {userInfo.firstName} {userInfo.lastName}
                    </Text>
                    <Text className="text-lg text-gray-200"> {/* Metin rengini açık gri yaptık */}
                        {userInfo.eMail.toLowerCase()}
                    </Text>
                </View>
            </View>

            {/* Kişisel Bilgi Kartı */}
            <View className="mx-5 p-5 rounded-2xl mt-[-20px] bg-[#cfe9fc] shadow-md z-20"> {/* Negatif margin ve z-index ile üst üste gelmesi sağlandı */}
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
                    <View className="flex-row items-center bg-white p-4 rounded-2xl shadow-md justify-between">
                        <TouchableOpacity
                            onPress={openCvProfile}
                            className="flex-row items-center flex-1"
                        >
                            <Icon name="document-text-outline" size={28} color="#0077b5" />
                            <Text className="text-lg ml-4 font-semibold text-[#0077b5]">CV Görüntüle</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={deleteCV}
                            className="bg-red-500 p-2 rounded-full"
                        >
                            <Icon name="trash-outline" size={24} color="white" />
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
            </View>
        </View>
    );
}