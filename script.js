// App State
const AppState = {
  currentUser: null,
  userGroups: [],
  socket: null,

  // Initialize the application
  init() {
    this.setupSocket();
    this.checkAuth();
    this.setupEventDelegates();
  },

  // Set up Socket.io connection
  setupSocket() {
    this.socket = io('http://localhost:3000', {
      withCredentials: true,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('buzz', this.handleBuzz);
    this.socket.on('buzzGroup', this.handleGroupBuzz);
  },

  // Check authentication status
  async checkAuth() {
    try {
      const response = await fetch('/auth/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      const data = await response.json();
      
      if (data.authenticated) {
        this.currentUser = data.user;
        this.userGroups = data.groups || [];
        Views.renderDashboard();
      } else {
        Views.renderLogin();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      Views.renderLogin();
    }
  },

  // Handle incoming buzz events
  handleBuzz() {
    Views.playBuzzSound();
  },

  handleGroupBuzz(data) {
    if (AppState.userGroups.some(g => g.id === data.groupId)) {
      Views.playBuzzSound();
    }
  },

  // Event delegation setup
  setupEventDelegates() {
    document.addEventListener('click', (e) => {
      if (e.target.id === 'loginBtn') Views.handleLogin();
      if (e.target.id === 'signupBtn') Views.handleSignup();
      if (e.target.id === 'logoutBtn') Views.handleLogout();
      if (e.target.id === 'addGroupBtn') Views.handleCreateGroup();
      if (e.target.id === 'buzzAllBtn') AppState.socket.emit('buzzAll');
      
      if (e.target.classList.contains('buzz-group-btn')) {
        const groupId = e.target.dataset.groupId;
        AppState.socket.emit('buzzGroup', { groupId });
      }
    });
  }
};

// View Management
const Views = {
  // Render the login view
  renderLogin() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="auth-view">
        <h2>BUZZUR Login</h2>
        <input type="tel" id="loginPhone" placeholder="Phone Number" required>
        <input type="password" id="loginPassword" placeholder="Password" required>
        <label>
          <input type="checkbox" id="showPwd"> Show Password
        </label>
        <button id="loginBtn">Login</button>
        <div class="auth-links">
          <a href="#" id="toSignup">Create Account</a>
        </div>
      </div>
    `;
    
    document.getElementById('showPwd').addEventListener('change', (e) => {
      const pwdInput = document.getElementById('loginPassword');
      pwdInput.type = e.target.checked ? 'text' : 'password';
    });
  },

  // Render the dashboard view
  renderDashboard() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <header>
        <h1>Welcome, ${AppState.currentUser.name}</h1>
        <button id="logoutBtn">Logout</button>
      </header>
      <main>
        <section class="groups-section">
          <h2>Your Groups</h2>
          <div id="groupsList"></div>
          <div class="group-create">
            <input type="text" id="newGroupName" placeholder="New group name">
            <button id="addGroupBtn">Create Group</button>
          </div>
        </section>
        <button id="buzzAllBtn" class="buzz-btn">Buzz All</button>
      </main>
    `;
    
    this.renderGroups();
  },

  // Render the groups list
  renderGroups() {
    const container = document.getElementById('groupsList');
    if (!container) return;
    
    if (AppState.userGroups.length === 0) {
      container.innerHTML = '<p>No groups yet. Create your first group!</p>';
      return;
    }
    
    container.innerHTML = AppState.userGroups.map(group => `
      <div class="group-card">
        <h3>${group.name}</h3>
        <button class="buzz-group-btn" data-group-id="${group.id}">
          Buzz Group
        </button>
      </div>
    `).join('');
  },

  // Play buzz sound
  playBuzzSound() {
    const sound = document.getElementById('buzzSound');
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(e => {
        console.error('Failed to play sound:', e);
        alert('BUZZ!');
      });
    } else {
      alert('BUZZ!');
    }
  },

  // Event handlers
  async handleLogin() {
    const phone = document.getElementById('loginPhone').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Login failed');
      
      localStorage.setItem('authToken', data.token);
      AppState.currentUser = data.user;
      AppState.userGroups = data.groups || [];
      this.renderDashboard();
      
    } catch (error) {
      console.error('Login error:', error);
      alert(error.message || 'Login failed');
    }
  },

  async handleLogout() {
    try {
      await fetch('/auth/logout');
      localStorage.removeItem('authToken');
      AppState.currentUser = null;
      AppState.userGroups = [];
      this.renderLogin();
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  async handleCreateGroup() {
    const name = document.getElementById('newGroupName').value.trim();
    if (!name) return;
    
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ name })
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Failed to create group');
      
      AppState.userGroups.push(data.group);
      this.renderGroups();
      document.getElementById('newGroupName').value = '';
      
    } catch (error) {
      console.error('Create group error:', error);
      alert(error.message || 'Failed to create group');
    }
  }
};

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  AppState.init();
});
