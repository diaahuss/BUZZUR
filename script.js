let socket = io('https://buzzur-server.onrender.com');

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  renderLogin(); // default to login screen
});

// Renders login screen
function renderLogin() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h2>Login</h2>
    <form id="loginForm">
      <input type="text" id="loginPhone" placeholder="Phone Number" required />
      <input type="password" id="loginPassword" placeholder="Password" required />
      <label><input type="checkbox" onclick="togglePassword('loginPassword')"> Show Password</label>
      <button type="submit">Login</button>
    </form>
    <p><a href="#" onclick="renderSignup()">Sign up</a> | <a href="#" onclick="renderForgot()">Forgot Password?</a></p>
  `;
  document.getElementById('loginForm').addEventListener('submit', login);
}

// Renders signup screen
function renderSignup() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h2>Sign Up</h2>
    <form id="signupForm">
      <input type="text" id="signupName" placeholder="First Name" required />
      <input type="number" id="signupPhone" placeholder="Phone Number" required />
      <input type="password" id="signupPassword" placeholder="Password" required />
      <input type="password" id="signupConfirm" placeholder="Confirm Password" required />
      <label><input type="checkbox" onclick="togglePassword('signupPassword'); togglePassword('signupConfirm')"> Show Password</label>
      <button type="submit">Sign Up</button>
    </form>
    <p><a href="#" onclick="renderLogin()">Already have an account? Login</a></p>
  `;
  document.getElementById('signupForm').addEventListener('submit', signup);
}

// Renders forgot password screen
function renderForgot() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h2>Forgot Password</h2>
    <form id="forgotForm">
      <input type="number" id="forgotPhone" placeholder="Phone Number" required />
      <button type="submit">Reset Password</button>
    </form>
    <p><a href="#" onclick="renderLogin()">Back to Login</a></p>
  `;
  document.getElementById('forgotForm').addEventListener('submit', resetPassword);
}

// Toggle show password
function togglePassword(fieldId) {
  const field = document.getElementById(fieldId);
  if (field) field.type = field.type === 'password' ? 'text' : 'password';
}

// Handle login
async function login(event) {
  event.preventDefault();
  const phone = document.getElementById('loginPhone').value;
  const password = document.getElementById('loginPassword').value;

  const response = await fetch('https://buzzur-server.onrender.com/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password })
  });

  const data = await response.json();
  if (data.success) {
    localStorage.setItem('user', JSON.stringify(data.user));
    renderHome();
  } else {
    alert('Invalid login credentials.');
  }
}

// Handle signup
async function signup(event) {
  event.preventDefault();
  const name = document.getElementById('signupName').value;
  const phone = document.getElementById('signupPhone').value;
  const password = document.getElementById('signupPassword').value;
  const confirm = document.getElementById('signupConfirm').value;

  if (password !== confirm) {
    return alert('Passwords do not match!');
  }

  const response = await fetch('https://buzzur-server.onrender.com/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, phone, password })
  });

  const data = await response.json();
  if (data.success) {
    alert('Signup successful. Please login.');
    renderLogin();
  } else {
    alert('Error: ' + data.message);
  }
}

// Dummy forgot password handler
function resetPassword(event) {
  event.preventDefault();
  const phone = document.getElementById('forgotPhone').value;
  alert(`If account exists, a reset link will be sent to ${phone}.`);
  renderLogin();
}

// Render the main page after login
function renderHome() {
  const user = JSON.parse(localStorage.getItem('user'));
  const app = document.getElementById('app');
  app.innerHTML = `
    <h2>Welcome, ${user.name}</h2>
    <button onclick="createGroup()">Create Group</button>
    <button onclick="logout()">Logout</button>
  `;
}

// Logout
function logout() {
  localStorage.removeItem('user');
  renderLogin();
}

// Create group
function createGroup() {
  const groupName = prompt('Enter group name');
  if (groupName) {
    const user = JSON.parse(localStorage.getItem('user'));
    fetch('https://buzzur-server.onrender.com/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: groupName, userId: user.id })
    })
    .then(res => res.json())
    .then(data => {
      alert('Group created!');
    });
  }
}

// Socket.io buzz feature
socket.on('buzz', () => {
  alert('🔔 Buzz received!');
});
