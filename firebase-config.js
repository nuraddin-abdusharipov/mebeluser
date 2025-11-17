// firebase-config.js
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

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
