import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { Searchbar, Text as PaperText, Button, Appbar } from 'react-native-paper';

import DefaultJobImage from '../../../assets/images/default_job_image.jpg';
import { graduateApi } from '../../connector/URL';

export default function MyIntern() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [myInterns, setMyInterns] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'Tarih Yok';
    try {
      const datePart = dateString.split('T')[0];
      const [year, month, day] = datePart.split('-');
      return `${day}.${month}.${year}`;
    } catch (e) {
      return 'Geçersiz Tarih';
    }
  };

  const truncateDescription = (text, maxLength) => {
    if (!text) return '';
    return text.length <= maxLength ? text : text.substring(0, maxLength) + '...';
  };

  const fetchMyInterns = useCallback(async () => {
    setRefreshing(true);
    try {
      const localToken = await AsyncStorage.getItem('token');
      if (!localToken) {
        Alert.alert('Hata', 'Giriş yapmanız gerekiyor.');
        setRefreshing(false);
        return;
      }

      const response = await graduateApi.get('/get/myInternAds', {
        headers: {
          Authorization: `Bearer ${localToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        setMyInterns(response.data.interns);
      } else {
        Alert.alert('Hata', response.data?.message || 'Staj ilanları alınamadı.');
        setMyInterns([]);
      }
    } catch (error) {
      Alert.alert('Hata', error.response?.data?.message || 'Beklenmeyen bir hata oluştu.');
      setMyInterns([]);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const searchMyInterns = useCallback(async (query) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Hata', 'Giriş yapmanız gerekiyor.');
        return;
      }

      const response = await graduateApi.get(`/search/at/myinterns?title=${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        setMyInterns(response.data.filteredInterns);
      } else {
        setMyInterns([]);
        Alert.alert('Hata', 'Arama sonuçları getirilemedi.');
      }
    } catch (error) {
      console.log('Arama hatası:', error);
      setMyInterns([]);
      Alert.alert('Hata', 'Arama sırasında bir hata oluştu.');
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      fetchMyInterns();
    }
  }, [isFocused, fetchMyInterns]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim()) {
        searchMyInterns(searchQuery.trim());
      } else {
        fetchMyInterns();
      }
    }, 500); 

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, searchMyInterns, fetchMyInterns]);

  const renderInternCard = ({ item: intern }) => {
    const now = new Date();
    const internEndDate = intern.toDate ? new Date(intern.toDate) : null;

    const goToInternDetail = () => {
      navigation.navigate('DetailsIntern',
         { 
          item_id: intern._id ,
          isEditMode: true
        });
    };

    return (
      <TouchableOpacity onPress={goToInternDetail} className="mb-4 mx-4 rounded-lg shadow-md bg-white">
        <View className="relative">
          <Image
            source={intern.imageUrl ? { uri: intern.imageUrl } : DefaultJobImage}
            className="w-full h-44 rounded-t-lg"
            resizeMode="cover"
          />
        </View>
        <View className="p-4">
          <PaperText variant="titleLarge" className="text-xl font-bold mb-1">
            {intern.internTitle}
          </PaperText>
          <PaperText variant="bodyMedium" className="text-gray-700 text-sm mb-2">
            {truncateDescription(intern.description, 20)}
          </PaperText>
          <View className="flex-row items-center mb-1">
            <FontAwesome5 name="home" size={16} color="#4B5563" />
            <Text className="ml-2 text-gray-600 text-sm">{intern.company}</Text>
          </View>
          <View className="flex-row items-center mb-1">
            <Icon name="location-sharp" size={16} color="#4B5563" />
            <Text className="ml-2 text-gray-600 text-sm">{intern.location}</Text>
          </View>
          <View className="flex-row items-center mb-1">
            <Icon name="calendar" size={16} color="#4B5563" />
            <Text className="ml-2 text-gray-600 text-sm">
              {formatDate(intern.fromDate)} - {formatDate(intern.toDate)}
            </Text>
          </View>
          <View className="flex-row items-center">
            <FontAwesome5 name="award" size={16} color="#4B5563" />
            <Text className="ml-2 text-gray-600 text-sm">{intern.internField}</Text>
          </View>
        </View>
        <View className="justify-center px-4 pb-3">
          <Button
            mode="contained"
            onPress={goToInternDetail}
            className="bg-blue-600 rounded-md w-full"
            labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
          >
            İlana Git
          </Button>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-gray-100">
      <Appbar.Header className="bg-[#A5D3FF] shadow-md">
        <Appbar.Action
          icon="menu"
          color="white"
          size={32}
          onPress={() => navigation.openDrawer()}
        />
        <Appbar.Content title="Staj İlanlarım" titleStyle={{ color: 'white' }} />
      </Appbar.Header>

      <Searchbar
        placeholder="Ara..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        className="mx-4 mt-4 mb-3 bg-white rounded-xl shadow-sm"
      />

      <FlatList
        data={myInterns}
        renderItem={renderInternCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchMyInterns}
            colors={['#007bff']}
            tintColor={'#007bff'}
          />
        }
        ListEmptyComponent={
          !refreshing && (
            <Text className="text-center text-gray-400 mt-12 text-base">
              Henüz oluşturulmuş bir staj ilanı bulunmamaktadır.
              {searchQuery ? ' Arama sonucunda staj ilanı bulunamadı.' : ''}
            </Text>
          )
        }
      />
    </View>
  );
}
