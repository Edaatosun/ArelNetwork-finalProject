import { createNativeStackNavigator } from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ekran bileşenleri
import MainScreen from './screens/main';
import LoginStudent from './screens/student/login';
import LoginOther from './screens/other/login';
import DrawerMenu from './components/drawerMenu';
import DetailsAdvert from './screens/student/detailsAdvert';
import DetailsActivity from './screens/student/detailsActivty';
import EditActivity from './screens/student/editActivity';
import UserProfile from './screens/student/userProfile';

export default function Navigation() {

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>

        <Stack.Screen name="Main" component={MainScreen} />
        <Stack.Screen name="LoginStudent" component={LoginStudent} />
        <Stack.Screen name="Drawer" component={DrawerMenu} />
        <Stack.Screen name="DetailsAdvert" component={DetailsAdvert} />
        <Stack.Screen name="DetailsActivity" component={DetailsActivity} />
        <Stack.Screen name='EditActivity' component={EditActivity} />
        <Stack.Screen name='UserProfile' component={UserProfile} />

        <Stack.Screen name="LoginOther" component={LoginOther} />


      </Stack.Navigator>
    </NavigationContainer>
  );
}
