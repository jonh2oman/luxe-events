// Firebase client initialization and helper
// Falls back gracefully if environment variables are not yet configured.

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

let app;
let db = null;
let auth = null;
let isRealFirebase = false;

// Check if variables exist to configure real Firebase
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
    isRealFirebase = true;
    console.log("🔥 Firebase initialized successfully.");
  } catch (error) {
    console.error("⚠️ Error initializing Firebase. Falling back to Mock DB.", error);
  }
} else {
  // If not configured, we'll log it in development
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    console.warn("ℹ️ Firebase environment variables are not configured. Luxe Events is running in Mock DB mode.");
  }
}

export { app, db, auth, isRealFirebase };
