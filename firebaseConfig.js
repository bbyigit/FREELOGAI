// firebaseConfig.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // <-- YENİ EKLENDİ
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB-_FsMHiK0qQ0H4V7udoegd7Z4Nq0ZqNg",
  authDomain: "freelog-mvp-blkn2025.firebaseapp.com",
  projectId: "freelog-mvp-blkn2025",
  storageBucket: "freelog-mvp-blkn2025.firebasestorage.app",
  messagingSenderId: "916665416920",
  appId: "1:916665416920:web:d5a4658324e732a166abad"
};

// Next.js'de server-side çalıştığında hata vermemesi için kontrol:
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);
const auth = getAuth(app); // <-- YENİ EKLENDİ (Kimlik doğrulama servisini başlatıyoruz)

export { db, auth }; // <-- GÜNCELLENDİ (Artık auth'u da dışarı aktarıyoruz)
export const storage = getStorage(app);