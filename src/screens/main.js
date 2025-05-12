import { View, Text, TouchableOpacity, Image } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { setBaseUrl } from "../connector/URL";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Main() {
    const navigation = useNavigation();

    // Öğrenci girişi
    const handleStudentLogin = async () => {
        setBaseUrl('active');  // Öğrenci girişi yapıldığında base URL
        navigation.navigate("LoginStudent");
    };

    // Mezun girişi
    const handleGraduateLogin = async () => {
        setBaseUrl('passive');  // Mezun girişi yapıldığında base URL
        navigation.navigate("LoginOther");
    };

  return (
    <View className="flex-1 bg-white p-4">
      <View className="flex-1 items-center justify-center">
        {/* Ortadaki Kısım: Logo ve Başlık */}
        <View className="items-center">
          <Image
            source={require("../../assets/images/image.png")}
            className="w-52 h-52 mb-5"
            resizeMode="contain"
          />
          <Text className="text-3xl font-bold text-gray-800">Arel Network</Text>
        </View>
      </View>

      {/* Butonları En Alta Sabitle */}
      <View className="w-full items-center pb-10">
        {/* Öğrenci Butonu */}
        <TouchableOpacity
          onPress={handleStudentLogin} 
          className="bg-blue-500 w-72 py-3 rounded-xl mb-4 items-center"
        >
          <Text className="text-white font-semibold">Öğrenci Girişi</Text>
        </TouchableOpacity>

        {/* Mezun Butonu */}
        <TouchableOpacity
          onPress={handleGraduateLogin} 
          className="bg-green-500 w-72 py-3 rounded-xl items-center"
        >
          <Text className="text-white font-semibold">Mezun Girişi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
