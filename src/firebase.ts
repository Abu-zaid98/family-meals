import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getDatabase, Database } from "firebase/database";
import { getAuth, Auth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Runtime validation to prevent cryptic Firebase errors
if (!firebaseConfig.projectId || !firebaseConfig.databaseURL) {
    console.error("Firebase Configuration is incomplete:", firebaseConfig);
    throw new Error(
        "Firebase Config Error: Project ID or Database URL is missing. " +
        "Ensure your .env file has VITE_FIREBASE_PROJECT_ID and VITE_FIREBASE_DATABASE_URL."
    );
}

// Singleton pattern to handle Vite HMR (Hot Module Replacement)
let app: FirebaseApp;
if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

// Initialize and export services
export const db: Database = getDatabase(app);
export const auth: Auth = getAuth(app);
export default app;