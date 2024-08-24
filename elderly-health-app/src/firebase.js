// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBURX5nEjL9MIISqZjyCqdY5x37c8CjzlA",
    authDomain: "fit5032a2-83d10.firebaseapp.com",
    projectId: "fit5032a2-83d10",
    storageBucket: "fit5032a2-83d10.appspot.com",
    messagingSenderId: "393122299236",
    appId: "1:393122299236:web:b4d33c19ab49692ed40e71",
    measurementId: "G-TQX5PB83G2"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
