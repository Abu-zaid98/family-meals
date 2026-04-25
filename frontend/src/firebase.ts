// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCpAa67dxj3pF5nim0zLFJ6VDESU6xvi74",
    authDomain: "todos-617b3.firebaseapp.com",
    databaseURL: "https://todos-617b3-default-rtdb.firebaseio.com",
    projectId: "todos-617b3",
    storageBucket: "todos-617b3.firebasestorage.app",
    messagingSenderId: "691011560373",
    appId: "1:691011560373:web:911acf7d96c89219f0affc",
    measurementId: "G-X6S4V5FYZF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
console.log("ENV CHECK:", {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    db: import.meta.env.VITE_FIREBASE_DATABASE_URL,
});