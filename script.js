document.addEventListener('DOMContentLoaded', function () {
  const app = document.getElementById('app');
  const API_BASE_URL = "https://buzzur-server.onrender.com"; // your Render backend
  let socket = io(API_BASE_URL, { autoConnect: false });
  let currentUser = null;

  function init() {
    const token = localStorage.getItem('authToken');
    if (token) {
      validateSession(token);
    } else {
      showLogin();
    }
  }

  async function fetchData(url, options = {}) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      return data;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }

  async function validateSession(token) {
    try {
      const data = await fetchData(`${API_BASE_URL}/api/validate`, {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
      currentUser = data.user;
      socket.auth = { token };
      socket.connect();
      showDashboard();
    } catch (error) {
      localStorage.removeItem('authToken');
      showLogin();
    }
  }

  async function handleLogin() {
    const phoneNumber = document.getElementById('loginPhone')?.value.trim();
    const password = document.getElementById('loginPassword')?.value;

    if (!phoneNumber || !password) {
      showError('Please enter both phone and password');
      return;
    }

    try {
      const loginBtn = document.getElementById('loginBtn');
      loginBtn.disabled = true;
      loginBtn.textContent = "Logging in...";

      const data = await fetchData(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        body: JSON.stringify({ phoneNumber, password }),
      });

      localStorage.setItem('authToken', data.token);
      currentUser = data.user;
      socket.auth = { token: data.token };
      socket.connect();
      showDashboard();
    } catch (error) {
      showError(error.message || 'Login failed');
    } finally {
      const loginBtn = document.getElementById('loginBtn');
      if (loginBtn) {
        loginBtn.disabled = false;
        loginBtn.textContent = "Login";
      }
    }
  }

  async function handleSignup() {
    const name = document.getElementById('signupName')?.value.trim();
    const phone = document.getElementById('signupPhone')?.value.trim();
    const password = document.getElementById('signupPassword')?.value;
    const confirmPassword = document.getElementById('signupConfirmPassword')?.value;

    if (!name || !phone || !password || !confirmPassword) {
      showError('Please fill all fields');
      return;
    }

    if (password !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }

    try {
      const signupBtn = document.getElementById('signupBtn');
      signupBtn.disabled = true;
      signupBtn.textContent = "Creating...";

      const data = await fetchData(`${API_BASE_URL}/api/signup`, {
        method: 'POST',
        body: JSON.stringify({ name, phone, password }),
      });

      showLogin();
      showError('Signup successful! Please login.');
    } catch (error) {
      showError(error.message || 'Signup failed');
    } finally {
      const signupBtn = document.getElementById('signupBtn');
      if (signupBtn) {
        signupBtn.disabled = false;
        signupBtn.textContent = "Sign Up";
      }
    }
  }

  function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.textContent = message;
    errorDiv.style.color = 'red';
    errorDiv.style.textAlign = 'center';
    app.prepend(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
  }

  function showLoading(message = "Loading...") {
    app.innerHTML = `<div class="banner">BUZZUR</div><p>${message}</p>`;
  }

  function showLogin() {
    app.innerHTML = `
      <div class="banner">BUZZUR</div>
      <h2>Login</h2>
      <input type="text" id="loginPhone" placeholder="Phone Number"><br>
      <input type="password" id="loginPassword" placeholder="Password"><br>
      <label><input type="checkbox" id="showLoginPassword"> Show Password</label><br>
      <button id="loginBtn">Login</button>
      <p>Don't have an account? <a href="#" id="toSignup">Sign Up</a></p>
    `;

    document.getElementById('loginBtn').onclick = handleLogin;
    document.getElementById('toSignup').onclick = showSignup;
    document.getElementById('showLoginPassword').onchange = function() {
      document.getElementById('loginPassword').type = this.checked ? 'text' : 'password';
    };
  }

  function showSignup() {
    app.innerHTML = `
      <div class="banner">BUZZUR</div>
      <h2>Sign Up</h2>
      <input type="text" id="signupName" placeholder="Name"><br>
      <input type="text" id="signupPhone" placeholder="Phone Number"><br>
      <input type="password" id="signupPassword" placeholder="Password"><br>
      <input type="password" id="signupConfirmPassword" placeholder="Confirm Password"><br>
      <label><input type="checkbox" id="showSignupPassword"> Show Password</label><br>
      <button id="signupBtn">Sign Up</button>
      <p>Already have an account? <a href="#" id="toLogin">Login</a></p>
    `;

    document.getElementById('signupBtn').onclick = handleSignup;
    document.getElementById('toLogin').onclick = showLogin;
    document.getElementById('showSignupPassword').onchange = function() {
      document.getElementById('signupPassword').type = 
      document.getElementById('signupConfirmPassword').type = this.checked ? 'text' : 'password';
    };
  }

  function showDashboard() {
    app.innerHTML = `
      <div class="banner">BUZZUR</div>
      <h2>Welcome, ${currentUser?.name || "User"}</h2>
      <button onclick="logout()">Logout</button>
    `;
  }

  function logout() {
    socket.disconnect();
    localStorage.removeItem('authToken');
    showLogin();
  }

  window.logout = logout;
  init();
});
