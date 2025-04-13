// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDMW9B11WwuDgaqGMP161snISp-Y9eYGw4",
  authDomain: "buzapp-45e3e.firebaseapp.com",
  databaseURL: "https://buzapp-45e3e.firebaseio.com",
  projectId: "buzapp-45e3e",
  storageBucket: "buzapp-45e3e.appspot.com",
  messagingSenderId: "929630057360",
  appId: "1:929630057360:web:1bc4bddcddd27fd28bf915"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Initialize Socket.IO
const socket = io();

// DOM Elements
const app = document.getElementById('app');

// Global Variables
let currentUser = null;
let users = {};
let groups = {};

// Load users and groups from Firebase
function loadData() {
  database.ref('users').once('value').then(snapshot => {
    users = snapshot.val() || {};
  });

  database.ref('groups').once('value').then(snapshot => {
    groups = snapshot.val() || {};
  });
}

// Save users and groups to Firebase
function saveData() {
  database.ref('users').set(users);
  database.ref('groups').set(groups);
}

// Function to play a beep sound using AudioContext
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

// Show Login Page
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

// Show Signup Page
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

// Toggle Password Visibility
function togglePasswordVisibility() {
  const passwordField = document.getElementById('password');
  const confirmPasswordField = document.getElementById('confirmPassword');
  const isChecked = document.getElementById('showPassword').checked;
  passwordField.type = isChecked ? 'text' : 'password';
  confirmPasswordField.type = isChecked ? 'text' : 'password';
}

// Show Forgot Password Page
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

// Reset Password
function resetPassword() {
  const phone = document.getElementById('phone').value;
  const user = users[phone];
  if (user) {
    const newPassword = prompt('Enter a new password');
    user.password = newPassword;
    saveData();
    alert('Password reset successful');
    showLogin();
  } else {
    alert('User not found');
  }
}

// Login Function
function login() {
  const phone = document.getElementById('phone').value;
  const password = document.getElementById('password').value;
  const user = users[phone];
  if (user && user.password === password) {
    currentUser = user;
    showGroups();
  } else {
    alert('Invalid login');
  }
}

// Signup Function
function signup() {
  const name = document.getElementById('name').value;
  const phone = document.getElementById('phone').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (password !== confirmPassword) {
    alert('Passwords do not match');
    return;
  }

  if (users[phone]) {
    alert('User already exists');
    return;
  }

  const newUser = { name, phone, password };
  users[phone] = newUser;
  saveData();
  alert('Signup successful');
  showLogin();
}

// Logout Function
function logout() {
  currentUser = null;
  showLogin();
}

// Show Groups Page
function showGroups() {
  const userGroups = Object.values(groups).filter(g => g.owner === currentUser.phone);
  app.innerHTML = `
    <div class="container">
      <div class="banner">My Groups</div>
      ${userGroups.map(g => `
        <div class="group-section">
          <b>${g.name}</b><br>
          <button onclick="editGroup('${g.name}')">Edit</button>
          <button onclick="removeGroup('${g.name}')">Remove</button>
          <button onclick="buzzAll('${g.name}')">Buzz All</button>
        </div>
      `).join('')}
      <button onclick="createGroup()">Create New Group</button>
      <button onclick="logout()">Logout</button>
    </div>
  `;
}

// Create New Group
function createGroup() {
  const groupName = prompt('Enter group name:');
  if (!groupName) return;
  const newGroup = { name: groupName, members: [], owner: currentUser.phone };
  groups[groupName] = newGroup;
  save
::contentReference[oaicite:0]{index=0}
 
