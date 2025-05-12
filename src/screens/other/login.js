import { View, Text, TouchableOpacity, Image, Alert, Platform } from "react-native";
import { TextInput } from 'react-native-paper';
import { useFonts } from 'expo-font';
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import api from "../../connector/URL";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import IconRight from "react-native-vector-icons/Entypo"
import { setBaseUrl } from "../../connector/URL";

export default function Login() {
    const [schoolNo, setSchoolNo] = useState();
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    const [showPassword, setShowPassword] = useState(false);
    const [loginMethod, setLoginMethod] = useState("tc"); // "school" | "email" | "tc"

    let [fontsLoaded] = useFonts({
        'myFont': require('../../../assets/fonts/BebasNeue-Regular.ttf'),
    });

    const handleLogin = async () => {
        if (!schoolNo || !password) {
            Alert.alert("Uyarı", "Lütfen okul numarası ve şifrenizi giriniz.");
            return;
        }

        setLoading(true);

        try {
            const response = await api.post("/login", {
                tc: parseInt(schoolNo),
                password: password,
            });

            const data = response.data;
            if (response.status === 200 && data.token) {
                Alert.alert("Başarılı", "Giriş başarılı!");
                await AsyncStorage.setItem("token", data.token);
                setTimeout(() => {
                    navigation.navigate("Drawer");
                }, 1000);
            } else {
                Alert.alert("Hata", data.msg || "Giriş yapılamadı.");
            }
        } catch (error) {
            console.log(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!fontsLoaded) {
        return <Text>Yükleniyor...</Text>;
    }

    useEffect(() => {
        const changeBaseUrl = async () => {
          
           setBaseUrl('passive');
           console.log("otherLoginnn");
        };
    
        changeBaseUrl();
      }, []);

    return (
        <View className="flex-1 bg-gray-100">
            {/* Giriş Yap Butonu */}
            <View className="absolute top-10 right-4 z-10">
                <TouchableOpacity
                    className="flex-row items-center"
                    onPress={() => navigation.navigate("LoginStudent")}
                >
                    <Text className="text-base mr-2 font-bold text-blue-500">Öğrenci Girişi</Text>
                    <IconRight name="chevron-with-circle-right" size={40} color="#3B82F6" />
                </TouchableOpacity>
            </View>
            {/* Üst: Logo ve Başlık */}
            <View className="items-center px-6 pt-10 mt-32">
                <Image
                    source={require('../../../assets/images/image.png')}
                    resizeMode="contain"
                    className="w-7/12 h-40 mb-5"
                />
                <Text className="text-2xl font-bold text-gray-800 mb-4" style={{ fontFamily: "myFont" }}>
                    AREL NETWORK
                </Text>

            </View>


            <KeyboardAwareScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                enableOnAndroid
                keyboardShouldPersistTaps="handled"
            >
                <View className=" justify-center items-center bg-gray-100 px-6 pt-6">


                    <View className="w-full mb-4">
                        <TextInput
                            label={
                                loginMethod === "school"
                                    ? "Okul Numarası"
                                    : loginMethod === "email"
                                        ? "E-posta"
                                        : "T.C. Kimlik No"
                            }
                            value={schoolNo}
                            onChangeText={setSchoolNo}
                            keyboardType={
                                loginMethod === "school" || loginMethod === "tc"
                                    ? "numeric"
                                    : "email-address"
                            }
                            mode="outlined"
                            activeOutlineColor="#4CAF50"
                            outlineColor="#ccc"
                            theme={{ colors: { primary: '#4CAF50' } }}
                        />
                    </View>

                    <View className="w-full mb-4">
                        <TextInput
                            label="Şifre"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            mode="outlined"
                            activeOutlineColor="#4CAF50"
                            outlineColor="#ccc"
                            theme={{ colors: { primary: '#4CAF50' } }}
                            right={
                                <TextInput.Icon
                                    icon={showPassword ? "eye" : "eye-off"}
                                    onPress={() => setShowPassword(!showPassword)}
                                />
                            }
                        />
                        <TouchableOpacity className="mt-1 self-end"
                        >
                            <Text className="text-gray-500 text-sm mt-1">Şifremi Unuttum?</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        className="bg-blue-500 p-3 rounded-lg w-full"
                        onPress={() => { handleLogin(); }}
                        disabled={loading}
                    >
                        <Text className="text-white text-center text-lg font-bold">
                            {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
                        </Text>
                    </TouchableOpacity>

                    <Text className="text-gray-500 text-center my-4">veya bu yollarla devam et</Text>

                    <View className="flex-row justify-between space-x-2">
                        <TouchableOpacity
                            className="flex-1 flex-row items-center justify-center bg-white border border-gray-300 rounded-lg p-3"
                            onPress={() => setLoginMethod("email")}
                        >
                            <Icon name="email" size={20} color="#333" style={{ marginRight: 5 }} />
                            <Text className="text-gray-800 text-sm">E-posta</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-1 flex-row items-center justify-center bg-white border border-gray-300 rounded-lg p-3"
                            onPress={() => setLoginMethod("tc")}
                        >
                            <Icon name="card-account-details" size={20} color="#333" style={{ marginRight: 5 }} />
                            <Text className="text-gray-800 text-sm">T.C. No</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-1 flex-row items-center justify-center bg-white border border-gray-300 rounded-lg p-3"
                            onPress={() => setLoginMethod("school")}
                        >
                            <Icon name="school" size={20} color="#333" style={{ marginRight: 5 }} />
                            <Text className="text-gray-800 text-sm">Okul No</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAwareScrollView>

        </View>

    );
}
