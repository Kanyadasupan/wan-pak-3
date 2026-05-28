import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // 👈 1. เพิ่มการ Import Auth ตรงนี้

// ⚠️ คำเตือนสำคัญ: ห้ามนำข้อมูลจาก serviceAccountKey.json มาใส่ตรงนี้นะครับ!
// ไฟล์นี้ต้องการ Firebase Web Config (หาได้จากหน้าตั้งค่าของ Firebase -> Your apps -> Web app)
const firebaseConfig = {
  apiKey: "AIzaSyByaePC935J9iPz_rTD0a1Or8YzpWh5rDM",
  authDomain: "wan-pak.firebaseapp.com",
  projectId: "wan-pak",
  storageBucket: "wan-pak.firebasestorage.app",
  messagingSenderId: "751497855436",
  appId: "1:751497855436:web:92bbbcc93cfe6ba2f75d69",
  measurementId: "G-GZM126QKK1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app); // 👈 2. เพิ่มการ Export auth ตรงนี้เพื่อให้ App.tsx เรียกใช้ได้