document.addEventListener('DOMContentLoaded', function () {
  const app = document.getElementById('app');
  const API_BASE_URL = window.location.origin.includes('localhost')
    ? 'http://localhost:3000'
    : 'https://buzzur-server.onrender.com';

  let socket;
  let currentUser = null;

  // Initialize WebSocket
  function initSocket(token) {
    socket = io(API_BASE_URL, {
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socket.on('connect', () => console.log('Connected to WebSocket'));
    socket.on('buzz', playBuzzSound);
    socket.on('disconnect', () => console.log('Disconnected from WebSocket'));
  }

  function playBuzzSound() {
    const audio = new Audio('buzz.mp3');
    audio.play().catch(err => console.error('Audio play error:', err));
  }

  // Views
  function showLogin() {
    app.innerHTML = `
      <div class="banner">BUZZUR</div>
      <div class="container">
        <h2>Login</h2>
        <input type="text" id="loginPhone" placeholder="Phone Number" required>
        <input type="password" id="loginPassword" placeholder="Password" required>
        <label><input type="checkbox" id="showLoginPassword"> Show Password</label>
        <button id="loginBtn">Login</button>
        <p><a href="#" id="showSignupLink">Sign up</a></p>
      </div>
    `;

    document.getElementById('loginBtn').addEventListener('click', handleLogin);
    document.getElementById('showSignupLink').addEventListener('click', showSignup);
    document.getElementById('showLoginPassword').addEventListener('change', togglePasswordVisibility.bind(null, 'loginPassword', 'showLoginPassword'));
  }

  function showSignup() {
    app.innerHTML = `
      <div class="banner">BUZZUR</div>
      <div class="container">
        <h2>Sign Up</h2>
        <input type="text" id="signupName" placeholder="Name" required>
        <input type="text" id="signupPhone" placeholder="Phone Number" required>
        <input type="password" id="signupPassword" placeholder="Password" required minlength="6">
        <input type="password" id="confirmPassword" placeholder="Confirm Password" required minlength="6">
        <label><input type="checkbox" id="showSignupPassword"> Show Passwords</label>
        <button id="signupBtn">Sign Up</button>
        <p><a href="#" id="showLoginLink">Log in</a></p>
      </div>
    `;

    document.getElementById('signupBtn').addEventListener('click', handleSignup);
    document.getElementById('showLoginLink').addEventListener('click', showLogin);
    document.getElementById('showSignupPassword').addEventListener('change', () => {
      togglePasswordVisibility('signupPassword', 'showSignupPassword');
      togglePasswordVisibility('confirmPassword', 'showSignupPassword');
    });
  }

  function showDashboard() {
    app.innerHTML = `
      <div class="banner">Welcome, ${currentUser.name}</div>
      <div class="container">
        <button id="buzzBtn">Send Buzz</button>
        <button id="logoutBtn">Logout</button>
      </div>
    `;

    document.getElementById('buzzBtn').addEventListener('click', () => {
      socket.emit('buzz', { groupId: 'test-group' });
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
      localStorage.removeItem('authToken');
      if (socket) socket.disconnect();
      currentUser = null;
      showLogin();
    });
  }

  function togglePasswordVisibility(passwordId, checkboxId) {
    const passwordField = document.getElementById(passwordId);
    const checkbox = document.getElementById(checkboxId);
    if (passwordField && checkbox) {
      passwordField.type = checkbox.checked ? 'text' : 'password';
    }
  }

  // API Helpers
  async function fetchAPI(endpoint, options = {}) {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'API request failed');
      }
      return await res.json();
    } catch (err) {
      console.error('API Error:', err);
      throw err;
    }
  }

  // Handlers
  async function handleLogin() {
    const phone = document.getElementById('loginPhone').value.trim();
    const password = document.getElementById('loginPassword').value;
    const btn = document.getElementById('loginBtn');

    if (!phone || !password) {
      alert('Please fill in all fields');
      return;
    }

    try {
      btn.disabled = true;
      btn.textContent = 'Logging in...';

      const { token, user } = await fetchAPI('/api/login', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber: phone, password })
      });

      currentUser = user;
      localStorage.setItem('authToken', token);
      initSocket(token);
      showDashboard();

    } catch (err) {
      alert(err.message || 'Login failed');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Login';
    }
  }

  async function handleSignup() {
    const name = document.getElementById('signupName').value.trim();
    const phone = document.getElementById('signupPhone').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const btn = document.getElementById('signupBtn');

    if (!name || !phone || !password || !confirmPassword) {
      alert('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      btn.disabled = true;
      btn.textContent = 'Signing up...';

      await fetchAPI('/api/signup', {
        method: 'POST',
        body: JSON.stringify({ name, phone, password })
      });

      alert('Account created! Please log in.');
      showLogin();

    } catch (err) {
      alert(err.message || 'Signup failed');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Sign Up';
    }
  }

  // Initialize
  const token = localStorage.getItem('authToken');
  if (token) {
    fetchAPI('/api/health')
      .then(() => {
        initSocket(token);
        showDashboard();
      })
      .catch(() => {
        localStorage.removeItem('authToken');
        showLogin();
      });
  } else {
    showLogin();
  }
});
