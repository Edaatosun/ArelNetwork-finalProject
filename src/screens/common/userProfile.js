import { useState, useEffect } from "react";
import { Text, View, Image, TouchableOpacity, Linking, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";
import default_image_background from "../../../assets/images/profile_background.jpg"
import { Button } from "react-native-paper";


export default function UserProfile() {
    const [userInfo, setUserInfo] = useState(null);
    const navigation = useNavigation();
    const route = useRoute();

    // bilgilerin geldiği kısım
    useEffect(() => {
        if (route.params?.userInfo) {
            setUserInfo(route.params.userInfo);
        }
    }, [route.params]);

    // Cv görüntüle fonskiyonu
    const openCvProfile = () => {
        if (userInfo?.resume) {
            Linking.openURL(userInfo.resume);
        }
    };

    //Mesaj gönder fonksiyonu
    const handleSendMessage = async () => {
        navigation.navigate("ChatScreen", { userInfo });
    };

    if (!userInfo) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-100">
                <Text className="text-xl text-gray-700">Yükleniyor...</Text>
            </View>
        );
    }

    const InfoItem = ({value }) => (
        <View className="flex-row justify-between items-center bg-[#b6dcfa] p-3 rounded-xl mb-2">
            <Text className="text-[#0f172a] font-semibold">{value}</Text>
        </View>
    );

    const classInfo = userInfo.classNo ? `${userInfo.classNo}. Sınıf` : null;

    return (
        <ScrollView className="flex-1 bg-gray-100">
            {/* Arka plan ve başlık */}
            <View className="relative w-full h-64 rounded-b-3xl overflow-hidden">
                <Image
                    source={default_image_background}
                    className="absolute top-0 left-0 w-full h-full"
                    resizeMode="cover"
                />
                {/* Header */}
                <View className="p-4 flex-row items-center mt-7 z-10">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Icon name="arrow-back" size={32} color="black" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold ml-4">Profil</Text>
                </View>
            </View>

            {/* Ana profil alanı */}
            <View className="absolute top-56 w-full items-center z-20">
                <View className="w-full bg-white h-screen rounded-2xl shadow-md p-2 items-center">
                    {/* Profil Fotoğrafı */}
                    <View className="relative mb-3 -mt-20">
                        <Image
                            className="w-36 h-36 rounded-full border-4 border-blue-600"
                            source={{ uri: userInfo.photo }}
                        />
                    </View>

                    {/* Ad Soyad */}
                    <Text className="text-3xl font-semibold mt-3 mb-5 text-gray-800">
                        {userInfo.firstName} {userInfo.lastName}
                    </Text>

                    {/* Mesaj Gönder ve CV Görüntüle Butonları*/}
                    <View className="flex-row justify-between items-center px-4 mt-5">
                        <Button
                            mode="contained"
                            icon="message-text"
                            onPress={handleSendMessage}
                            className="bg-[#34D399] py-1 flex-1 mr-2"
                        >
                            Mesaj Gönder
                        </Button>

                        {userInfo.resume && (
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

                    {/* Kişisel Bilgiler */}
                    <View className="px-5 w-full mt-10">
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
                            {classInfo && (
                                <InfoItem label="sınıf"
                                    value={classInfo} />

                            )}
                        </View>


                    </View>
                </View>
            </View>
        </ScrollView>
    );
}
