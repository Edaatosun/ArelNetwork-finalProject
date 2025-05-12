import React from "react";
import { createDrawerNavigator, DrawerItemList } from "@react-navigation/drawer";
import Home from "../screens/student/home";
import Profile from "../screens/student/myProfile";
import CreateAdvert from "../screens/student/createAdvert";
import { Image, Text, View } from "react-native";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from "react-native-vector-icons/AntDesign"
import MyCreateActivities from "../screens/student/myCreateActivities";
import CreateActivity from "../screens/student/createActivity";
import SearchUser from "../screens/student/searchUser";
import LogoutScreen from "../screens/logoutScreen";



const Drawer = createDrawerNavigator();

export default function DrawerMenu() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <Content {...props} />}
      screenOptions={{ headerShown: false }}>
      <Drawer.Screen name="Home" component={Home} options={
        {
          title: "Anasayfa",
          drawerIcon: () => <FontAwesome name="home" size={26} color="black" />
        }} />

      <Drawer.Screen name="Profile" component={Profile} options={
        {
          title: "Profilim",
          drawerIcon: () => <MaterialIcons name="account-circle" size={26} color="black" />
        }} />

      <Drawer.Screen name="CreateActivity" component={CreateActivity} options={
        {
          title: "Aktivite Oluştur",
          drawerIcon: () => <AntDesign name="pluscircleo" size={26} color="black" />
        }} />

      <Drawer.Screen name="MyCreateActivities" component={MyCreateActivities} options={
        {
          title: "Aktivitelerim",
          drawerIcon: () => <MaterialCommunityIcons name="party-popper" size={26} color="black" />
        }} />


      <Drawer.Screen name="SearchUser" component={SearchUser} options={
        {
          title: "Kişi Arama",
          drawerIcon: () => <FontAwesome name="search" size={26} color="black" />
        }} />

      <Drawer.Screen name="Logout" component={LogoutScreen} options={{
        title: "Çıkış Yap",
        drawerIcon: () => <MaterialIcons name="logout" size={26} color="black" />
      }} />


      <Drawer.Screen name="CreateAdvert" component={CreateAdvert} />
    </Drawer.Navigator>
  );
}

const Content = (props) => {

  return (
    <View className="flex-1 bg-gray-200">
      <View className="bg-[#A5D3FF] items-center flex-1">
        <Image className="mt-10 h-[120] w-[125]" source={require("../../assets/images/image.png")} />
        <Text className="font-bold italic text-2xl">ArelNetwork</Text>
      </View>
      <View className="flex-[3] px-4 pt-6">
        <DrawerItemList {...props} />

      </View>
    </View>
  );
};