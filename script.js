// Declare variables
let currentUser = null;

// Get DOM elements
const buzzButton = document.getElementById('buzz-button');
const buzzSound = document.getElementById('buzz-sound');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const dashboard = document.getElementById('dashboard');
const phoneInput = document.getElementById('phone-input');
const passwordInput = document.getElementById('password-input');
const usersList = document.getElementById('users-list');
const logoutButton = document.getElementById('logout-button');

// Initialize socket connection
const socket = io();

// Listen for buzzed event from the server
socket.on('buzzed', (data) => {
  console.log('Buzzed!', data);
  if (buzzSound) {
    buzzSound.play();
  }
  // Optionally show notifications or other UI updates based on the buzz
});

// Show login form and handle login
function login() {
  const phone = document.getElementById('login-phone').value;
  const password = document.getElementById('login-password').value;

  if (!phone || !password) {
    alert("Please enter both phone and password.");
    return;
  }

  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u => u.phone === phone && u.password === password);

  if (user) {
    currentUser = user;
    renderDashboard();
  } else {
    alert("Invalid credentials");
  }
}

// Handle signup form submission
function signup() {
  const name = document.getElementById('signup-name').value;
  const phone = document.getElementById('signup-phone').value;
  const password = document.getElementById('signup-password').value;
  const confirmPassword = document.getElementById('signup-confirm-password').value;

  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    return;
  }

  const newUser = {
    name,
    phone,
    password
  };

  let users = JSON.parse(localStorage.getItem('users') || '[]');
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  alert("Signup successful!");
  switchToLogin();
}

// Render the dashboard after login
function renderDashboard() {
  loginForm.style.display = 'none';
  signupForm.style.display = 'none';
  dashboard.style.display = 'block';

  // Display the current user info in the dashboard (for testing)
  document.getElementById('dashboard-name').innerText = `Welcome, ${currentUser.name}!`;
  
  // Populate the list of users (just for demo purposes)
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  usersList.innerHTML = '';
  users.forEach((user, index) => {
    const li = document.createElement('li');
    li.textContent = `${user.name} (${user.phone})`;
    usersList.appendChild(li);
  });
}

// Switch to signup form
function switchToSignup() {
  loginForm.style.display = 'none';
  signupForm.style.display = 'block';
  dashboard.style.display = 'none';
}

// Switch to login form
function switchToLogin() {
  loginForm.style.display = 'block';
  signupForm.style.display = 'none';
  dashboard.style.display = 'none';
}

// Event listener for login button
document.getElementById('login-button').addEventListener('click', login);

// Event listener for signup button
document.getElementById('signup-button').addEventListener('click', signup);

// Event listener for logout button
logoutButton.addEventListener('click', () => {
  currentUser = null;
  switchToLogin();
});

// Event listener for buzz button (triggering the buzz sound)
buzzButton.addEventListener('click', () => {
  if (!currentUser) {
    alert("Please log in first.");
    return;
  }

  // Emit a buzz event to all users (can pass group or member data here)
  const groupData = {
    groupId: 'example-group-id',  // For now, just a placeholder
    members: [
      { name: currentUser.name, phone: currentUser.phone }  // Just sending the current user for testing
    ]
  };

  socket.emit('buzz', groupData);
});

// Initially load the login form
switchToLogin();
