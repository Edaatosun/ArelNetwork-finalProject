import React, { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const LogoutScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const logout = async () => {
      await AsyncStorage.removeItem('token'); 
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }], 
      });
    };

    logout();
  }, []);

  return null; 
};

export default LogoutScreen;
