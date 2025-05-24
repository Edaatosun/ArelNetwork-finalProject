import React, { useEffect, useState } from "react";
import { createDrawerNavigator, DrawerItemList } from "@react-navigation/drawer";
import { Image, Text, View, TouchableOpacity, UIManager, LayoutAnimation, Platform, TouchableNativeFeedback } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
// Sayfalarınızı import edin

import Profile from "../screens/student/myProfile";
import SearchUser from "../screens/student/searchUser";
import Home from "../screens/common/home";
import LogoutScreen from "../screens/common/logoutScreen";

import CreateIntern from "../screens/other/createIntern";
import CreateEvent from "../screens/other/createEvent";
import CreateJob from "../screens/other/createJob";

import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from "react-native-vector-icons/AntDesign";

import { ScrollView } from 'react-native';
import MyEvent from "../screens/other/myEvent";
import MyIntern from "../screens/other/myIntern";
import MyJob from "../screens/other/myJob";

const Drawer = createDrawerNavigator();

export default function DrawerMenu() {
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const getUserType = async () => {
      const type = await AsyncStorage.getItem('userType');
      setUserType(type);
    };
    getUserType();
  }, []);

  if (userType === null) return null;

  return (
    <Drawer.Navigator
      drawerContent={(props) => <Content {...props} userType={userType} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: '#007bff',
        drawerInactiveTintColor: 'gray',
        drawerLabelStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {/* Ana menü öğeleri */}
      <Drawer.Screen name="Home" component={Home} options={{
        title: "Anasayfa",
        drawerIcon: ({ color, size }) => <FontAwesome name="home" size={size} color={color} />
      }} />

      <Drawer.Screen name="Profile" component={Profile} options={{
        title: "Profilim",
        drawerIcon: ({ color, size }) => <MaterialIcons name="account-circle" size={size} color={color} />
      }} />

      <Drawer.Screen name="SearchUser" component={SearchUser} options={{
        title: "Kişi Arama",
        drawerIcon: ({ color, size }) => <FontAwesome name="search" size={size} color={color} />
      }} />

      <Drawer.Screen name="Logout" component={LogoutScreen} options={{
        title: "Çıkış Yap",
        drawerIcon: ({ color, size }) => <MaterialIcons name="logout" size={size} color={color} />
      }} />

      <Drawer.Screen
        name="CreateJob"
        component={CreateJob}
        options={{
          title: "İş İlanı Oluştur",
          drawerItemStyle: { display: 'none' },
          headerShown: true,
        }}
      />

      <Drawer.Screen
        name="CreateIntern"
        component={CreateIntern}
        options={{
          title: "Staj İlanı Oluştur",
          drawerItemStyle: { display: 'none' },
          headerShown: true,
        }}
      />

      <Drawer.Screen
        name="CreateEvent" // Etkinlik Oluştur sayfası
        component={CreateEvent}
        options={{
          title: "Etkinlik Oluştur",
          drawerItemStyle: { display: 'none' },
          headerShown: true,
        }}
      />

      <Drawer.Screen
        name="MyJob"
        component={MyJob}
        options={{
          title: "İş İlanlarım",
          drawerItemStyle: { display: 'none' },
        }}
      />

      <Drawer.Screen
        name="MyIntern"
        component={MyIntern}
        options={{
          title: "Staj İlanlarım",
          drawerItemStyle: { display: 'none' },
        }}
      />

      <Drawer.Screen
        name="MyEvent"
        component={MyEvent}
        options={{
          title: "Etkinlik İlanlarım",
          drawerItemStyle: { display: 'none' },
        }}
      />

    </Drawer.Navigator>
  );
}



