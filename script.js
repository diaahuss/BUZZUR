// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDMW9B11WwuDgaqGMP161snISp-Y9eYGw4",
  authDomain: "buzapp-45e3e.firebaseapp.com",
  projectId: "buzapp-45e3e",
  storageBucket: "buzapp-45e3e.appspot.com",
  messagingSenderId: "929630057360",
  appId: "1:929630057360:web:1bc4bddcddd27fd28bf915",
  databaseURL: "https://buzapp-45e3e-default-rtdb.firebaseio.com"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Initialize Socket.IO
const socket = io();

// DOM element
const app = document.getElementById('app');

// Current user
let currentUser = null;

// Function to play a beep sound
function playBeep() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
  oscillator.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.2);
}

// Listen for 'buzz' event from the server
socket.on('buzz', (data) => {
  console.log(data.message);
  playBeep();
});

// Show login form
function showLogin() {
  app.innerHTML = `
    <div class="container">
      <div class="banner">Login</div>
      <input type="text" id="phone" placeholder="Phone Number">
      <input type="password" id="password" placeholder="Password">
      <button onclick="login()">Login</button>
      <p>Don't have an account? <a href="#" onclick="showSignup()">Sign up</a></p>
      <p><a href="#" onclick="showForgotPassword()">Forgot Password?</a></p>
    </div>
  `;
}

// Show signup form
function showSignup() {
  app.innerHTML = `
    <div class="container">
      <div class="banner">Signup</div>
      <input type="text" id="name" placeholder="Name">
      <input type="text" id="phone" placeholder="Phone Number">
      <input type="password" id="password" placeholder="Password">
      <input type="password" id="confirmPassword" placeholder="Confirm Password">
      <label class="show-password">
        <input type="checkbox" id="showPassword"> Show Password
      </label>
      <button onclick="signup()">Sign Up</button>
      <p>Already have an account? <a href="#" onclick="showLogin()">Login</a></p>
    </div>
  `;

  document.getElementById('showPassword').addEventListener('change', togglePasswordVisibility);
}

// Toggle password visibility
function togglePasswordVisibility() {
  const passwordField = document.getElementById('password');
  const confirmPasswordField = document.getElementById('confirmPassword');
  const isChecked = document.getElementById('showPassword').checked;
  passwordField.type = isChecked ? 'text' : 'password';
  confirmPasswordField.type = isChecked ? 'text' : 'password';
}

// Show forgot password form
function showForgotPassword() {
  app.innerHTML = `
    <div class="container">
      <div class="banner">Forgot Password</div>
      <input type="text" id="phone" placeholder="Phone Number">
      <button onclick="resetPassword()">Reset Password</button>
      <p>Remembered your password? <a href="#" onclick="showLogin()">Login</a></p>
    </div>
  `;
}

// Reset password
function resetPassword() {
  const phone = document.getElementById('phone').value;
  const usersRef = database.ref('users');

  usersRef.orderByChild('phone').equalTo(phone).once('value', snapshot => {
    if (snapshot.exists()) {
      const userKey = Object.keys(snapshot.val())[0];
      const newPassword = prompt('Enter a new password');
      if (newPassword) {
        usersRef.child(userKey).update({ password: newPassword });
        alert('Password reset successful');
        showLogin();
      }
    } else {
      alert('User not found');
    }
  });
}

// Login function
function login() {
  const phone = document.getElementById('phone').value;
  const password = document.getElementById('password').value;
  const usersRef = database.ref('users');

  usersRef.orderByChild('phone').equalTo(phone).once('value', snapshot => {
    if (snapshot.exists()) {
      const user = Object.values(snapshot.val())[0];
      if (user.password === password) {
        currentUser = user;
        currentUser.key = Object.keys(snapshot.val())[0];
        showGroups();
      } else {
        alert('Invalid password');
      }
    } else {
      alert('User not found');
    }
  });
}

// Signup function
function signup() {
  const name = document.getElementById('name').value;
  const phone = document.getElementById('phone').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (password !== confirmPassword) {
    alert('Passwords do not match');
    return;
  }

  const usersRef = database.ref('users');

  usersRef.orderByChild('phone').equalTo(phone).once('value', snapshot => {
    if (snapshot.exists()) {
      alert('User already exists');
    } else {
      const newUser = { name, phone, password };
      usersRef.push(newUser, error => {
        if (error) {
          alert('Error signing up');
        } else {
          alert('Signup successful');
          showLogin();
        }
      });
    }
  });
}

// Logout function
function logout() {
  currentUser = null;
  showLogin();
}

// Show groups
function showGroups() {
  const groupsRef = database.ref('groups');
  groupsRef.orderByChild('owner').equalTo(currentUser.phone).once('value', snapshot => {
    const groupsData = snapshot.val() || {};
    const groupEntries = Object.entries(groupsData);

    app.innerHTML = `
      <div class="container">
        <div class="banner">My Groups</div>
        ${groupEntries.map(([key, group]) => `
          <div class="group-section">
            <b>${group.name}</b><br>
            <button onclick="editGroup('${key}')">Edit</button>
            <button onclick="removeGroup('${key}')">Remove</button>
            <button onclick="buzzAll('${key}')">Buzz All</button>
          </div>
        `).join('')}
        <button onclick="createGroup
::contentReference[oaicite:0]{index=0}
 
