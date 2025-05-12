import React, { useEffect, useState } from 'react';
import { View, FlatList, Alert } from 'react-native';
import { Searchbar, Card, Text, Avatar } from 'react-native-paper';
import api from '../../connector/URL';
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

            const response = await api.get('/search', {
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

    const renderStudentCard = ({ item }) => (
        <Card className="mb-3" mode="contained" onPress={() => handleUserPress(item)}>
            <Card.Title
                title={`${item.firstName} ${item.lastName}`}
                subtitle={item.eMail}
                left={() => (
                    <Avatar.Image
                        size={48}
                        source={{ uri: item.photo || 'https://via.placeholder.com/100' }}
                    />
                )}
            />
        </Card>
    );

    return (
        <View className="flex-1 bg-gray-100 px-4 mt-10">
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

            {students.length > 0 && (
                <Text className="mt-6 text-lg font-bold text-gray-700">
                    Tanıyor Olabileceğin Kişiler
                </Text>
            )}
        </View>
    );
}
