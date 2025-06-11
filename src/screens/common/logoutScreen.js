import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const LogoutScreen = () => {
  const navigation = useNavigation(); 

  useEffect(() => {
    const logout = async () => {
      // Kullanıcının token bilgisini AsyncStorage'dan silerek çıkış yapılır
      await AsyncStorage.removeItem('token');

      // Navigasyon geçmişi sıfırlanır ve kullanıcı 'Main' ekranına yönlendirilir
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    };

    logout(); 
  }, []);

  // Bu bileşen herhangi bir arayüz döndürmez
  return null;
};

export default LogoutScreen;
