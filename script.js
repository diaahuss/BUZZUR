const app = document.getElementById('app');
let users = JSON.parse(localStorage.getItem('users') || '[]');
let currentUser = null;

function renderLogin() {
  app.innerHTML = `
    <div class="container">
      <h2>BUZZUR</h2>
      <input type="tel" id="login-phone" placeholder="Phone Number">
      <input type="password" id="login-pass" placeholder="Password">
      <button onclick="login()">Login</button>
      <p>No account? <a href="#" onclick="renderSignup()">Sign up</a></p>
    </div>
  `;
}

function renderSignup() {
  app.innerHTML = `
    <div class="container">
      <h2>Sign Up</h2>
      <input type="text" id="signup-name" placeholder="Name">
      <input type="tel" id="signup-phone" placeholder="Phone Number">
      <input type="password" id="signup-pass" placeholder="Password">
      <input type="password" id="signup-confirm" placeholder="Confirm Password">
      <button onclick="signup()">Create Account</button>
      <p><a href="#" onclick="renderLogin()">Back to Login</a></p>
    </div>
  `;
}

function login() {
  const phone = document.getElementById('login-phone').value.trim();
  const pass = document.getElementById('login-pass').value.trim();

  const user = users.find(u => u.phone === phone && u.password === pass);
  if (user) {
    currentUser = user;
    alert(`Welcome back, ${user.name}!`);
    // You can now call renderDashboard() or move to the next step
  } else {
    alert('Invalid phone or password.');
  }
}

function signup() {
  const name = document.getElementById('signup-name').value.trim();
  const phone = document.getElementById('signup-phone').value.trim();
  const pass = document.getElementById('signup-pass').value;
  const confirm = document.getElementById('signup-confirm').value;

  if (!name || !phone || !pass) {
    return alert("Please fill in all fields.");
  }

  if (pass !== confirm) {
    return alert("Passwords do not match.");
  }

  if (users.find(u => u.phone === phone)) {
    return alert("User already exists.");
  }

  users.push({ name, phone, password: pass });
  localStorage.setItem('users', JSON.stringify(users));
  alert("Account created!");
  renderLogin();
}

// Start the app
renderLogin();
