// ======================
// BUZZALL - Complete Frontend
// ======================

// App State
const appState = {
  currentUser: null,
  currentGroup: null,
  groups: [],
  tempData: {} // For form data between screens
};

// DOM Elements
const elements = {
  app: document.getElementById('app'),
  buzzSound: document.getElementById('buzzSound')
};

// Firebase Configuration (replace with your actual config)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase (uncomment when ready)
// firebase.initializeApp(firebaseConfig);
// const auth = firebase.auth();
// const db = firebase.database();

// ======================
// CORE FUNCTIONALITY
// ======================

/**
 * Main initialization
 */
function initApp() {
  setupEventListeners();
  checkAuthState();
}

/**
 * Check if user is authenticated
 */
function checkAuthState() {
  // Mock implementation - replace with actual Firebase auth check
  const mockUser = localStorage.getItem('buzzall_mock_user');
  if (mockUser) {
    appState.currentUser = JSON.parse(mockUser);
    loadUserGroups();
  } else {
    renderLoginScreen();
  }
}

/**
 * Load user's groups from database
 */
function loadUserGroups() {
  // Mock implementation
  const mockGroups = [
    {
      id: 'group1',
      name: 'Family',
      members: [
        { id: 'm1', name: 'Mom', phone: '+1234567890' },
        { id: 'm2', name: 'Dad', phone: '+1234567891' }
      ]
    },
    {
      id: 'group2',
      name: 'Work Team',
      members: [
        { id: 'm3', name: 'Alice', phone: '+1234567892' },
        { id: 'm4', name: 'Bob', phone: '+1234567893' }
      ]
    }
  ];
  appState.groups = mockGroups;
  renderGroupsScreen();
}

// ======================
// RENDER FUNCTIONS
// ======================

function renderLoginScreen() {
  elements.app.innerHTML = `
    <div class="screen login-screen">
      <div class="banner">BUZZALL</div>
      <div class="form-container">
        <div class="input-group">
          <label for="phone">Phone Number</label>
          <input type="tel" id="phone" placeholder="+1234567890" required>
        </div>
        <div class="input-group">
          <label for="password">Password</label>
          <input type="password" id="password" placeholder="••••••••" required>
          <label class="checkbox-container">
            <input type="checkbox" id="showPassword"> Show password
          </label>
        </div>
        <button id="loginBtn" class="btn primary">Login</button>
        <div class="links">
          <a href="#" id="createAccountLink">Create Account</a>
          <a href="#" id="forgotPasswordLink">Forgot Password?</a>
        </div>
      </div>
    </div>
  `;
}

function renderSignupScreen() {
  elements.app.innerHTML = `
    <div class="screen signup-screen">
      <div class="banner">SIGN UP</div>
      <div class="form-container">
        <div class="input-group">
          <label for="fullName">Full Name</label>
          <input type="text" id="fullName" placeholder="John Doe" required>
        </div>
        <div class="input-group">
          <label for="phone">Phone Number</label>
          <input type="tel" id="phone" placeholder="+1234567890" required>
        </div>
        <div class="input-group">
          <label for="password">Password</label>
          <input type="password" id="password" placeholder="••••••••" required>
        </div>
        <div class="input-group">
          <label for="confirmPassword">Confirm Password</label>
          <input type="password" id="confirmPassword" placeholder="••••••••" required>
          <label class="checkbox-container">
            <input type="checkbox" id="showPassword"> Show password
          </label>
        </div>
        <button id="signupBtn" class="btn primary">Sign Up</button>
        <div class="links">
          <a href="#" id="loginLink">Already have an account? Login</a>
        </div>
      </div>
    </div>
  `;
}

function renderGroupsScreen() {
  elements.app.innerHTML = `
    <div class="screen my-groups-screen">
      <div class="banner">MY GROUPS</div>
      <div class="group-list" id="groupList">
        ${appState.groups.map(group => `
          <div class="group-item" data-group-id="${group.id}">
            <div class="group-info">
              <h3>${group.name}</h3>
              <span class="member-count">${group.members.length}</span>
            </div>
            <i class="fas fa-chevron-right"></i>
          </div>
        `).join('')}
      </div>
      <div class="action-buttons">
        <button id="createGroupBtn" class="btn primary">➕ Create Group</button>
        <button id="logoutBtn" class="btn secondary">🚪 Logout</button>
      </div>
    </div>
  `;
}

