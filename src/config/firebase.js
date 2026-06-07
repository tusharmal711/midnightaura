import { initializeApp } from "firebase/app";
import { getMessaging }  from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCbfFu9fwxThW_A0mN20XJHytUv0G5AbSM",
  authDomain: "chomoktomok.firebaseapp.com",
  projectId: "chomoktomok",
  storageBucket: "chomoktomok.firebasestorage.app",
  messagingSenderId: "168896484730",
  appId: "1:168896484730:web:a0ade0d11a0c9dda2572c3",
  measurementId: "G-NRVHTVF9GW"
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);