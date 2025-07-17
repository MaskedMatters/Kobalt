// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBp3OJFH_2xjpuiqlKBvkNT4tBUMJBfOnU",
    authDomain: "codak-8c425.firebaseapp.com",
    projectId: "codak-8c425",
    storageBucket: "codak-8c425.firebasestorage.app",
    messagingSenderId: "297701886415",
    appId: "1:297701886415:web:67cf26a853d51dd5632aba",
    measurementId: "G-5WMJLXPNLD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);