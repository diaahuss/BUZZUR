// ===== STATE MANAGEMENT =====
const state = {
  currentUser: JSON.parse(localStorage.getItem('currentUser')) || null,
  users: JSON.parse(localStorage.getItem('users')) || [],
  groups: JSON.parse(localStorage.getItem('groups')) || [],
  currentGroup: null
};

// ===== DOM ELEMENTS =====
const screenContainer = document.getElementById('screen-container');
const buzzSound = document.getElementById('buzz-sound');

// ===== UTILITY FUNCTIONS =====
function saveState() {
  localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
  localStorage.setItem('users', JSON.stringify(state.users));
  localStorage.setItem('groups', JSON.stringify(state.groups));
}

function playBuzz() {
  buzzSound.currentTime = 0;
  buzzSound.play();
}

// ===== SCREEN RENDERING =====
function renderScreen(screen) {
  screenContainer.innerHTML = screen;
  setupEventListeners();
}

function renderLogin() {
  renderScreen(`
    <div class="auth-screen">
      <div class="logo">
        <i class="fas fa-bell"></i>
        <h1>Buzz Manager</h1>
      </div>
      <form class="auth-form" id="login-form">
        <div class="input-group">
          <i class="fas fa-phone"></i>
          <input type="tel" id="login-phone" placeholder="Phone number" required>
        </div>
        <div class="input-group">
          <i class="fas fa-lock"></i>
          <input type="password" id="login-password" placeholder="Password" required>
          <i class="fas fa-eye toggle-pw"></i>
        </div>
        <button type="submit" class="btn primary">Login</button>
      </form>
      <div class="auth-links">
        <a href="#" id="show-signup">Create account</a>
        <a href="#" id="forgot-pw">Forgot password?</a>
      </div>
    </div>
  `);
}

function renderSignup() {
  renderScreen(`
    <div class="auth-screen">
      <div class="logo">
        <i class="fas fa-bell"></i>
        <h1>Create Account</h1>
      </div>
      <form class="auth-form" id="signup-form">
        <div class="input-group">
          <i class="fas fa-user"></i>
          <input type="text" id="signup-name" placeholder="Full name" required>
        </div>
        <div class="input-group">
          <i class="fas fa-phone"></i>
          <input type="tel" id="signup-phone" placeholder="Phone number" required>
        </div>
        <div class="input-group">
          <i class="fas fa-lock"></i>
          <input type="password" id="signup-password" placeholder="Password" required>
          <i class="fas fa-eye toggle-pw"></i>
        </div>
        <div class="input-group">
          <i class="fas fa-lock"></i>
          <input type="password" id="signup-confirm" placeholder="Confirm password" required>
          <i class="fas fa-eye toggle-pw"></i>
        </div>
        <button type="submit" class="btn primary">Sign Up</button>
      </form>
      <div class="auth-links">
        <a href="#" id="show-login">Already have an account? Login</a>
      </div>
    </div>
  `);
}

function renderGroups() {
  const userGroups = state.groups.filter(g => g.ownerId === state.currentUser.id);
  
  renderScreen(`
    <div class="groups-screen">
      <header>
        <h2><i class="fas fa-bell"></i> My Groups</h2>
        <button id="logout" class="icon-btn"><i class="fas fa-sign-out-alt"></i></button>
      </header>
      
      <div class="content">
        <div id="groups-list" class="groups-list">
          ${userGroups.map(group => `
            <div class="group-card" data-id="${group.id}">
              <h3>${group.name}</h3>
              <span>${group.members.length} members</span>
            </div>
          `).join('') || '<p class="empty">No groups yet</p>'}
        </div>
        
        <div class="actions">
          <button id="create-group" class="btn primary">
            <i class="fas fa-plus"></i> Create Group
          </button>
        </div>
      </div>
    </div>
  `);
}

function renderGroupDetail(groupId) {
  const group = state.groups.find(g => g.id === groupId);
  state.currentGroup = group;
  
  renderScreen(`
    <div class="group-screen">
      <header>
        <button id="back" class="icon-btn"><i class="fas fa-arrow-left"></i></button>
        <h2>${group.name}</h2>
        <button id="delete-group" class="icon-btn danger"><i class="fas fa-trash"></i></button>
      </header>
      
      <div class="content">
        <div class="group-actions">
          <button id="add-member" class="btn primary">
            <i class="fas fa-user-plus"></i> Add Member
          </button>
          <button id="remove-members" class="btn danger">
            <i class="fas fa-user-minus"></i> Remove Selected
          </button>
        </div>
        
        <div id="members-list" class="members-list">
          ${group.members.map((member, index) => `
            <div class="member-card" data-index="${index}">
              <input type="checkbox" class="member-check">
              <div class="member-info">
                <h4>${member.name}</h4>
                <span>${member.phone}</span>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="buzz-actions">
          <button id="buzz-selected" class="btn primary">
            <i class="fas fa-bell"></i> Buzz Selected
          </button>
          <button id="buzz-all" class="btn primary">
            <i class="fas fa-bell"></i> Buzz All
          </button>
        </div>
      </div>
    </div>
  `);
}

// ===== EVENT HANDLERS =====
function setupEventListeners() {
  // Password toggle
  document.querySelectorAll('.toggle-pw').forEach(icon => {
    icon.addEventListener('click', function() {
      const input = this.previousElementSibling;
      input.type = input.type === 'password' ? 'text' : 'password';
      this.classList.toggle('fa-eye-slash');
    });
  });
  
  // Navigation
  if (document.getElementById('show-signup')) {
    document.getElementById('show-signup').addEventListener('click', (e) => {
      e.preventDefault();
      renderSignup();
    });
  }
  
  if (document.getElementById('show-login')) {
    document.getElementById('show-login').addEventListener('click', (e) => {
      e.preventDefault();
      renderLogin();
    });
  }
  
  // Forms
  if (document.getElementById('login-form')) {
    document.getElementById('login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const phone = document.getElementById('login-phone').value;
      const password = document.getElementById('login-password').value;
      
      const user = state.users.find(u => u.phone === phone && u.password === password);
      if (user) {
        state.currentUser = user;
        saveState();
        renderGroups();
      } else {
        alert('Invalid credentials');
      }
    });
  }
  
  if (document.getElementById('signup-form')) {
    document.getElementById('signup-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('signup-name').value;
      const phone = document.getElementById('signup-phone').value;
      const password = document.getElementById('signup-password').value;
      const confirm = document.getElementById('signup-confirm').value;
      
      if (password !== confirm) {
        alert("Passwords don't match");
        return;
      }
      
      if (state.users.some(u => u.phone === phone)) {
        alert("User already exists");
        return;
      }
      
      const newUser = { id: Date.now(), name, phone, password };
      state.users.push(newUser);
      state.currentUser = newUser;
      saveState();
      renderGroups();
    });
  }
  
  // Groups
  if (document.getElementById('create-group')) {
    document.getElementById('create-group').addEventListener('click', () => {
      const groupName = prompt("Enter group name");
      if (groupName) {
        const newGroup = {
          id: Date.now(),
          name: groupName,
          ownerId: state.currentUser.id,
          members: []
        };
        state.groups.push(newGroup);
        saveState();
        renderGroups();
      }
    });
  }
  
  // Group detail
  if (document.getElementById('back')) {
    document.getElementById('back').addEventListener('click', () => {
      renderGroups();
    });
  }
  
  // Initialize
  if (state.currentUser) {
    renderGroups();
  } else {
    renderLogin();
  }
}

// Initialize app
setupEventListeners();
