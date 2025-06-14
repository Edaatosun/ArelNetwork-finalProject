import { View, Text, TouchableOpacity, Image } from "react-native";
import { useNavigation } from '@react-navigation/native'; 
import FontAwesome from "react-native-vector-icons/FontAwesome"; 
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"; 

export default function Main() {
  const navigation = useNavigation(); 

  // Mezun giriş ekranına yönlendirme
  const handleGraduateLogin = () => {
    navigation.navigate("LoginOther");
  };

  // Öğrenci giriş ekranına yönlendirme
  const handleStudentLogin = () => {
    navigation.navigate("LoginStudent");
  };

  return (
    <View className="flex-1 bg-white justify-between">
      {/*Logo ve başlık */}
      <View className="items-center justify-center mt-52">
        <Image
          source={require("../../../assets/images/image.png")} 
          className="w-52 h-52 mb-5"
          resizeMode="contain"
        />
        <Text className="text-2xl font-bold text-gray-800">AREL NETWORK</Text> 
      </View>

      {/* Giriş butonları */}
      <View className="items-center mb-28 space-y-5">
        {/* Mezun girişi butonu */}
        <TouchableOpacity
          onPress={handleGraduateLogin}
          className="bg-blue-600 w-72 py-5 rounded-xl flex-row justify-center items-center space-x-2"
        >
          <FontAwesome name="graduation-cap" size={22} color="#fff" /> 
          <Text className="text-white font-semibold text-base">Mezun Girişi</Text>
        </TouchableOpacity>

        {/* Öğrenci girişi butonu */}
        <TouchableOpacity
          onPress={handleStudentLogin}
          className="bg-green-600 w-72 py-5 rounded-xl flex-row justify-center items-center space-x-2"
        >
          <MaterialCommunityIcons name="bag-personal" size={22} color="#fff" /> 
          <Text className="text-white font-semibold text-base">Öğrenci Girişi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
