import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCeuizWkJrvp2_iOxD4UOFL12Os2kOKybQ",
  authDomain: "living-india-7f73b.firebaseapp.com",
  projectId: "living-india-7f73b",
  storageBucket: "living-india-7f73b.firebasestorage.app",
  messagingSenderId: "439601825953",
  appId: "1:439601825953:web:cc38c29d819b86de03c8e0",
  measurementId: "G-N76WYJXS7K"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Global auth state listener utility
export const subscribeToAuth = (callback) => {
  return onAuthStateChanged(auth, callback);
};
