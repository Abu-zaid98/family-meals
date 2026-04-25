/*----*/

import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
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

const app = initializeApp(firebaseConfig);

// 👇 هذا هو المهم
export const db = getDatabase(app);
export const auth = getAuth(app);
