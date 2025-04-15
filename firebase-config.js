// firebase-config.js

// Import and configure Firebase
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database"; // If you plan to use Firebase Realtime Database

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",               // Get from your Firebase Console
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com", // Firebase auth domain
  databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com", // Firebase DB URL
  projectId: "YOUR_PROJECT_ID",         // Project ID from Firebase
  storageBucket: "YOUR_PROJECT_ID.appspot.com", // Storage bucket
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",                 // Get from your Firebase Console
};

firebase.initializeApp(firebaseConfig);

export default firebase;
