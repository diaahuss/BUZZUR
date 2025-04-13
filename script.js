// Import necessary Firebase modules
// src/app.js
import { auth, db } from './firebase-config';

// Now you can use auth and db in your application

import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";

// Firebase configuration object
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// DOM elements for sign-up and sign-in forms
const signUpForm = document.getElementById("signUpForm");
const signInForm = document.getElementById("signInForm");
const signOutButton = document.getElementById("signOutButton");

// Event listener for sign-up form submission
signUpForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = signUpForm.email.value;
  const password = signUpForm.password.value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed up
      console.log("User signed up:", userCredential.user);
      signUpForm.reset();
    })
    .catch((error) => {
      console.error("Error signing up:", error.message);
    });
});

// Event listener for sign-in form submission
signInForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = signInForm.email.value;
  const password = signInForm.password.value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      console.log("User signed in:", userCredential.user);
      signInForm.reset();
    })
    .catch((error) => {
      console.error("Error signing in:", error.message);
    });
});

// Event listener for sign-out button
signOutButton.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      // Signed out
      console.log("User signed out");
    })
    .catch((error) => {
      console.error("Error signing out:", error.message);
    });
});
