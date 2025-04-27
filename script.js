const app = document.getElementById("app");
const API_BASE_URL = "https://buzzur-server.onrender.com";
const socket = io(API_BASE_URL);
let currentUser = null;

// Utility functions
function showLoading(message = "Loading...") {
  app.innerHTML = `<div class="container"><p class="loading">${message}</p></div>`;
}

function showError(message) {
  const errorContainer = document.querySelector('.error-container') || document.createElement('div');
  errorContainer.className = 'error-container';
  errorContainer.innerHTML = `<p class="error">${message}</p>`;
  
  if (!document.querySelector('.error-container')) {
    const container = document.querySelector('.container') || app;
    container.prepend(errorContainer);
  }
  
  setTimeout(() => {
    errorContainer.style.opacity = '0';
    setTimeout(() => errorContainer.remove(), 300);
  }, 5000);
}

// Authentication Views
function showLogin() {
  app.innerHTML = `
    <div class="banner">BUZZUR</div>
    <div class="container">
      <div class="error-container"></div>
      <h2>Login</h2>
      <input type="text" id="loginPhone" placeholder="Phone Number" required>
      <input type="password" id="loginPassword" placeholder="Password" required>
      <label><input type="checkbox" id="showLoginPassword"> Show Password</label>
      <button onclick="handleLogin()" id="loginBtn">Login</button>
      <p><a href="#" onclick="showReset()">Forgot Password?</a> | 
         <a href="#" onclick="showSignup()">Sign Up</a></p>
    </div>
  `;

  document.getElementById("showLoginPassword").addEventListener("change", function() {
    const pwd = document.getElementById("loginPassword");
    pwd.type = this.checked ? "text" : "password";
  });
}

function showSignup() {
  app.innerHTML = `
    <div class="banner">BUZZUR</div>
    <div class="container">
      <div class="error-container"></div>
      <h2>Sign Up</h2>
      <input type="text" id="signupName" placeholder="Name" required>
      <input type="text" id="signupPhone" placeholder="Phone Number" required>
      <input type="password" id="signupPassword" placeholder="Password" required minlength="6">
      <input type="password" id="signupConfirm" placeholder="Confirm Password" required>
      <label><input type="checkbox" id="showSignupPassword"> Show Password</label>
      <button onclick="handleSignup()" id="signupBtn">Sign Up</button>
      <p><a href="#" onclick="showLogin()">Back to Login</a></p>
    </div>
  `;

  document.getElementById("showSignupPassword").addEventListener("change", function() {
    const pwd = document.getElementById("signupPassword");
    const confirm = document.getElementById("signupConfirm");
    pwd.type = confirm.type = this.checked ? "text" : "password";
  });
}

// Authentication Handlers
async function handleLogin() {
  const phoneNumber = document.getElementById("loginPhone").value.trim();
  const password = document.getElementById("loginPassword").value;
  const loginBtn = document.getElementById("loginBtn");

  // Disable button during request
  loginBtn.disabled = true;
  loginBtn.textContent = "Logging in...";

  try {
    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: phoneNumber,
        password: password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed. Please try again.");
    }

    // Store the authentication token
    localStorage.setItem("authToken", data.token);
    currentUser = data.user;
    
    // Connect socket with auth token
    socket.auth = { token: data.token };
    socket.connect();
    
    showDashboard();
  } catch (error) {
    showError(error.message);
    console.error("Login error:", error);
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = "Login";
  }
}

async function handleSignup() {
  const name = document.getElementById("signupName").value.trim();
  const phone = document.getElementById("signupPhone").value.trim();
  const password = document.getElementById("signupPassword").value;
  const confirmPassword = document.getElementById("signupConfirm").value;
  const signupBtn = document.getElementById("signupBtn");

  // Disable button during request
  signupBtn.disabled = true;
  signupBtn.textContent = "Creating account...";

  try {
    // Client-side validation
    if (password !== confirmPassword) {
      throw new Error("Passwords do not match");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    const response = await fetch(`${API_BASE_URL}/api/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Signup failed. Please try again.");
    }

    showLogin();
    showError("Signup successful! Please log in.");
  } catch (error) {
    showError(error.message);
    console.error("Signup error:", error);
  } finally {
    signupBtn.disabled = false;
    signupBtn.textContent = "Sign Up";
  }
}

// Initialize the application
function init() {
  // Check for existing auth token
  const token = localStorage.getItem("authToken");
  if (token) {
    validateToken(token);
  } else {
    showLogin();
  }
}

async function validateToken(token) {
  showLoading("Checking session...");
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/validate`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Session expired");
    }

    currentUser = data.user;
    socket.auth = { token };
    socket.connect();
    showDashboard();
  } catch (error) {
    localStorage.removeItem("authToken");
    showLogin();
    showError("Please log in again");
    console.error("Token validation error:", error);
  }
}

// Start the application
init();