function renderGroupDetailScreen(groupId) {
  const group = appState.groups.find(g => g.id === groupId);
  if (!group) return;
  
  appState.currentGroup = group;
  
  elements.app.innerHTML = `
    <div class="screen group-detail-screen">
      <div class="banner">${group.name}</div>
      <div class="member-list" id="memberList">
        ${group.members.map(member => `
          <div class="member-item" data-member-id="${member.id}">
            <input type="checkbox" id="member-${member.id}" class="member-checkbox">
            <div class="member-info">
              <div class="member-name">${member.name}</div>
              <div class="member-phone">${member.phone}</div>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="action-buttons">
        <button id="addMemberBtn" class="btn primary">➕ Add Member</button>
        <button id="removeMemberBtn" class="btn danger">🗑️ Remove Selected</button>
        <button id="buzzSelectedBtn" class="btn accent">🔔 Buzz Selected</button>
        <button id="buzzAllBtn" class="btn accent">🔔 Buzz All</button>
        <button id="backBtn" class="btn secondary">⬅️ Back</button>
      </div>
    </div>
  `;
}

function renderCreateGroupModal() {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <h3>Create New Group</h3>
      <div class="input-group">
        <label for="groupName">Group Name</label>
        <input type="text" id="groupName" placeholder="My Group" required>
      </div>
      <div class="modal-actions">
        <button id="cancelCreateGroup" class="btn secondary">Cancel</button>
        <button id="confirmCreateGroup" class="btn primary">Create</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// ======================
// EVENT HANDLERS
// ======================

function handleLogin() {
  const phone = document.getElementById('phone').value;
  const password = document.getElementById('password').value;
  
  // Mock authentication - replace with Firebase auth
  if (phone && password) {
    appState.currentUser = { uid: 'mock_user', phone };
    localStorage.setItem('buzzall_mock_user', JSON.stringify(appState.currentUser));
    loadUserGroups();
  } else {
    alert('Please enter phone and password');
  }
}

function handleSignup() {
  const fullName = document.getElementById('fullName').value;
  const phone = document.getElementById('phone').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  if (password !== confirmPassword) {
    alert("Passwords don't match!");
    return;
  }
  
  // Mock user creation
  appState.currentUser = { uid: 'mock_user', fullName, phone };
  localStorage.setItem('buzzall_mock_user', JSON.stringify(appState.currentUser));
  alert("Account created successfully!");
  loadUserGroups();
}

function handleLogout() {
  localStorage.removeItem('buzzall_mock_user');
  appState.currentUser = null;
  renderLoginScreen();
}

function handleCreateGroup() {
  renderCreateGroupModal();
  
  document.getElementById('confirmCreateGroup').addEventListener('click', () => {
    const groupName = document.getElementById('groupName').value;
    if (!groupName) return;
    
    const newGroup = {
      id: 'group' + Date.now(),
      name: groupName,
      members: []
    };
    
    appState.groups.push(newGroup);
    document.querySelector('.modal').remove();
    renderGroupsScreen();
  });
  
  document.getElementById('cancelCreateGroup').addEventListener('click', () => {
    document.querySelector('.modal').remove();
  });
}

function handleBuzzSelected() {
  const selected = Array.from(document.querySelectorAll('.member-checkbox:checked'))
    .map(el => el.id.replace('member-', ''));
  
  if (selected.length === 0) {
    alert('Please select at least one member');
    return;
  }
  
  elements.buzzSound.play();
  alert(`Buzz sent to ${selected.length} members!`);
}

function handleBuzzAll() {
  elements.buzzSound.play();
  alert(`Buzz sent to all ${appState.currentGroup.members.length} members!`);
}

// ======================
// UTILITY FUNCTIONS
// ======================

function setupEventListeners() {
  // Delegate all app events
  elements.app.addEventListener('click', (e) => {
    // Password toggle
    if (e.target.id === 'showPassword') {
      const input = e.target.closest('.input-group').querySelector('input[type="password"]');
      if (input) input.type = e.target.checked ? 'text' : 'password';
    }
    
    // Navigation
    if (e.target.id === 'createAccountLink') {
      e.preventDefault();
      renderSignupScreen();
    }
    
    if (e.target.id === 'loginLink') {
      e.preventDefault();
      renderLoginScreen();
    }
    
    if (e.target.id === 'loginBtn') {
      e.preventDefault();
      handleLogin();
    }
    
    if (e.target.id === 'signupBtn') {
      e.preventDefault();
      handleSignup();
    }
    
    if (e.target.id === 'logoutBtn') {
      e.preventDefault();
      handleLogout();
    }
    
    if (e.target.id === 'backBtn') {
      e.preventDefault();
      renderGroupsScreen();
    }
    
    // Group actions
    if (e.target.closest('.group-item')) {
      const groupId = e.target.closest('.group-item').dataset.groupId;
      renderGroupDetailScreen(groupId);
    }
    
    if (e.target.id === 'createGroupBtn') {
      e.preventDefault();
      handleCreateGroup();
    }
    
    // Buzz actions
    if (e.target.id === 'buzzSelectedBtn') {
      e.preventDefault();
      handleBuzzSelected();
    }
    
    if (e.target.id === 'buzzAllBtn') {
      e.preventDefault();
      handleBuzzAll();
    }
  });
}

// ======================
// INITIALIZE APP
// ======================

document.addEventListener('DOMContentLoaded', initApp);
