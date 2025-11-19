// firebase-loader.js - Firebase ni yuklovchi fayl
console.log("Firebase yuklanmoqda...");

// Firebase ni global ravishda yuklash
const firebaseScript = document.createElement('script');
firebaseScript.src = "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
firebaseScript.onload = () => {
    console.log("Firebase App yuklandi");
    
    const firestoreScript = document.createElement('script');
    firestoreScript.src = "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
    firestoreScript.onload = () => {
        console.log("Firestore yuklandi");
        initializeFirebase();
    };
    document.head.appendChild(firestoreScript);
};
document.head.appendChild(firebaseScript);

function initializeFirebase() {
    const firebaseConfig = {
        apiKey: "AIzaSyAli-zl-logpPl70uHAJTq7cq1ReiMPDGk",
        authDomain: "mebel-be376.firebaseapp.com",
        projectId: "mebel-be376",
        storageBucket: "mebel-be376.firebasestorage.app",
        messagingSenderId: "617901776386",
        appId: "1:617901776386:web:ba721f25f32c87b8b6111b"
    };

    // Firebase ni ishga tushirish
    const app = firebase.initializeApp(firebaseConfig);
    const db = firebase.getFirestore(app);
    
    // Global o'zgaruvchilarga joylash
    window.db = db;
    window.firebase = firebase;
    window.firestore = firebase.firestore;
    
    console.log("Firebase muvaffaqiyatli ishga tushdi");
    
    // Agar ProductManager allaqachon yaratilgan bo'lsa, yangilash
    if (window.productManager) {
        window.productManager.db = db;
        window.productManager.firestore = firebase.firestore;
        window.productManager.loadProducts();
    }
}
