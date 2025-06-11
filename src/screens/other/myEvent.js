import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { Searchbar, Button, Appbar, Text as PaperText } from 'react-native-paper';
import DefaultJobImage from '../../../assets/images/default_job_image.jpg';
import { graduateApi } from '../../connector/URL';

export default function MyEvent() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  // etkinlik ilanları, arama metni ve yenileme durumu için state'ler
  const [myEvents, setMyEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Tarih formatını ayarlayan fonksiyon  (örn: 01.06.2025)
  const formatDate = (dateString) => {
    if (!dateString) return 'Tarih Yok';
    try {
      const datePart = dateString.split('T')[0];
      const [year, month, day] = datePart.split('-');
      return `${day}.${month}.${year}`;
    } catch (e) {
      console.error("Tarih formatlama hatası:", e);
      return 'Geçersiz Tarih';
    }
  };

  // Uzun açıklamaları kısaltır (maksimum karakter sayısı kadar)
  const truncateDescription = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // kullanıcının oluşturduğu ilanları çeken fonksiyon
  const fetchMyEvents = useCallback(async () => {
    setRefreshing(true);
    try {
      const localToken = await AsyncStorage.getItem('token');
      if (!localToken) {
        Alert.alert('Hata', 'Giriş yapmanız gerekiyor.');
        setRefreshing(false);
        return;
      }

      const response = await graduateApi.get('/get/myEventAds', {
        headers: {
          'Authorization': `Bearer ${localToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        setMyEvents(response.data.events);
        setFilteredEvents(response.data.events);
      } else {
        Alert.alert('Hata', response.data?.message || 'Etkinlikler alınamadı.');
        setMyEvents([]);
        setFilteredEvents([]);
      }
    } catch (error) {
      console.error('Etkinlikleri çekerken bir hata oluştu:', error);
      Alert.alert('Hata', error.response?.data?.message || 'Beklenmeyen bir hata oluştu.');
      setMyEvents([]);
      setFilteredEvents([]);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Kullanıcının etkinlik ilanları arasında arama yapan fonksiyon
  const searchMyEvents = useCallback(async (query) => {
    try {
      const localToken = await AsyncStorage.getItem('token');
      if (!localToken) {
        Alert.alert('Hata', 'Giriş yapmanız gerekiyor.');
        return;
      }

      if (query.trim() === '') {
        fetchMyEvents();
        return;
      }

      const response = await graduateApi.get(`/search/at/myevents?title=${query}`, {
        headers: {
          'Authorization': `Bearer ${localToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        setFilteredEvents(response.data.filteredEvents);
      } else {
        Alert.alert('Hata', 'Arama işlemi başarısız.');
        setFilteredEvents([]);
      }
    } catch (error) {
      console.error('Arama sırasında hata oluştu:', error);
      Alert.alert('Hata', 'Arama işlemi sırasında beklenmeyen bir hata oluştu.');
    }
  }, [fetchMyEvents]);

  // Sayfa her odaklandığında etkinlik ilanlarını yeniden getir
  useEffect(() => {
    if (isFocused) {
      fetchMyEvents();
    }
  }, [isFocused, fetchMyEvents]);

  // Arama çubuğu yazısı değiştikçe arama yap ya da tüm ilanları getir
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim()) {
        searchMyEvents(searchQuery.trim());
      } else {
        fetchMyEvents();
      }
    }, 500); // 500ms bekleme süresi

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, searchMyEvents, fetchMyEvents]);

  // Etkinlik ilanı kartı
  const renderEventCard = ({ item: event }) => {
    // aktif pasif yakında başlıkları
    const now = new Date();
    const fromDateRaw = event.fromDate ? new Date(event.fromDate) : null;
    const toDateRaw = event.toDate ? new Date(event.toDate) : null;

    let statusLabel = 'Aktif';
    let statusColor = 'bg-green-500';

    if (toDateRaw && toDateRaw < now) {
      statusLabel = 'Pasif';
      statusColor = 'bg-red-500';
    }
    else if (fromDateRaw && fromDateRaw > now) {
      statusLabel = 'Yakında';
      statusColor = 'bg-yellow-500';
    }

    // detay ekranına yönlendirme fonksiyonu
    const goToEventDetail = () => {
      navigation.navigate('DetailsEvent', {
        item_id: event._id,
        isEditMode: true
      });
    };


    return (
      <TouchableOpacity
        onPress={goToEventDetail}
        className="mb-4 mx-4 rounded-lg shadow-md bg-white"
      >
        <View className="relative">
          {event.imageUrl ? (
            <Image
              source={{ uri: event.imageUrl }}
              className="w-full h-44 rounded-t-lg"
              resizeMode="cover"
            />
          ) : (
            <Image
              source={DefaultJobImage}
              className="w-full h-44 rounded-t-lg"
              resizeMode="cover"
            />
          )}

          {/* Durum etiketi */}
          <View className={`absolute top-3 right-3 px-3 py-1 rounded-full ${statusColor}`}>
            <Text className="text-white text-xs font-semibold">{statusLabel}</Text>
          </View>
        </View>
        <View className="p-4">
          <PaperText
            variant="titleLarge"
            className="text-xl font-bold mb-1"
          >
            {event.eventTitle}
          </PaperText>

          <PaperText
            variant="bodyMedium"
            className="text-gray-700 text-sm mb-2"
          >
            {truncateDescription(event.description, 20)}
          </PaperText>

          <View className="flex-row items-center mb-1">
            <FontAwesome5 name="home" size={16} color="#4B5563" />
            <Text className="ml-2 text-gray-600 text-sm">{event.company}</Text>
          </View>
          <View className="flex-row items-center mb-1">
            <Icon name="location-sharp" size={16} color="#4B5563" />
            <Text className="ml-2 text-gray-600 text-sm">{event.location}</Text>
          </View>
          <View className="flex-row items-center mb-1">
            <Icon name="calendar" size={16} color="#4B5563" />
            <Text className="ml-2 text-gray-600 text-sm">
              {formatDate(event.fromDate)} - {formatDate(event.toDate)}
            </Text>
          </View>
          <View className="flex-row items-center">
            <FontAwesome5 name="award" size={16} color="#4B5563" />
            <Text className="ml-2 text-gray-600 text-sm">{event.eventField}</Text>
          </View>
        </View>
        <View className="flex-row justify-center px-4 pb-3">
          {/* Başvurular Butonu */}
          <Button
            mode="contained"
            onPress={() => navigation.navigate("EventApplicant", { event_id: event._id })}
            className="bg-blue-600 rounded-md flex-1 mr-2"
            labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
          >
            Katılımcılar
          </Button>

          {/* İlana Git Butonu */}
          <Button
            mode="contained"
            onPress={goToEventDetail}
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
        <Appbar.Content title="Etkinliklerim" titleStyle={{ color: 'white' }} />
      </Appbar.Header>

      {/* Arama kutusu */}
      <Searchbar
        placeholder="Ara..."
        onChangeText={(text) => setSearchQuery(text)}
        value={searchQuery}
        className="mx-4 mt-4 mb-3 bg-white rounded-xl shadow-sm"
      />

      <FlatList
        data={filteredEvents}
        renderItem={renderEventCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchMyEvents}
            colors={['#007bff']}
            tintColor={'#007bff'}
          />
        }
        ListEmptyComponent={
          !refreshing && (
            <Text className="text-center text-gray-400 mt-12 text-base">
              Henüz oluşturulmuş bir etkinlik bulunmamaktadır.
              {searchQuery ? ' Arama sonucunda etkinlik bulunamadı.' : ''}
            </Text>
          )
        }
      />
    </View>
  );
}
