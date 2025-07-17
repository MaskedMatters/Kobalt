// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { userStore } from 'sveltefire';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCfyL6cp1bKm-jCNzEoBIz5AOFbTG3hB-4",
    authDomain: "kobalt-pqar.firebaseapp.com",
    projectId: "kobalt-pqar",
    storageBucket: "kobalt-pqar.firebasestorage.app",
    messagingSenderId: "177478639434",
    appId: "1:177478639434:web:c25eef42d382476606ebb3",
    measurementId: "G-3G21WERKZH"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const user = userStore(auth);