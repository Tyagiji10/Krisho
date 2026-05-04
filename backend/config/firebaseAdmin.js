import './env.js';
import admin from 'firebase-admin';

// Check if Firebase service account credentials are provided
const initializeFirebaseAdmin = () => {
  try {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Handle both literal \n and real newlines, and remove any accidental surrounding quotes
          privateKey: process.env.FIREBASE_PRIVATE_KEY
            ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/^"|"$/g, '')
            : undefined,
        }),
      });
      console.log('✅ Firebase Admin Initialized successfully.');
      return admin.firestore();
    } else {
      console.log('⚠️  WARNING: Firebase credentials not found in env. Firestore integration will be disabled.');
      return null;
    }
  } catch (error) {
    console.error('❌ Firebase Admin Initialization Error:', error);
    return null;
  }
};

export const db = initializeFirebaseAdmin();
