import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, FIREBASE_PROJECT_ID, FIREBASE_STORAGE_BUCKET, FIREBASE_MESSAGING_SENDER_ID, FIREBASE_APP_ID, FIREBASE_MEASUREMENT_ID } from '@env';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker'; // Dosya seçimi için;
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);


const storage = getStorage(app);

// const uploadImageToStorage = async (uri, fileName) => {
//   const storageRef = ref(storage, `profileImage/${fileName}`); // Doğru şekilde referans oluştur
//   const response = await fetch(uri);
//   const blob = await response.blob();

//   await uploadBytes(storageRef, blob); // Fotoğrafı yükle
//   const photoUrl = await getDownloadURL(storageRef); // URL'yi al

//   return photoUrl;
// };

// /**
//  * PDF dosyasını Firebase'e yükleme fonksiyonu
//  */
// const uploadPdfToStorage = async () => {
//   try {
//     // 1. Kullanıcıdan bir PDF seçmesini iste
//     const pickerResult = await DocumentPicker.getDocumentAsync({
//       type: 'application/pdf',
//     });

//     if (pickerResult.canceled) {
//       console.log('Kullanıcı seçimi iptal etti.');
//       return;
//     }

//     const fileUri = pickerResult.assets[0].uri;
//     const fileName = pickerResult.assets[0].name || `upload_${Date.now()}.pdf`;

//     console.log('Seçilen dosya:', fileUri);

//     // 2. Dosya gerçekten var mı kontrol et
//     const fileInfo = await FileSystem.getInfoAsync(fileUri);

//     if (!fileInfo.exists) {
//       console.error('Dosya bulunamadı:', fileUri);
//       return;
//     }

//     // 3. Dosyayı blob'a çevir
//     const response = await fetch(fileUri);
//     const blob = await response.blob();

//     // 4. Storage'a yükle
//     const storageRef = ref(storage, `cv/${fileName}`);
//     await uploadBytes(storageRef, blob);

//     console.log('PDF başarıyla yüklendi!');

//     // 5. Dosyanın URL'ini al
//     const downloadUrl = await getDownloadURL(storageRef);
//     console.log('İndirilebilir URL:', downloadUrl);

//     return downloadUrl;

//   } catch (error) {
//     console.error('Dosya yükleme hatası:', error);
//   }
// };


export { storage };
