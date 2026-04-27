import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCDh6ufHMMxArhiM3WzDULGIO-pTp-7K44",
  authDomain: "krisho-9e636.firebaseapp.com",
  projectId: "krisho-9e636",
  storageBucket: "krisho-9e636.firebasestorage.app",
  messagingSenderId: "865762828626",
  appId: "1:865762828626:web:12dcdc779717208cb61a8b",
  measurementId: "G-GN2G51Q54T"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const analytics = getAnalytics(app);
