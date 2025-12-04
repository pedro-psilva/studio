import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA4j_4m4Ya2V8QUYf613aXYETcO-F3XN-s",
  authDomain: "studio-1776798305-10e02.firebaseapp.com",
  projectId: "studio-1776798305-10e02",
  storageBucket: "studio-1776798305-10e02.firebasestorage.app",
  messagingSenderId: "450115064682",
  appId: "1:450115064682:web:5e43afc6ecb643a0c1cb13"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
