import React, { useState, useEffect } from "react";
import { View, Linking } from "react-native";
import { Text, Avatar, Button } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function UserProfile() {
    const [userInfo, setUserInfo] = useState(null);
    const [photo, setPhoto] = useState(null);
    const [cvUrl, setCvUrl] = useState(null); 
    const navigation = useNavigation();
    const route = useRoute();

    useEffect(() => {
        
        if (route.params?.userInfo) {
            setUserInfo(route.params.userInfo);
            setPhoto(route.params.userInfo.photo); 
            setCvUrl(route.params.userInfo.resume); 
        }
    }, [route.params]); 

    const openCvProfile = () => {
        if (userInfo?.resume) {
            Linking.openURL(userInfo.resume);
        }
    };

    const handleSendMessage = () => {
        
        console.log("Mesaj Gönderildi");
        // navigation.navigate("ChatScreen", { userId: userInfo.id });
    };

    if (!userInfo) {
        return (
            <View>
                <Text>Yükleniyor...</Text>
            </View>
        );
    }

    const InfoItem = ({ label, value }) => (
        <View className="flex-row justify-between items-center bg-[#b6dcfa] p-4 rounded-xl mb-2">
            <View className="flex-row items-center">
                <Text className="text-[#1e40af] font-medium">{label}</Text>
            </View>
            <Text className="text-[#0f172a] font-semibold max-w-[70%] mr-2" numberOfLines={1}>
                {value}
            </Text>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-100">
            {/* Üst alan */}
            <View className="bg-[#A5D3FF] pt-10 items-center rounded-b-3xl">
                <Avatar.Image
                    size={120}
                    source={{
                        uri: photo || 'https://e7.pngegg.com/pngimages/869/483/png-clipart-profile-illustration-computer-icons-user-profile-icon-profile-size-silhouette-desktop-wallpaper-thumbnail.png',
                    }}
                    className=" border-[#1e40af] mt-10"
                />
                <Text className="text-3xl font-semibold mt-3">{userInfo.firstName} {userInfo.lastName}</Text>
                <Text className="text-lg text-gray-600 mb-3">{userInfo.eMail.toLowerCase()}</Text>
            </View>

            {/* Mesaj Gönder ve CV Görüntüle Butonları Yan Yana */}
            <View className="flex-row justify-between items-center px-4 mt-5">
                <Button
                    mode="contained"
                    icon="message-text"
                    onPress={handleSendMessage}
                    className="bg-[#34D399] py-1 flex-1 mr-2"
                >
                    Mesaj Gönder
                </Button>

                {cvUrl && (
                    <Button
                        mode="contained"
                        icon="file-document"
                        onPress={openCvProfile}
                        className="bg-[#0077b5] py-1 flex-1"
                    >
                        CV Görüntüle
                    </Button>
                )}
            </View>

            {/* Kişisel Bilgi Kartı */}
            <View className="mx-4 p-5 rounded-2xl mt-10 bg-[#cfe9fc] shadow-md">
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
        </View>
    );
}
