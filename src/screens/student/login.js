import { View, Text, TouchableOpacity, Image, Alert, Modal, ActivityIndicator } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import IconRight from 'react-native-vector-icons/Entypo';
import { studentApi } from '../../connector/URL';

export default function Login() {
  const [schoolNo, setSchoolNo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [tcNo, setTcNo] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  let [fontsLoaded] = useFonts({
    'myFont': require('../../../assets/fonts/BebasNeue-Regular.ttf'),
  });

  const handleForgotSubmit = async () => {
    if (!tcNo) {
      Alert.alert('Uyarı', 'Lütfen TC Kimlik Numaranızı giriniz.');
      return;
    }

    setModalVisible(true);
    try {
      console.log('Forgot password request for TC:', tcNo);
      const response = await studentApi.post('/forgotPassword', {
        tc: tcNo,
      });
      console.log('Forgot password response:', response.data);

      if (response.status === 200) {
        setModalVisible(false);
        Alert.alert('Başarılı', `Merhaba ${response.data.user.firstName}\nŞifren: ${response.data.user.password}`);
      } else {
        Alert.alert('Hata', response.data.msg || 'Bilgi getirilemedi.');
      }
    } catch (error) {
      console.error('Forgot password error:', error.message);
      Alert.alert('Hata', error.response?.data?.msg || 'Bir hata oluştu.');
    } finally {
      setModalVisible(false);
    }
  };

  const handleLogin = async () => {
    if (!schoolNo || !password) {
      Alert.alert('Uyarı', 'Lütfen okul numarası ve şifrenizi giriniz.');
      return;
    }

    setLoading(true);

    try {
      const response = await studentApi.post('/login', {
        schoolNumber: parseInt(schoolNo),
        password: password,
      });

      const data = response.data;

      if (response.status === 200 && data.token) {
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('userType', 'student');
        navigation.navigate('Drawer');
      } else {
        Alert.alert('Hata', 'Giriş yapılamadı.');
      }
    } catch (error) {
      const serverMessage = error?.response?.data?.msg || '';

      let userFriendlyMessage = 'Bir hata oluştu. Lütfen tekrar deneyiniz.';

      if (serverMessage.includes('Şifre hatalı')) {
        userFriendlyMessage = 'Okul numaranız veya şifreniz yanlış. Lütfen tekrar deneyiniz.';
      } else if (serverMessage.includes('Üniversitemize kayıtlı değilsiniz')) {
        userFriendlyMessage = 'Okul numaranız veya şifreniz hatalı. Lütfen tekrar kontrol edin.';
      } else if (serverMessage.includes('Mezun')) {
        userFriendlyMessage = 'Lütfen "Mezun Girişi" ekranını kullanınız.';
      }

      Alert.alert('Hata', userFriendlyMessage);
    } finally {
      setLoading(false);
    }
  };


  return (
    <View className="flex-1 relative">
      {/* Giriş Yap Butonu */}
      <View className="absolute top-10 right-4 z-10">
        <TouchableOpacity
          className="flex-row items-center"
          onPress={() => navigation.navigate('LoginOther')}
        >
          <Text className="text-base mr-2 font-bold text-blue-500">Mezun Girişi</Text>
          <IconRight name="chevron-with-circle-right" size={40} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center items-center bg-gray-100 px-6 py-10">
          <Image
            source={require('../../../assets/images/image.png')}
            resizeMode="contain"
            className="w-7/12 h-40 mb-5"
          />

          <Text
            className="text-2xl font-bold text-gray-800 mb-5"
            style={{ fontFamily: fontsLoaded ? 'myFont' : undefined }}
          >
            AREL NETWORK
          </Text>

          <View className="w-full mb-4">
            <TextInput
              label="Okul Numarası"
              value={schoolNo}
              onChangeText={setSchoolNo}
              mode="outlined"
              activeOutlineColor="#4CAF50"
              outlineColor="#ccc"
              theme={{ colors: { primary: '#4CAF50' } }}
              keyboardType="numeric"
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
                  icon={showPassword ? 'eye' : 'eye-off'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />
            <TouchableOpacity className="mt-1 self-end" onPress={() => setModalVisible(true)}>
              <Text className="text-gray-500 text-sm mt-1">Şifremi Unuttum?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="bg-blue-500 p-3 rounded-lg w-full mt-2"
            onPress={handleLogin}
            disabled={loading}
          >
            <Text className="text-white text-center text-lg font-bold">Giriş Yap</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>

      {/* Şifremi Unuttum Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white rounded-xl p-6 w-11/12 max-w-md">
            <Text className="text-lg font-semibold text-center mb-4">
              TC Kimlik Numaranızı Girin
            </Text>

            <TextInput
              label="TC Kimlik Numarası"
              value={tcNo}
              onChangeText={setTcNo}
              mode="outlined"
              keyboardType="numeric"
              maxLength={11}
              activeOutlineColor="#4CAF50"
              outlineColor="#ccc"
              theme={{ colors: { primary: '#4CAF50' } }}
            />

            <View className="flex-row justify-end mt-4">
              <TouchableOpacity
                className="bg-red-500 px-4 py-2 rounded-lg mr-2"
                onPress={() => setModalVisible(false)}
              >
                <Text className="text-white">İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-green-600 px-4 py-2 rounded-lg"
                onPress={handleForgotSubmit}
              >
                <Text className="text-white">Gönder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}