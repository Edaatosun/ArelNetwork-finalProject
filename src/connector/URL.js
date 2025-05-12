import axios from 'axios';
import { API_URL } from './BASE_URL';

// Global değişken
let baseUrl = API_URL;  // BASE_URL.js dosyasından gelen API_URL'i kullanıyoruz

// API URL'yi güncelleme fonksiyonu
export const setBaseUrl = (url) => {
    baseUrl = `${API_URL}/${url}`;  // baseURL'yi güncelliyoruz
    // Axios instance'ını güncelliyoruz
    api.defaults.baseURL = baseUrl;
    console.log("Base URL güncellendi:", api.defaults.baseURL);  // Yeni baseURL'i kontrol ediyoruz
};
  

// Axios instance
const api = axios.create({
  baseURL: baseUrl,  // Axios'u güncellenmiş baseUrl ile kuruyoruz
});
console.log("aaaaaaaaaaa",api.defaults);
export default api;
