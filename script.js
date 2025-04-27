document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  const API_BASE_URL = "https://buzzur-server.onrender.com";
  const socket = io(API_BASE_URL, { autoConnect: false }); // Don't connect immediately
  let currentUser = null;

  function init() {
    showLoading("Loading...");
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
      if (!response.ok) throw new Error(data.message || `HTTP error! status: ${response.status}`);
      return data;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }

  async function handleLogin() {
    const phone = document.getElementById('loginPhone')?.value.trim();
    const password = document.getElementById('loginPassword')?.value;
    const loginBtn = document.getElementById('loginBtn');

    if (!phone || !password) {
      showError('Please enter phone number and password');
      return;
    }

    try {
      loginBtn.disabled = true;
      loginBtn.textContent = 'Logging in...';

      const data = await fetchData(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        body: JSON.stringify({ phoneNumber: phone, password })
      });

      localStorage.setItem('authToken', data.token);
      currentUser = data.user;
      socket.auth = { token: data.token };
      socket.connect();

      showDashboard();
    } catch (error) {
      if (error.message.includes('401')) {
        showError('Incorrect phone number or password.');
      } else if (error.message.includes('Network')) {
        showError('Network error. Please try again.');
      } else {
        showError(error.message || 'Login failed.');
      }
    } finally {
      if (loginBtn) {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
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
      signupBtn.textContent = 'Signing up...';

      await fetchData(`${API_BASE_URL}/api/signup`, {
        method: 'POST',
        body: JSON.stringify({ name, phone, password })
      });

      showLogin();
      showError('Signup successful! Please log in.', 'success');
    } catch (error) {
      if (error.message.includes('409')) {
        showError('Phone number already registered.');
      } else {
        showError(error.message || 'Signup failed.');
      }
    } finally {
      if (signupBtn) {
        signupBtn.disabled = false;
        signupBtn.textContent = 'Sign Up';
      }
    }
  }

  // Example placeholder UI functions
  function showLoading(message = "Loading...") {
    app.innerHTML = `<div class="loading">${message}</div>`;
  }

  function showError(message, type = "error") {
    const errorBox = document.createElement('div');
    errorBox.className = type === 'success' ? 'success' : 'error';
    errorBox.textContent = message;
    app.prepend(errorBox);
    setTimeout(() => errorBox.remove(), 3000);
  }

  function validateSession(token) {
    // Basic session validation (you can make it more complex)
    socket.auth = { token };
    socket.connect();
    showDashboard();
  }

  function showLogin() {
    app.innerHTML = `
      <h2>Login</h2>
      <input id="loginPhone" placeholder="Phone Number" type="text" />
      <input id="loginPassword" placeholder="Password" type="password" />
      <button id="loginBtn" onclick="handleLogin()">Login</button>
      <p>Don't have an account? <a href="#" onclick="showSignup()">Sign up</a></p>
    `;
  }

  function showSignup() {
    app.innerHTML = `
      <h2>Sign Up</h2>
      <input id="signupName" placeholder="Name" type="text" />
      <input id="signupPhone" placeholder="Phone Number" type="text" />
      <input id="signupPassword" placeholder="Password" type="password" />
      <input id="signupConfirm" placeholder="Confirm Password" type="password" />
      <button id="signupBtn" onclick="handleSignup()">Sign Up</button>
      <p>Already have an account? <a href="#" onclick="showLogin()">Login</a></p>
    `;
  }

  function showDashboard() {
    app.innerHTML = `
      <h2>Welcome ${currentUser?.name || 'User'}</h2>
      <button onclick="logout()">Logout</button>
      <!-- Add group management, buzz buttons, etc. here -->
    `;
  }

  function logout() {
    localStorage.removeItem('authToken');
    socket.disconnect();
    showLogin();
  }

  window.handleLogin = handleLogin;
  window.handleSignup = handleSignup;
  window.showLogin = showLogin;
  window.showSignup = showSignup;
  window.logout = logout;

  init();
});
