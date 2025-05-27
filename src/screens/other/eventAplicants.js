import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, Image, TouchableOpacity, Alert, Linking } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { graduateApi } from '../../connector/URL'; // graduateApi yolunuzu kontrol edin
import AsyncStorage from '@react-native-async-storage/async-storage';



export default function EventApplicant() {
    const route = useRoute();
    const navigation = useNavigation();
    const { event_id } = route.params;

    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchApplicants = async () => {
            try {
                const localToken = await AsyncStorage.getItem("token");

                if (!localToken) {
                    setError("Oturum açmadınız. Lütfen tekrar giriş yapın.");
                    setLoading(false);
                    return;
                }
                console.log("hey heyyy");
                // API çağrısı
                const response = await graduateApi.get(`/get/event/${event_id}/applicants`, {
                    headers: {
                        'Authorization': `Bearer ${localToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                console.log("bilinmedi");
                console.log(response.data.applicants);
                setApplicants(response.data.applicants);
            } catch (err) {
                console.error("Başvuranlar çekilirken hata oluştu:", err);
                // Axios hatalarını daha spesifik yakalayabiliriz
                if (err.response && err.response.status === 404) {
                    setError("Belirtilen ilana ait başvuru bulunamadı.");
                } else if (err.response && err.response.status === 401) {
                    setError("Yetkiniz yok veya oturum süreniz doldu.");
                } else {
                    setError("Başvuranlar yüklenirken bir sorun oluştu.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchApplicants();
    }, [event_id]);

    // CV'yi görüntüleme fonksiyonu
    const handleViewCV = (resumeUrl) => {
        if (resumeUrl) {
            // Güvenli URL açma kontrolü ekleyin
            Linking.canOpenURL(resumeUrl).then(supported => {
                if (supported) {
                    Linking.openURL(resumeUrl);
                } else {
                    Alert.alert("Hata", `Bu URL açılamıyor: ${resumeUrl}`);
                }
            }).catch(err => console.error('An error occurred', err));
        } else {
            Alert.alert("Hata", "Bu başvuranın CV'si bulunamadı.");
        }
    };

    // Profil Görüntüle fonksiyonu
    const handleViewProfile = (item) => {
        // userProfile sayfanızın doğru parametreyi beklediğinden emin olun (applicantId veya userInfo)
         navigation.navigate('UserProfile', { userInfo: item.applicant });
    };

    // Her bir başvuran için kart render fonksiyonu
    const renderApplicantCard = ({ item }) => (
        <View className="bg-white rounded-lg mx-4 my-2 p-4 shadow-md">
            <View className="flex-row items-center mb-3">
                <Image
                    source={item.applicant.photo ? { uri: item.applicant.photo } : null}
                    className="w-16 h-16 rounded-full mr-4 border border-gray-200"
                />
                <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-800">{`${item.applicant.firstName} ${item.applicant.lastName}`}</Text>
                    <Text className="text-base text-gray-600 mt-0.5">{item.applicant.department}</Text>
                    <Text className="text-sm text-gray-500 mt-0.5">
                        {item.applicant.classNo ? `Öğrenci (Sınıf: ${item.applicant.classNo})` : 'Mezun'}
                    </Text>
                </View>
            </View>

            <View className="flex-row justify-around pt-3 border-t border-gray-200">
                <TouchableOpacity
                    className="flex-row items-center bg-green-500 py-2 px-4 rounded-lg mr-2"
                    onPress={() => handleViewCV(item.applicant.resume)}
                >
                    <Icon name="document-text-outline" size={18} color="#fff" />
                    <Text className="text-white font-semibold ml-2 text-sm">CV'yi Gör</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className="flex-row items-center bg-blue-500 py-2 px-4 rounded-lg ml-2"
                    onPress={() => handleViewProfile(item)}
                >
                    <FontAwesome5 name="user-alt" size={16} color="#fff" />
                    <Text className="text-white font-semibold ml-2 text-sm">Profili Gör</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="text-lg text-gray-600 mt-4">Başvuranlar yükleniyor...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <Text className="text-lg text-red-500 text-center px-4">{error}</Text>
            </View>
        );
    }


    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            {/* İkonun görünmesi için mt-5 yerine paddingTop ekleyelim, böylece status bar'ın altına gelir */}
            <View className="p-4 flex-row items-center pt-10 bg-white z-10 shadow-sm">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={30} color="black" />
                </TouchableOpacity>
                <Text className="text-xl font-bold ml-4">Başvurular</Text>
            </View>

           <FlatList
                data={applicants}
                renderItem={renderApplicantCard}
                keyExtractor={item => item._id}
                contentContainerStyle="pb-5"
                ListEmptyComponent={() => ( 
                    <View className="flex-1 justify-center items-center p-5">
                        <Text className="text-xl text-gray-600 text-center mt-20">
                            Henüz başvuran yok.
                        </Text>
                        <Text className="text-base text-gray-500 text-center mt-2">
                            Yeni başvurular geldiğinde burada görünecektir.
                        </Text>
                    </View>
                )}
            />
        </View>
    );
}