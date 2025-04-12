let socket = io('https://buzzur-server.onrender.com'); // Connected to backend

document.addEventListener('DOMContentLoaded', () => {
  renderLogin();
});

function renderLogin() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h1>BUZZUR</h1>
    <form id="loginForm">
      <input type="tel" id="loginPhone" placeholder="Phone Number" required />
      <input type="password" id="loginPassword" placeholder="Password" required />
      <label><input type="checkbox" id="toggleLoginPassword" /> Show Password</label>
      <button type="submit">Login</button>
    </form>
    <div class="links">
      <a href="#" onclick="renderForgot()">Forgot Password?</a>
      <a href="#" onclick="renderSignup()" class="signup-link">Sign Up</a>
    </div>
  `;

  document.getElementById('loginForm').addEventListener('submit', login);
  document.getElementById('toggleLoginPassword').addEventListener('change', (e) => {
    const input = document.getElementById('loginPassword');
    input.type = e.target.checked ? 'text' : 'password';
  });
}

function renderSignup() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h1>Sign Up</h1>
    <form id="signupForm">
      <input type="text" id="signupName" placeholder="Full Name" required />
      <input type="tel" id="signupPhone" placeholder="Phone Number" required />
      <input type="password" id="signupPassword" placeholder="Password" required />
      <input type="password" id="signupConfirm" placeholder="Confirm Password" required />
      <label><input type="checkbox" id="toggleSignupPassword" /> Show Password</label>
      <button type="submit">Sign Up</button>
    </form>
    <div class="links">
      <a href="#" onclick="renderLogin()">Back to Login</a>
    </div>
  `;

  document.getElementById('signupForm').addEventListener('submit', signup);
  document.getElementById('toggleSignupPassword').addEventListener('change', (e) => {
    const p1 = document.getElementById('signupPassword');
    const p2 = document.getElementById('signupConfirm');
    const type = e.target.checked ? 'text' : 'password';
    p1.type = type;
    p2.type = type;
  });
}

function renderForgot() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h1>Reset Password</h1>
    <form id="forgotForm">
      <input type="tel" id="forgotPhone" placeholder="Phone Number" required />
      <button type="submit">Reset</button>
    </form>
    <div class="links">
      <a href="#" onclick="renderLogin()">Back to Login</a>
    </div>
  `;

  document.getElementById('forgotForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const phone = document.getElementById('forgotPhone').value;
    alert(`If account exists, a reset link will be sent to ${phone}.`);
    renderLogin();
  });
}

// Auth logic
async function login(e) {
  e.preventDefault();
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
    renderMain();
  } else {
    alert('Invalid credentials');
  }
}

async function signup(e) {
  e.preventDefault();
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
    alert('Signup successful. Please log in.');
    renderLogin();
  } else {
    alert('Signup failed: ' + data.message);
  }
}

function renderMain() {
  const user = JSON.parse(localStorage.getItem('user'));
  const app = document.getElementById('app');
  app.innerHTML = `
    <h1>My Groups</h1>
    <p>Welcome, ${user.name}</p>
    <button onclick="createGroup()">Create Group</button>
    <button onclick="logout()">Logout</button>
  `;
}

// Dummy create group
function createGroup() {
  const name = prompt('Group name?');
  if (name) {
    const userId = JSON.parse(localStorage.getItem('user')).id;
    fetch('https://buzzur-server.onrender.com/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, userId })
    }).then(r => r.json())
      .then(data => alert('Group created!'));
  }
}

function logout() {
  localStorage.removeItem('user');
  renderLogin();
}

// Buzz listener
socket.on('buzz', () => {
  alert('🔔 Buzz received!');
});
