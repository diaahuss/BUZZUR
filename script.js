document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const app = document.getElementById('app');
  const API_BASE_URL = "https://buzzur-server.onrender.com";
  let socket = io(API_BASE_URL);
  let currentUser = null;

  // Initialize the application
  function init() {
    showLoading("Initializing...");
    const token = localStorage.getItem('authToken');
    if (token) {
      validateSession(token);
    } else {
      showLogin();
    }
  }

  // Improved fetch helper with error handling
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
      throw error; // Re-throw for specific handling
    }
  }

  // Authentication Handlers with proper error messages
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
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          password: password,
        }),
      });

      localStorage.setItem('authToken', data.token);
      currentUser = data.user;
      socket.auth = { token: data.token };
      socket.connect();
      showDashboard();
    } catch (error) {
      // Specific error messages for common cases
      if (error.message.includes('401')) {
        showError('Wrong phone number or password');
      } else if (error.message.includes('network')) {
        showError('Network error - please check your connection');
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

    // Client-side validation
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

      const data = await fetchData(`${API_BASE_URL}/api/signup`, {
        method: 'POST',
        body: JSON.stringify({ name, phone, password }),
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

  // Rest of your functions (showLogin, showSignup, showDashboard, etc.)
  // ... [keep all the other functions from previous version]

  // Make sure to expose all needed functions to global scope
  window.handleLogin = handleLogin;
  window.handleSignup = handleSignup;
  window.logout = logout;
  // ... [other function exposures]

  // Initialize the app
  init();
});
