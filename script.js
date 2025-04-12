let socket = io('https://buzzur-server.onrender.com'); // Replace with your server URL

// Render the login page
function renderLogin() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h2>Login to BUZZUR</h2>
    <form id="loginForm">
      <input type="tel" id="loginPhone" placeholder="Phone Number" required />
      <input type="password" id="loginPassword" placeholder="Password" required />
      <label><input type="checkbox" onclick="togglePassword('loginPassword')"> Show Password</label>
      <button type="submit">Login</button>
    </form>
    <p><a href="#" onclick="renderSignup()">Sign up</a> | <a href="#" onclick="renderForgot()">Forgot Password?</a></p>
  `;

  document.getElementById('loginForm').addEventListener('submit', login);
}

// Show/hide password function
function togglePassword(fieldId) {
  const field = document.getElementById(fieldId);
  field.type = field.type === 'password' ? 'text' : 'password';
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
    localStorage.setItem('user', JSON.stringify(data.user));  // Store user info
    renderHome();  // Show main page after login
  } else {
    alert('Invalid login credentials.');
  }
}