const Content = (props) => {
  const { navigation, userType } = props;
  const [expanded, setExpanded] = useState(false);
  const [selectedSubMenu, setSelectedSubMenu] = useState(null);
  const [expandedForAdvert, setExpandedForAdvert] = useState(false);
  const [selectedSubMenuForAdvert, setSelectedSubMenuForAdvert] = useState(null);

  const handlePress = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const handlePressForAdvert = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedForAdvert(!expandedForAdvert);
  };

  return (
    <View className="flex-1 bg-gray-100">
      {/* Üst Logo ve Başlık */}
      <View className="bg-[#A5D3FF] items-center pt-10 pb-4">
        <Image className="h-[132] w-[135]" source={require("../../assets/images/image.png")} />
        <Text className="font-bold italic text-2xl mt-2">ArelNetwork</Text>
      </View>

      {/* Scroll edilebilir menü */}
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }} className="flex-1">
        <View className="px-2 pt-2">
          <DrawerItemList {...props} />
        </View>

        {/* İlan Oluştur (student değilse göster) */}
        {userType !== 'student' && (
          <View className="mx-2  rounded-lg overflow-hidden">
            {/* Ana başlık - diğer menülerle uyumlu */}
            <TouchableOpacity
              onPress={handlePress}
              className={`flex-row items-center justify-between px-4 py-3 ${expanded ? 'bg-blue-100' : ''}`}
            >
              <View className="flex-row items-center">
                <AntDesign name="plussquare" size={24} color={expanded ? "#007bff" : "gray"} />
                <Text className={`ml-3 font-bold text-base ${expanded ? 'text-[#007bff]' : 'text-[#8e8e93]'}`}>
                  İlan Oluştur
                </Text>
              </View>
              <AntDesign name={expanded ? "up" : "down"} size={18} color={expanded ? "#007bff" : "gray"} />
            </TouchableOpacity>

            {/* Alt Menüler */}
            {expanded && (
              <>
                {/* Staj İlanı */}
                <TouchableOpacity
                  onPress={() => {
                    setSelectedSubMenu('CreateIntern');
                    navigation.navigate('CreateIntern');
                    navigation.closeDrawer();
                    setExpanded(false);
                  }}
                  className={`flex-row items-center pl-12 py-3 ${selectedSubMenu === 'CreateIntern' ? 'bg-blue-100' : 'bg-gray-100'}`}
                >
                  <MaterialCommunityIcons
                    name="briefcase-outline"
                    size={20}
                    color={selectedSubMenu === 'CreateIntern' ? '#2196f3' : '#8e8e93'}
                  />
                  <Text className={`ml-3 text-sm font-semibold ${selectedSubMenu === 'CreateIntern' ? 'text-[#2196f3]' : 'text-[#8e8e93]'}`}>
                    Staj İlanı Oluştur
                  </Text>
                </TouchableOpacity>

                {/* İş İlanı */}
                <TouchableOpacity
                  onPress={() => {
                    setSelectedSubMenu('CreateJob');
                    navigation.navigate('CreateJob');
                    navigation.closeDrawer();
                    setExpanded(false);
                  }}
                  className={`flex-row items-center pl-12 py-3 ${selectedSubMenu === 'CreateJob' ? 'bg-blue-100' : 'bg-gray-100'}`}
                >
                  <MaterialCommunityIcons
                    name="account-tie-outline"
                    size={20}
                    color={selectedSubMenu === 'CreateJob' ? '#2196f3' : '#8e8e93'}
                  />
                  <Text className={`ml-3 text-sm font-semibold ${selectedSubMenu === 'CreateJob' ? 'text-[#2196f3]' : 'text-[#8e8e93]'}`}>
                    İş İlanı Oluştur
                  </Text>
                </TouchableOpacity>

                {/* Etkinlik Oluştur */}
                <TouchableOpacity
                  onPress={() => {
                    setSelectedSubMenu('CreateEvent');
                    navigation.navigate('CreateEvent');
                    navigation.closeDrawer();
                    setExpanded(false);
                  }}
                  className={`flex-row items-center pl-12 py-3 ${selectedSubMenu === 'CreateEvent' ? 'bg-blue-100' : 'bg-gray-100'}`}
                >
                  <MaterialCommunityIcons
                    name="calendar-month-outline"
                    size={20}
                    color={selectedSubMenu === 'CreateEvent' ? '#2196f3' : '#8e8e93'}
                  />
                  <Text className={`ml-3 text-sm font-semibold ${selectedSubMenu === 'CreateEvent' ? 'text-[#2196f3]' : 'text-[#8e8e93]'}`}>
                    Etkinlik Oluştur
                  </Text>
                </TouchableOpacity>
              </>
            )}

          </View>
        )}

        {/* İlanlarım (student değilse göster) */}
        {userType !== 'student' && (
          <View className="mx-2  rounded-lg overflow-hidden">
            {/* Ana başlık - diğer menülerle uyumlu */}
            <TouchableOpacity
              onPress={handlePressForAdvert}
              className={`flex-row items-center justify-between px-4 py-3 ${expandedForAdvert ? 'bg-blue-100' : ''}`}
            >
              <View className="flex-row items-center">
                <AntDesign name="check" size={24} color={expandedForAdvert ? "#007bff" : "gray"} />
                <Text className={`ml-3 font-bold text-base ${expandedForAdvert ? 'text-[#007bff]' : 'text-[#8e8e93]'}`}>
                  İlanlarım
                </Text>
              </View>
              <AntDesign name={expandedForAdvert ? "up" : "down"} size={18} color={expandedForAdvert ? "#007bff" : "gray"} />
            </TouchableOpacity>

            {/* Alt Menüler */}
            {expandedForAdvert && (
              <>
                {/* Staj İlanı */}
                <TouchableOpacity
                  onPress={() => {
                    // Düzeltme burada: setExpandedForAdvert yerine setSelectedSubMenuForAdvert kullanılmalı
                    setSelectedSubMenuForAdvert('MyIntern');
                    navigation.navigate('MyIntern');
                    navigation.closeDrawer();
                    setExpandedForAdvert(false);
                  }}
                  className={`flex-row items-center pl-12 py-3 ${selectedSubMenuForAdvert === 'MyIntern' ? 'bg-blue-100' : 'bg-gray-100'}`}
                >
                  <MaterialCommunityIcons
                    name="briefcase-outline"
                    size={20}
                    color={selectedSubMenuForAdvert === 'MyIntern' ? '#2196f3' : '#8e8e93'}
                  />
                  <Text className={`ml-3 text-sm font-semibold ${selectedSubMenuForAdvert === 'MyIntern' ? 'text-[#2196f3]' : 'text-[#8e8e93]'}`}>
                    Staj İlanlarım
                  </Text>
                </TouchableOpacity>

                {/* İş İlanı */}
                <TouchableOpacity
                  onPress={() => {
                    // Düzeltme burada: setExpandedForAdvert yerine setSelectedSubMenuForAdvert kullanılmalı
                    setSelectedSubMenuForAdvert('MyJob');
                    navigation.navigate('MyJob');
                    navigation.closeDrawer();
                    setExpandedForAdvert(false);
                  }}
                  className={`flex-row items-center pl-12 py-3 ${selectedSubMenuForAdvert === 'MyJob' ? 'bg-blue-100' : 'bg-gray-100'}`}
                >
                  <MaterialCommunityIcons
                    name="account-tie-outline"
                    size={20}
                    color={selectedSubMenuForAdvert === 'MyJob' ? '#2196f3' : '#8e8e93'}
                  />
                  <Text className={`ml-3 text-sm font-semibold ${selectedSubMenuForAdvert === 'MyJob' ? 'text-[#2196f3]' : 'text-[#8e8e93]'}`}>
                    İş İlanlarım
                  </Text>
                </TouchableOpacity>

                {/* Etkinlik Oluştur */}
                <TouchableOpacity
                  onPress={() => {
                    setSelectedSubMenuForAdvert('MyEvent');
                    navigation.navigate('MyEvent');
                    navigation.closeDrawer();
                    setExpandedForAdvert(false);
                  }}
                  className={`flex-row items-center pl-12 py-3 ${selectedSubMenuForAdvert === 'MyEvent' ? 'bg-blue-100' : 'bg-gray-100'}`}
                >
                  <MaterialCommunityIcons
                    name="calendar-month-outline"
                    size={20}
                    color={selectedSubMenuForAdvert === 'MyEvent' ? '#2196f3' : '#8e8e93'}
                  />
                  <Text className={`ml-3 text-sm font-semibold ${selectedSubMenuForAdvert === 'MyEvent' ? 'text-[#2196f3]' : 'text-[#8e8e93]'}`}>
                    Etkinlik İlanlarım
                  </Text>
                </TouchableOpacity>
              </>
            )}

          </View>
        )}
      </ScrollView>

    </View>
  );
};