import React from 'react';
import { Platform } from 'react-native';

// Kayıt için: String'i Date nesnesine çeviren fonksiyon
export const convertStringToDate = (dateString) => {
    if (Platform.OS === 'ios') {
        // iOS tarih formatlamasında ayarlama yapabiliyoruz
        return new Date(dateString); // YYYY-MM-DD string direkt Date nesnesine çevrilebilir
    } else {
        // Android için daha dikkatli olmak lazım
        // Çünkü Android bazen saat farkı ekleyebiliyor, o yüzden bölerek veriyoruz
        const [year, month, day] = dateString.split('-');
        return new Date(year, month - 1, day); // month - 1 çünkü JS'de aylar 0-11 arası
    }
};

// Gösterim için: Date'i kullanıcıya düzgün gösterecek fonksiyon
export const formatDateForDisplay = (dateString) => {
    const date = new Date(dateString);

    let day = date.getDate();
    let month = date.getMonth() + 1; // Ay 0'dan başlar, +1 ekliyoruz
    let year = date.getFullYear();

    // Tek haneli gün ve ayları 2 basamaklı yapmak için
    if (day < 10) {
        day = `0${day}`;
    }
    if (month < 10) {
        month = `0${month}`;
    }

    return `${day}.${month}.${year}`; // Örneğin: 27.04.2025
};

