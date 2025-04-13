// src/firebase-config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyDMW9B11WwuDgaqGMP161snISp-Y9eYGw4",
  authDomain: "buzapp-45e3e.firebaseapp.com",
  databaseURL: "https://buzapp-45e3e-default-rtdb.firebaseio.com",
  projectId: "buzapp-45e3e",
  storageBucket: "buzapp-45e3e.firebasestorage.app",
  messagingSenderId: "929630057360",
  appId: "1:929630057360:web:1bc4bddcddd27fd28bf915"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
