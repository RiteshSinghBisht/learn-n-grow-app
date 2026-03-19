// ===========================
// FIREBASE CONFIGURATION
// ===========================

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
    apiKey: "AIzaSyA6wSZHxwjcBcw8dukTe0Y7fPt0I2_KpDI",
    authDomain: "learn-n-grow-7ef71.firebaseapp.com",
    projectId: "learn-n-grow-7ef71",
    storageBucket: "learn-n-grow-7ef71.firebasestorage.app",
    messagingSenderId: "163611447784",
    appId: "1:163611447784:web:f2ba39030080c68741145d",
    measurementId: "G-NFVQ5RWQ4H"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

// Initialize Services
const auth = firebase.auth();
const db = firebase.firestore();
window.LEARN_N_GROW_FIREBASE_CONFIG = firebaseConfig;
window.firebaseApp = app;
window.auth = auth;
window.db = db;

// Console log to confirm init (can be removed later)
console.log("Firebase initialized:", app.name);
