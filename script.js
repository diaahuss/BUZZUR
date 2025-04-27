const app = document.getElementById("app");
const socket = io("https://buzzur-server.onrender.com");
let currentUser = null;

// Utility functions
function showLoading(message = "Loading...") {
  app.innerHTML = `<div class="container"><p>${message}</p></div>`;
}

function showError(message) {
  const errorEl = document.createElement("div");
  errorEl.className = "error";
  errorEl.textContent = message;
  app.prepend(errorEl);
  setTimeout(() => errorEl.remove(), 5000);
}

// Authentication Functions
async function handleLogin() {
  const phoneNumber = document.getElementById("loginPhone").value.trim();
  const password = document.getElementById("loginPassword").value;

  // Basic validation
  if (!phoneNumber || !password) {
    showError("Please fill in all fields");
    return;
  }

  showLoading("Logging in...");

  try {
    const res = await fetch("https://buzzur-server.onrender.com/api/login", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, password }),
    });

    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }

    // Store user data and token
    currentUser = data.user;
    localStorage.setItem("authToken", data.token);
    
    showDashboard();
  } catch (error) {
    showError(error.message);
    console.error("Login error:", error);
  }
}

async function handleSignup() {
  const name = document.getElementById("signupName").value.trim();
  const phone = document.getElementById("signupPhone").value.trim();
  const password = document.getElementById("signupPassword").value;
  const confirm = document.getElementById("signupConfirm").value;

  // Validation
  if (!name || !phone || !password || !confirm) {
    showError("Please fill in all fields");
    return;
  }

  if (password !== confirm) {
    showError("Passwords do not match");
    return;
  }

  if (password.length < 6) {
    showError("Password must be at least 6 characters");
    return;
  }

  showLoading("Creating account...");

  try {
    const res = await fetch("https://buzzur-server.onrender.com/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, password }),
    });

    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || "Signup failed");
    }

    showLogin();
    showError("Signup successful! Please log in.");
  } catch (error) {
    showError(error.message);
    console.error("Signup error:", error);
  }
}

async function handleReset() {
  const phone = document.getElementById("resetPhone").value.trim();
  const password = document.getElementById("resetPassword").value;

  if (!phone || !password) {
    showError("Please fill in all fields");
    return;
  }

  showLoading("Resetting password...");

  try {
    const res = await fetch("https://buzzur-server.onrender.com/api/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),
    });

    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || "Password reset failed");
    }

    showLogin();
    showError("Password reset successful! Please log in.");
  } catch (error) {
    showError(error.message);
    console.error("Reset error:", error);
  }
}

// Initialize app
function init() {
  // Check for existing session
  const token = localStorage.getItem("authToken");
  if (token) {
    validateSession(token);
  } else {
    showLogin();
  }
}

async function validateSession(token) {
  showLoading("Restoring session...");
  
  try {
    const res = await fetch("https://buzzur-server.onrender.com/api/validate", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || "Session expired");
    }
    
    currentUser = data.user;
    showDashboard();
  } catch (error) {
    localStorage.removeItem("authToken");
    showLogin();
    showError("Please log in again");
    console.error("Session validation error:", error);
  }
}

function logout() {
  currentUser = null;
  localStorage.removeItem("authToken");
  socket.disconnect();
  showLogin();
}

// Initialize the app
init();
