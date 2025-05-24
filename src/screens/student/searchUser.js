import React, { useEffect, useState } from 'react';
import { View, FlatList, Alert, Image, TouchableOpacity } from 'react-native';
import { Searchbar, Card, Text, Avatar, Appbar } from 'react-native-paper';
import api, { studentApi } from '../../connector/URL';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function SearchUser() {
    const [students, setStudents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const navigation = useNavigation();

    useEffect(() => {
        if (searchQuery.length >= 1) {
            fetchStudents(searchQuery);
        } else {
            setStudents([]);
        }
    }, [searchQuery]);

    const fetchStudents = async (query) => {
        try {
            const localToken = await AsyncStorage.getItem('token');

            const response = await studentApi.get('/search', {
                headers: {
                    Authorization: `Bearer ${localToken}`,
                    'Content-Type': 'application/json',
                },
                params: {
                    query: query,
                },
            });

            if (response.status === 200) {
                setStudents(response.data.users);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Hata', 'Veriler alınamadı.');
        }
    };

    const handleUserPress = (user) => {
        navigation.navigate('UserProfile', { userInfo: user });
    };

    const renderStudentCard = ({ item }) => {
    const hasPhoto = item.photo && item.photo.trim() !== '';
    const fullName = `${item.firstName} ${item.lastName}`;
    const department = item.department ?? '';
    const classInfo = item.classNo ? `${item.classNo}. Sınıf` : null;

    return (
        <Card
            style={{ marginBottom: 12, padding: 12 }}
            mode="contained"
            onPress={() => handleUserPress(item)}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {hasPhoto && (
                    <View style={{ marginBottom: 12,  }}> 
                        <Image
                            style={{
                                width: 90,  
                                height: 90,
                                borderRadius: 72,
                                borderColor: '#2563EB',
                            }}
                            source={{
                                uri: item.photo,
                            }}
                        />
                    </View>
                )}

                <View style={{ marginLeft: hasPhoto ? 12 : 0, flexShrink: 1 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#000' }}>
                        {fullName}
                    </Text>
                    <Text style={{ fontSize: 14, color: '#4B5563', marginTop: 2 }}>
                        {department}
                    </Text>
                    {classInfo && (
                        <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
                            {classInfo}
                        </Text>
                    )}
                </View>
            </View>
        </Card>
    );
};






    return (
        <View className="flex-1 bg-gray-100">
            <Appbar.Header>
                <Appbar.Action icon="menu" size={32} onPress={() => navigation.openDrawer?.()} />
                <Appbar.Content title="Kişi Ara" />
            </Appbar.Header>

            <View className="px-4 mt-4">
                <Searchbar
                    placeholder="Ara (örn: Ali)"
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    className="mb-4 bg-white rounded-xl shadow-sm"
                />

                <FlatList
                    data={students}
                    renderItem={renderStudentCard}
                    keyExtractor={(item) => item._id.toString()}
                    ListEmptyComponent={
                        <Text className="text-center text-gray-400 mt-8">
                            Sonuç bulunamadı.
                        </Text>
                    }
                />
            </View>
        </View>
    );
}
