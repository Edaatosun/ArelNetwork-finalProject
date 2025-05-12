 // ön yüzde ios ve android de aynı görüntü sağlansın diye
 export const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
};


export const formatDateTimeToLocal = (date, time) => {
    // Tarihi ve saati birleştir
    const dateTimeString = `${date}T${time}:00`; // format: YYYY-MM-DDTHH:mm:00

    // Date nesnesi oluştur
    const localDate = new Date(dateTimeString);


    // Yerel saat dilimine göre offset (fark) alalım
    const offset = localDate.getTimezoneOffset() * 60000; // Milisaniye cinsinden offset
    const localDateTime = new Date(localDate.getTime() - offset); // Yerel saate çevir

    // MongoDB'ye gönderilmek üzere UTC'ye çevrilecek şekilde ayarlıyoruz
    return localDateTime.toISOString(); // ISO 8601 formatında döndürüyoruz
};