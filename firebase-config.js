// firebase-config.js - SODDA VERSIYA
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAli-zl-logpPl70uHAJTq7cq1ReiMPDGk",
    authDomain: "mebel-be376.firebaseapp.com",
    projectId: "mebel-be376",
    storageBucket: "mebel-be376.firebasestorage.app",
    messagingSenderId: "617901776386",
    appId: "1:617901776386:web:ba721f25f32c87b8b6111b"
};

// Firebase ni ishga tushirish
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
