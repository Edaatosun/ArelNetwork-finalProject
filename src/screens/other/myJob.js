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

export default function MyJob() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [myJobs, setMyJobs] = useState([]);
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

  const fetchMyJobs = useCallback(async () => {
    setRefreshing(true);
    try {
      const localToken = await AsyncStorage.getItem('token');
      if (!localToken) {
        Alert.alert('Hata', 'Giriş yapmanız gerekiyor.');
        setRefreshing(false);
        return;
      }

      const response = await graduateApi.get('/get/myJobAds', {
        headers: {
          Authorization: `Bearer ${localToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        setMyJobs(response.data.jobs);
      } else {
        Alert.alert('Hata', response.data?.message || 'İş ilanları alınamadı.');
        setMyJobs([]);
      }
    } catch (error) {
      Alert.alert('Hata', error.response?.data?.message || 'Beklenmeyen bir hata oluştu.');
      setMyJobs([]);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const searchMyJobs = useCallback(async (query) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Hata', 'Giriş yapmanız gerekiyor.');
        return;
      }

      const response = await graduateApi.get(`/search/at/myjobs?title=${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        setMyJobs(response.data.filteredJObs);
      } else {
        setMyJobs([]);
        Alert.alert('Hata', 'Arama sonuçları getirilemedi.');
      }
    } catch (error) {
      console.log('Arama hatası:', error);
      setMyJobs([]);
      Alert.alert('Hata', 'Arama sırasında bir hata oluştu.');
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      fetchMyJobs();
    }
  }, [isFocused, fetchMyJobs]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim()) {
        searchMyJobs(searchQuery.trim());
      } else {
        fetchMyJobs();
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, searchMyJobs, fetchMyJobs]);

  const renderJobCard = ({ item: job }) => {
    const now = new Date();
    const jobEndDate = job.toDate ? new Date(job.toDate) : null;

    const goToJobDetail = () => {
      navigation.navigate('DetailsJob',
        {
          item_id: job._id,
          isEditMode: true
        });
    };

    return (
      <TouchableOpacity onPress={goToJobDetail} className="mb-4 mx-4 rounded-lg shadow-md bg-white">
        <View className="relative">
          <Image
            source={job.imageUrl ? { uri: job.imageUrl } : DefaultJobImage}
            className="w-full h-44 rounded-t-lg"
            resizeMode="cover"
          />
        </View>
        <View className="p-4">
          <PaperText variant="titleLarge" className="text-xl font-bold mb-1">
            {job.jobTitle}
          </PaperText>
          <PaperText variant="bodyMedium" className="text-gray-700 text-sm mb-2">
            {truncateDescription(job.description, 20)}
          </PaperText>
          <View className="flex-row items-center mb-1">
            <FontAwesome5 name="home" size={16} color="#4B5563" />
            <Text className="ml-2 text-gray-600 text-sm">{job.company}</Text>
          </View>
          <View className="flex-row items-center mb-1">
            <Icon name="location-sharp" size={16} color="#4B5563" />
            <Text className="ml-2 text-gray-600 text-sm">{job.location}</Text>
          </View>
          <View className="flex-row items-center mb-1">
            <Icon name="calendar" size={16} color="#4B5563" />
            <Text className="ml-2 text-gray-600 text-sm">
              {formatDate(job.fromDate)} - {formatDate(job.toDate)}
            </Text>
          </View>
          <View className="flex-row items-center">
            <FontAwesome5 name="award" size={16} color="#4B5563" />
            <Text className="ml-2 text-gray-600 text-sm">{job.jobField}</Text>
          </View>
        </View>
        <View className="flex-row justify-center px-4 pb-3">
          {/* Başvurular Butonu */}
          <Button
            mode="contained"
            onPress={() => navigation.navigate("JobApplicant", { job_id: job._id })} 
            className="bg-blue-600 rounded-md flex-1 mr-2" 
            labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
          >
            Başvurular
          </Button>

          {/* İlana Git Butonu */}
          <Button
            mode="contained"
            onPress={goToJobDetail}
            className="bg-green-600 rounded-md flex-1 ml-2" 
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
        <Appbar.Content title="İş İlanlarım" titleStyle={{ color: 'white' }} />
      </Appbar.Header>

      <Searchbar
        placeholder="Ara..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        className="mx-4 mt-4 mb-3 bg-white rounded-xl shadow-sm"
      />

      <FlatList
        data={myJobs}
        renderItem={renderJobCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchMyJobs}
            colors={['#007bff']}
            tintColor={'#007bff'}
          />
        }
        ListEmptyComponent={
          !refreshing && (
            <Text className="text-center text-gray-400 mt-12 text-base">
              Henüz oluşturulmuş bir iş ilanı bulunmamaktadır.
              {searchQuery ? ' Arama sonucunda iş ilanı bulunamadı.' : ''}
            </Text>
          )
        }
      />
    </View>
  );
}
