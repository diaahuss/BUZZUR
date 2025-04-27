document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const app = document.getElementById('app');
  const API_BASE_URL = "https://buzzur-server.onrender.com";
  let socket = io(API_BASE_URL);
  let currentUser = null;

  // Initialize the application
  function init() {
    // Check for existing session
    const token = localStorage.getItem('authToken');
    if (token) {
      validateSession(token);
    } else {
      showLogin();
    }
  }

  // Show loading state
  function showLoading(message = "Loading...") {
    app.innerHTML = `
      <div class="banner">BUZZUR</div>
      <div class="container">
        <p class="loading">${message}</p>
      </div>
    `;
  }

  // Show error message
  function showError(message, container = app) {
    const errorEl = document.createElement('div');
    errorEl.className = 'error';
    errorEl.textContent = message;
    container.prepend(errorEl);
    setTimeout(() => errorEl.remove(), 5000);
  }

  // Authentication Views
  function showLogin() {
    app.innerHTML = `
      <div class="banner">BUZZUR</div>
      <div class="container">
        <h2>Login</h2>
        <input type="text" id="loginPhone" placeholder="Phone Number" required>
        <input type="password" id="loginPassword" placeholder="Password" required>
        <label><input type="checkbox" id="showLoginPassword"> Show Password</label>
        <button onclick="handleLogin()" id="loginBtn">Login</button>
        <p><a href="#" onclick="showReset()">Forgot Password?</a> | 
           <a href="#" onclick="showSignup()">Sign Up</a></p>
      </div>
    `;

    document.getElementById('showLoginPassword').addEventListener('change', function() {
      const pwd = document.getElementById('loginPassword');
      pwd.type = this.checked ? "text" : "password";
    });
  }

  function showSignup() {
    app.innerHTML = `
      <div class="banner">BUZZUR</div>
      <div class="container">
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

    document.getElementById('showSignupPassword').addEventListener('change', function() {
      const pwd = document.getElementById('signupPassword');
      const confirm = document.getElementById('signupConfirm');
      pwd.type = confirm.type = this.checked ? "text" : "password";
    });
  }

  function showReset() {
    app.innerHTML = `
      <div class="banner">BUZZUR</div>
      <div class="container">
        <h2>Reset Password</h2>
        <input type="text" id="resetPhone" placeholder="Phone Number" required>
        <input type="password" id="resetPassword" placeholder="New Password" required minlength="6">
        <label><input type="checkbox" id="showResetPassword"> Show Password</label>
        <button onclick="handleReset()" id="resetBtn">Reset Password</button>
        <p><a href="#" onclick="showLogin()">Back to Login</a></p>
      </div>
    `;

    document.getElementById('showResetPassword').addEventListener('change', function() {
      const pwd = document.getElementById('resetPassword');
      pwd.type = this.checked ? "text" : "password";
    });
  }

  // Authentication Handlers
  async function handleLogin() {
    const phoneNumber = document.getElementById('loginPhone').value.trim();
    const password = document.getElementById('loginPassword').value;
    const loginBtn = document.getElementById('loginBtn');

    if (!phoneNumber || !password) {
      showError('Please fill in all fields');
      return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('authToken', data.token);
      currentUser = data.user;
      socket.auth = { token: data.token };
      socket.connect();
      showDashboard();
    } catch (error) {
      showError(error.message);
      console.error('Login error:', error);
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = "Login";
    }
  }

  async function handleSignup() {
    const name = document.getElementById('signupName').value.trim();
    const phone = document.getElementById('signupPhone').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirm').value;
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

    signupBtn.disabled = true;
    signupBtn.textContent = "Creating account...";

    try {
      const response = await fetch(`${API_BASE_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      showLogin();
      showError('Signup successful! Please log in.');
    } catch (error) {
      showError(error.message);
      console.error('Signup error:', error);
    } finally {
      signupBtn.disabled = false;
      signupBtn.textContent = "Sign Up";
    }
  }

  async function handleReset() {
    const phone = document.getElementById('resetPhone').value.trim();
    const password = document.getElementById('resetPassword').value;
    const resetBtn = document.getElementById('resetBtn');

    if (!phone || !password) {
      showError('Please fill in all fields');
      return;
    }

    resetBtn.disabled = true;
    resetBtn.textContent = "Resetting...";

    try {
      const response = await fetch(`${API_BASE_URL}/api/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password reset failed');
      }

      showLogin();
      showError('Password reset successful! Please log in.');
    } catch (error) {
      showError(error.message);
      console.error('Reset error:', error);
    } finally {
      resetBtn.disabled = false;
      resetBtn.textContent = "Reset Password";
    }
  }

  async function validateSession(token) {
    showLoading('Checking session...');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/validate`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Session expired');
      }

      currentUser = data.user;
      socket.auth = { token };
      socket.connect();
      showDashboard();
    } catch (error) {
      localStorage.removeItem('authToken');
      showLogin();
      showError('Please log in again');
      console.error('Session validation error:', error);
    }
  }

  // Dashboard Functions
  async function showDashboard() {
    showLoading('Loading dashboard...');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/groups?user=${currentUser.phone}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });
      
      const groups = await response.json();

      if (!response.ok) {
        throw new Error(groups.message || 'Failed to load groups');
      }

      app.innerHTML = `
        <div class="banner">My Groups</div>
        <div class="container">
          <button onclick="createGroup()">+ Create Group</button>
          <div id="groups">${groups.map(renderGroup).join('')}</div>
          <button onclick="logout()" class="logout-btn">Logout</button>
        </div>
      `;
    } catch (error) {
      showError(error.message);
      console.error('Dashboard error:', error);
    }
  }

  function renderGroup(group) {
    return `
      <div class="group" data-id="${group.id}">
        <input value="${group.name}" onchange="renameGroup('${group.id}', this.value)">
        <button onclick="deleteGroup('${group.id}')">🗑</button>
        <div class="members">
          ${group.members.map((m, i) => `
            <div>
              <input value="${m.name}" onchange="updateMember('${group.id}', ${i}, 'name', this.value)">
              <input value="${m.phone}" onchange="updateMember('${group.id}', ${i}, 'phone', this.value)">
              <button onclick="removeMember('${group.id}', ${i})">🗑</button>
            </div>
          `).join('')}
        </div>
        <button onclick="addMember('${group.id}')">+ Add Member</button>
        <button onclick="buzzSelected('${group.id}')">Buzz Selected</button>
        <button onclick="buzzAll('${group.id}')">Buzz All</button>
      </div>
    `;
  }

  // Group Management Functions
  function createGroup() {
    // Implementation for creating a new group
    alert('Create group functionality would go here');
  }

  function renameGroup(groupId, newName) {
    // Implementation for renaming a group
    console.log(`Renaming group ${groupId} to ${newName}`);
  }

  function deleteGroup(groupId) {
    // Implementation for deleting a group
    console.log(`Deleting group ${groupId}`);
  }

  function addMember(groupId) {
    // Implementation for adding a member
    console.log(`Adding member to group ${groupId}`);
  }

  function updateMember(groupId, memberIndex, field, value) {
    // Implementation for updating a member
    console.log(`Updating member ${memberIndex} in group ${groupId}: ${field} = ${value}`);
  }

  function removeMember(groupId, memberIndex) {
    // Implementation for removing a member
    console.log(`Removing member ${memberIndex} from group ${groupId}`);
  }

  // Buzz Functions
  function buzzSelected(groupId) {
    // For now buzz all members
    buzzAll(groupId);
  }

  function buzzAll(groupId) {
    socket.emit('buzz', { groupId });
    const audio = new Audio('buzz.mp3');
    audio.play().catch(e => console.error('Audio playback failed:', e));
  }

  // Logout Function
  function logout() {
    currentUser = null;
    localStorage.removeItem('authToken');
    socket.disconnect();
    showLogin();
  }

  // Socket Events
  socket.on('connect', () => {
    console.log('Connected to socket server');
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from socket server');
  });

  socket.on('buzz', () => {
    const audio = new Audio('buzz.mp3');
    audio.play().catch(e => console.error('Audio playback failed:', e));
  });

  // Make functions available globally
  window.handleLogin = handleLogin;
  window.handleSignup = handleSignup;
  window.handleReset = handleReset;
  window.showLogin = showLogin;
  window.showSignup = showSignup;
  window.showReset = showReset;
  window.createGroup = createGroup;
  window.renameGroup = renameGroup;
  window.deleteGroup = deleteGroup;
  window.addMember = addMember;
  window.updateMember = updateMember;
  window.removeMember = removeMember;
  window.buzzSelected = buzzSelected;
  window.buzzAll = buzzAll;
  window.logout = logout;

  // Initialize the app
  init();
});
