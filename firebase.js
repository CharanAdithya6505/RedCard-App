import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyDxwEbRUjibnD73Q-f0xYeovUJ3cL5HcHk",
  authDomain: "edgescore-cafd3.firebaseapp.com",
  projectId: "edgescore-cafd3",
  storageBucket: "edgescore-cafd3.firebasestorage.app",
  messagingSenderId: "695072478192",
  appId: "1:695072478192:web:089c90467ce1ec2af1c335",
};

let app;
let auth;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} else {
  app = getApp();
  auth = getAuth();
}

export { app, auth };
