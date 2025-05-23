import axios from 'axios';
import { BASE_URL } from '@env';

console.log("BASE_URL: ", BASE_URL.trim()); // BASE_URL'in sonundaki boşlukları temizle

export const studentApi = axios.create({
  baseURL: `${BASE_URL.trim()}/active`,
});

console.log("studentApi baseURL:", studentApi.defaults.baseURL);

export const graduateApi = axios.create({
  baseURL: `${BASE_URL.trim()}/passive`,
});
console.log("studentApi baseURL:", graduateApi.defaults.baseURL);
export const commonApi = axios.create({
  baseURL: `${BASE_URL.trim()}/action`,
});
console.log("comooonn:", commonApi.defaults.baseURL);
export const uploadApi = axios.create({
  baseURL: `${BASE_URL.trim()}/upload`,
});
console.log("studentApi baseURL:", uploadApi.defaults.baseURL);


