// Connect to backend on Render using Socket.IO
const socket = io('https://buzzur-server.onrender.com');

// When the DOM is ready, load the login screen
document.addEventListener('DOMContentLoaded', () => {
  renderLogin();
});

// Toggle password visibility
function togglePassword(id) {
  const field = document.getElementById(id);
  if (field) {
    field.type = field.type === 'password' ? 'text' : 'password';
  }
}

// RENDER SCREENS

function renderLogin() {
  document.getElementById('app').innerHTML = `
    <h2>BUZZUR</h2>
    <form id="loginForm">
      <input type="tel" id="loginPhone" placeholder="Phone Number" required />
      <input type="password" id="loginPassword" placeholder="Password" required />
      <label><input type="checkbox" onclick="togglePassword('loginPassword')"> Show Password</label>
      <button type="submit">Login</button>
    </form>
    <p>
      <a href="#" onclick="renderForgot()">Forgot Password?</a>
      <a href="#" class="signup-link" onclick="renderSignup()">Sign Up</a>
    </p>
  `;
  document.getElementById('loginForm').addEventListener('submit', login);
}

function renderSignup() {
  document.getElementById('app').innerHTML = `
    <h2>Sign Up</h2>
    <form id="signupForm">
      <input type="text" id="signupName" placeholder="Name" required />
      <input type="tel" id="signupPhone" placeholder="Phone Number" required />
      <input type="password" id="signupPassword" placeholder="Password" required />
      <input type="password" id="signupConfirm" placeholder="Confirm Password" required />
      <label><input type="checkbox" onclick="togglePassword('signupPassword'); togglePassword('signupConfirm')"> Show Password</label>
      <button type="submit">Sign Up</button>
    </form>
    <p><a href="#" onclick="renderLogin()">Back to Login</a></p>
  `;
  document.getElementById('signupForm').addEventListener('submit', signup);
}

function renderForgot() {
  document.getElementById('app').innerHTML = `
    <h2>Reset Password</h2>
    <form id="forgotForm">
      <input type="tel" id="forgotPhone" placeholder="Phone Number" required />
      <button type="submit">Send Reset Link</button>
    </form>
    <p><a href="#" onclick="renderLogin()">Back to Login</a></p>
  `;
  document.getElementById('forgotForm').addEventListener('submit', resetPassword);
}

function renderMainApp() {
  const user = JSON.parse(localStorage.getItem('user'));
  document.getElementById('app').innerHTML = `
    <h2>My Groups</h2>
    <p>Welcome, ${user.name}</p>
    <button onclick="createGroup()">Create Group</button>
    <button onclick="logout()">Logout</button>
  `;
}

// AUTH + HANDLERS

async function login(event) {
  event.preventDefault();
  const phone = document.getElementById('loginPhone').value;
  const password = document.getElementById('loginPassword').value;

  const res = await fetch('https://buzzur-server.onrender.com/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password })
  });

  const data = await res.json();
  if (data.success) {
    localStorage.setItem('user', JSON.stringify(data.user));
    renderMainApp();
  } else {
    alert('Invalid login. Please try again.');
  }
}

async function signup(event) {
  event.preventDefault();
  const name = document.getElementById('signupName').value;
  const phone = document.getElementById('signupPhone').value;
  const password = document.getElementById('signupPassword').value;
  const confirm = document.getElementById('signupConfirm').value;

  if (password !== confirm) {
    return alert('Passwords do not match!');
  }

  const res = await fetch('https://buzzur-server.onrender.com/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, phone, password })
  });

  const data = await res.json();
  if (data.success) {
    alert('Signup successful. Please login.');
    renderLogin();
  } else {
    alert(data.message || 'Signup failed.');
  }
}

function resetPassword(event) {
  event.preventDefault();
  const phone = document.getElementById('forgotPhone').value;
  alert(`If this number is registered, a reset link will be sent to ${phone}.`);
  renderLogin();
}

function logout() {
  localStorage.removeItem('user');
  renderLogin();
}

// GROUP MANAGEMENT (Basic example)
function createGroup() {
  const name = prompt('Enter group name');
  const user = JSON.parse(localStorage.getItem('user'));
  if (name && user?.id) {
    fetch('https://buzzur-server.onrender.com/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, userId: user.id })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert('Group created!');
        // Could re-render group list here later
      } else {
        alert('Error creating group.');
      }
    });
  }
}

// Buzz notification listener
socket.on('buzz', () => {
  alert('🔔 You received a buzz!');
});
