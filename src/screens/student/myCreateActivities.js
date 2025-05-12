import React, { useState, useCallback } from "react";
import { View, Text, FlatList, Image } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import api from "../../connector/URL";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TouchableOpacity } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { formatDate } from "../../components/date";

export default function MyCreateActivities() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const navigation = useNavigation();

    const fetchActivities = async () => {
        try {
            const localToken = await AsyncStorage.getItem("token");
            const response = await api.get("/getMyCreatedActivities", {
                headers: {
                    Authorization: `Bearer ${localToken}`,
                    "Content-Type": "application/json",
                },
            });

            if (response.data.length === 0) {
                setErrorMsg("Henüz etkinlik oluşturulmamıştır.");
            } else {
                setActivities(response.data);
            }
        } catch (error) {
            console.error("Etkinlikler alınamadı:", error);
            setErrorMsg("Etkinlikler alınırken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            fetchActivities();
        }, [])
    );
    
    const renderCard = ({ item }) => {
        const title = item.head;
        const company = item.companyName;
        const location = item.location;
        const startDate = formatDate(item.startDate);
        return (
            <TouchableOpacity
                className="mb-4"
                onPress={() =>
                    navigation.navigate('DetailsActivity', { event_id: item._id, isEditMode: true })

                }
            >
                <View className="flex-row rounded-t-xl p-4 border-white shadow-xl items-center bg-white">
                    <Image
                        source={item.photo ? { uri: item.photo } : { uri: "https://cdn-icons-png.flaticon.com/512/4709/4709457.png" }}
                        style={{ width: 60, height: 60, borderRadius: 10, borderWidth: 1 }}
                    />
                    <Text className="ml-4 text-lg font-bold">{title}</Text>
                </View>

                <View className="bg-gray-200 p-4 rounded-b-xl">
                    <View className="flex-row items-center mb-1">
                        <Ionicons name="business" size={16} color="black" />
                        <Text className="ml-2 text-black">{company}</Text>
                    </View>
                    <View className="flex-row items-center mb-2">
                        <Ionicons name="location" size={16} color="black" />
                        <Text className="ml-2 text-black">{location}</Text>
                    </View>
                    <View className="flex-row items-center mb-2">
                        <Ionicons name="calendar" size={16} color="black" />
                        <Text className="ml-2 text-black">
                            {startDate}
                        </Text>
                    </View>

                </View>
            </TouchableOpacity>
        );

    };

    return (
        <View className="flex-1 bg-gray-100 p-4">
            <View className="flex-row w-full items-center mt-5 mb-3">
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <Ionicons color={"black"} name="menu" size={45} />
                </TouchableOpacity>
                <Text className="text-2xl font-bold ml-4 text-black">Aktivitelerim</Text>
            </View>
            {loading ? (
                <Text className="text-center mt-4 text-base">Yükleniyor...</Text>
            ) : errorMsg ? (
                <Text className="text-center mt-4 text-base text-red-500">
                    {errorMsg}
                </Text>
            ) : (
                <FlatList
                    data={activities}
                    keyExtractor={(item) => item._id}
                    renderItem={renderCard}
                    contentContainerStyle={{ paddingBottom: 24 }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}
