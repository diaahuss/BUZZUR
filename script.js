const app = document.getElementById('app');

function renderLogin() {
  app.innerHTML = `
    <div class="container">
      <h1 class="banner">BUZZUR</h1>
      <input type="tel" id="login-phone" placeholder="Phone Number">
      <div class="password-wrapper">
        <input type="password" id="login-pass" placeholder="Password">
        <span class="toggle-eye" onclick="togglePassword('login-pass', this)">👁️</span>
      </div>
      <button onclick="login()">Login</button>
      <p>No account? <a href="#" onclick="renderSignup()">Sign up</a></p>
    </div>
  `;
}

function renderSignup() {
  app.innerHTML = `
    <div class="container">
      <h1 class="banner">Sign Up</h1>
      <input type="text" id="signup-name" placeholder="Name">
      <input type="tel" id="signup-phone" placeholder="Phone Number">
      <div class="password-wrapper">
        <input type="password" id="signup-pass" placeholder="Password">
        <span class="toggle-eye" onclick="togglePassword('signup-pass', this)">👁️</span>
      </div>
      <div class="password-wrapper">
        <input type="password" id="signup-confirm" placeholder="Confirm Password">
        <span class="toggle-eye" onclick="togglePassword('signup-confirm', this)">👁️</span>
      </div>
      <button onclick="signup()">Create Account</button>
      <p><a href="#" onclick="renderLogin()">Back to Login</a></p>
    </div>
  `;
}

function togglePassword(id, icon) {
  const input = document.getElementById(id);
  if (input.type === "password") {
    input.type = "text";
    icon.textContent = "🙈";
  } else {
    input.type = "password";
    icon.textContent = "👁️";
  }
}

// Dummy login/signup functions
function login() {
  alert("Login clicked");
}

function signup() {
  alert("Signup clicked");
}

// Start with login screen
renderLogin();
