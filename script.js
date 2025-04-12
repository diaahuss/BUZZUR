// App State Management
const AppState = {
  currentUser: null,
  userGroups: [],
  socket: io(),
  
  init() {
    this.bindSocketEvents();
    this.checkAuthStatus();
  },
  
  bindSocketEvents() {
    this.socket.on('buzz', this.handleBuzz);
    this.socket.on('groupUpdate', this.updateGroups);
  },
  
  async checkAuthStatus() {
    try {
      const res = await fetch('/auth/status');
      const data = await res.json();
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
  
  handleBuzz() {
    const sound = document.getElementById('buzzSound');
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(e => console.log('Audio play failed:', e));
    }
  },
  
  updateGroups(updatedGroups) {
    this.userGroups = updatedGroups;
    Views.renderGroups();
  }
};

// View Management
const Views = {
  renderLogin() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="auth-form">
        <h2>Login to BUZZUR</h2>
        <input type="tel" id="loginPhone" placeholder="Phone Number">
        <input type="password" id="loginPassword" placeholder="Password">
        <label>
          <input type="checkbox" id="showLoginPwd"> Show Password
        </label>
        <button id="loginBtn">Login</button>
        <div class="auth-links">
          <a href="#" id="toSignup">Sign Up</a> | 
          <a href="#" id="toForgot">Forgot Password?</a>
        </div>
      </div>
    `;
    
    document.getElementById('showLoginPwd').addEventListener('change', (e) => {
      const pwdInput = document.getElementById('loginPassword');
      pwdInput.type = e.target.checked ? 'text' : 'password';
    });
    
    document.getElementById('loginBtn').addEventListener('click', this.handleLogin);
    document.getElementById('toSignup').addEventListener('click', () => this.renderSignup());
  },
  
  renderSignup() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="auth-form">
        <h2>Create BUZZUR Account</h2>
        <input type="text" id="signupName" placeholder="Full Name">
        <input type="tel" id="signupPhone" placeholder="Phone Number">
        <input type="password" id="signupPassword" placeholder="Password">
        <input type="password" id="signupConfirm" placeholder="Confirm Password">
        <label>
          <input type="checkbox" id="showSignupPwd"> Show Password
        </label>
        <button id="signupBtn">Sign Up</button>
        <div class="auth-links">
          <a href="#" id="toLogin">Back to Login</a>
        </div>
      </div>
    `;
    
    document.getElementById('showSignupPwd').addEventListener('change', (e) => {
      const pwdInput = document.getElementById('signupPassword');
      const confirmInput = document.getElementById('signupConfirm');
      pwdInput.type = confirmInput.type = e.target.checked ? 'text' : 'password';
    });
    
    document.getElementById('signupBtn').addEventListener('click', this.handleSignup);
    document.getElementById('toLogin').addEventListener('click', () => this.renderLogin());
  },
  
  renderDashboard() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <header>
        <h1>Welcome, ${AppState.currentUser.name}</h1>
        <button id="logoutBtn">Logout</button>
      </header>
      <main>
        <section class="groups-section">
          <h2>My Groups</h2>
          <div id="groupsContainer" class="group-list"></div>
          <div class="group-actions">
            <input type="text" id="newGroupName" placeholder="New Group Name">
            <button id="addGroupBtn">Create Group</button>
          </div>
        </section>
        <button id="buzzAllBtn" class="buzz-btn">Buzz All Groups</button>
      </main>
    `;
    
    this.renderGroups();
    
    document.getElementById('addGroupBtn').addEventListener('click', this.handleCreateGroup);
    document.getElementById('buzzAllBtn').addEventListener('click', this.handleBuzzAll);
    document.getElementById('logoutBtn').addEventListener('click', this.handleLogout);
  },
  
  renderGroups() {
    const container = document.getElementById('groupsContainer');
    if (!container) return;
    
    if (AppState.userGroups.length === 0) {
      container.innerHTML = '<p>No groups yet. Create your first group!</p>';
      return;
    }
    
    container.innerHTML = AppState.userGroups.map(group => `
      <div class="group-card" data-id="${group.id}">
        <h3>${group.name}</h3>
        <button class="buzz-btn" data-id="${group.id}">Buzz Group</button>
      </div>
    `).join('');
    
    document.querySelectorAll('.group-card .buzz-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const groupId = e.target.dataset.id;
        AppState.socket.emit('buzzGroup', { groupId });
      });
    });
  },
  
  // Event Handlers
  async handleLogin() {
    const phone = document.getElementById('loginPhone').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });
      
      const data = await res.json();
      if (data.success) {
        AppState.currentUser = data.user;
        AppState.userGroups = data.groups || [];
        this.renderDashboard();
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    }
  },
  
  async handleSignup() {
    const name = document.getElementById('signupName').value;
    const phone = document.getElementById('signupPhone').value;
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirm').value;
    
    if (password !== confirm) {
      alert('Passwords do not match');
      return;
    }
    
    try {
      const res = await fetch('/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, password })
      });
      
      const data = await res.json();
      if (data.success) {
        AppState.currentUser = data.user;
        this.renderDashboard();
      } else {
        alert(data.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Signup failed. Please try again.');
    }
  },
  
  async handleCreateGroup() {
    const name = document.getElementById('newGroupName').value.trim();
    if (!name) return;
    
    try {
      const res = await fetch('/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, userId: AppState.currentUser.id })
      });
      
      const data = await res.json();
      if (data.success) {
        AppState.userGroups.push(data.group);
        this.renderGroups();
        document.getElementById('newGroupName').value = '';
      }
    } catch (error) {
      console.error('Create group error:', error);
    }
  },
  
  handleBuzzAll() {
    AppState.socket.emit('buzzAll');
  },
  
  async handleLogout() {
    try {
      await fetch('/auth/logout');
      AppState.currentUser = null;
      AppState.userGroups = [];
      this.renderLogin();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
};

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  AppState.init();
});
