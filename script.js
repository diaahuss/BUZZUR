document.addEventListener('DOMContentLoaded', function () {
  const app = document.getElementById('app');
  const API_BASE_URL = "https://buzzur-server.onrender.com";
  let socket = null;
  let currentUser = null;

  function init() {
    showLoading("Initializing...");
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
          ...(options.headers || {})
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

  async function handleLogin() {
    const phoneNumber = document.getElementById('loginPhone')?.value.trim();
    const password = document.getElementById('loginPassword')?.value;
    const loginBtn = document.getElementById('loginBtn');

    if (!phoneNumber || !password) {
      showError('Please enter both phone number and password');
      return;
    }

    try {
      loginBtn.disabled = true;
      loginBtn.textContent = "Logging in...";

      const data = await fetchData(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        body: JSON.stringify({ phoneNumber, password }),
      });

      localStorage.setItem('authToken', data.token);
      currentUser = data.user;

      // Connect socket AFTER setting auth
      socket = io(API_BASE_URL, {
        auth: { token: data.token }
      });

      showDashboard();
    } catch (error) {
      if (error.message.includes('401')) {
        showError('Wrong phone number or password');
      } else {
        showError(error.message || 'Login failed. Please try again.');
      }
    } finally {
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
    const confirmPassword = document.getElementById('signupConfirm')?.value;
    const signupBtn = document.getElementById('signupBtn');

    if (!name || !phone || !password || !confirmPassword) {
      showError('Please fill in all fields');
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
      signupBtn.disabled = true;
      signupBtn.textContent = "Creating account...";

      // FIX: use phoneNumber key
      const data = await fetchData(`${API_BASE_URL}/api/signup`, {
        method: 'POST',
        body: JSON.stringify({ name, phoneNumber: phone, password }),
      });

      showLogin();
      showError('Signup successful! Please log in.');
    } catch (error) {
      if (error.message.includes('409')) {
        showError('Phone number already exists');
      } else {
        showError(error.message || 'Signup failed. Please try again.');
      }
    } finally {
      if (signupBtn) {
        signupBtn.disabled = false;
        signupBtn.textContent = "Sign Up";
      }
    }
  }

  // Example for showError, showLoading, showLogin
  function showError(message) {
    alert(message); // Replace this later with nicer UI
  }

  function showLoading(message) {
    app.innerHTML = `<p>${message}</p>`;
  }

  function showLogin() {
    app.innerHTML = `
      <h2>Login</h2>
      <input id="loginPhone" placeholder="Phone Number" />
      <input id="loginPassword" type="password" placeholder="Password" />
      <button id="loginBtn">Login</button>
      <p><a href="#" id="showSignupLink">Sign Up</a></p>
    `;
    document.getElementById('loginBtn').onclick = handleLogin;
    document.getElementById('showSignupLink').onclick = showSignup;
  }

  function showSignup() {
    app.innerHTML = `
      <h2>Sign Up</h2>
      <input id="signupName" placeholder="Name" />
      <input id="signupPhone" placeholder="Phone Number" />
      <input id="signupPassword" type="password" placeholder="Password" />
      <input id="signupConfirm" type="password" placeholder="Confirm Password" />
      <button id="signupBtn">Sign Up</button>
      <p><a href="#" id="showLoginLink">Back to Login</a></p>
    `;
    document.getElementById('signupBtn').onclick = handleSignup;
    document.getElementById('showLoginLink').onclick = showLogin;
  }

  function showDashboard() {
    app.innerHTML = `<h2>Welcome, ${currentUser?.name || 'User'}</h2>
      <button onclick="logout()">Logout</button>`;
  }

  function logout() {
    localStorage.removeItem('authToken');
    if (socket) {
      socket.disconnect();
    }
    showLogin();
  }

  window.handleLogin = handleLogin;
  window.handleSignup = handleSignup;
  window.logout = logout;

  init();
});
