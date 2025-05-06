// App State
const appState = {
  currentUser: null,
  groups: []
};

// DOM Elements
const elements = {
  app: document.getElementById('app'),
  buzzSound: document.getElementById('buzzSound')
};

// Mock Database
const database = {
  users: [{ phone: "+1234567890", password: "password123", name: "Demo User" }],
  groups: [
    {
      id: "group1",
      name: "Family",
      members: [
        { id: "m1", name: "Mom", phone: "+1234567891" },
        { id: "m2", name: "Dad", phone: "+1234567892" }
      ]
    }
  ]
};

// Initialize App
function init() {
  loadFromStorage();
  setupEventListeners();
  renderLoginScreen();
}

// Screen Rendering
function renderLoginScreen() {
  elements.app.innerHTML = `
    <div class="screen">
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
        </div>
      </div>
    </div>
  `;
}

function renderGroupsScreen() {
  elements.app.innerHTML = `
    <div class="screen">
      <div class="banner">MY GROUPS</div>
      <div class="group-list">
        ${appState.groups.map(group => `
          <div class="group-item" data-group-id="${group.id}">
            <div class="group-info">
              <h3>${group.name}</h3>
              <span>${group.members.length} members</span>
            </div>
            <div class="group-actions">
              <button class="btn small" data-action="view-members" data-group-id="${group.id}">
                <i class="fas fa-users"></i>
              </button>
              <button class="btn small accent" data-action="buzz-all" data-group-id="${group.id}">
                <i class="fas fa-bell"></i>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="action-buttons">
        <button id="createGroupBtn" class="btn primary">➕ Create Group</button>
        <button id="logoutBtn" class="btn secondary">Logout</button>
      </div>
    </div>
  `;
}

function showMemberModal(groupId) {
  const group = appState.groups.find(g => g.id === groupId);
  if (!group) return;

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="screen-header">
        <h2>${group.name} Members</h2>
        <button class="back-button" id="closeModal">&times;</button>
      </div>
      <div class="member-list">
        ${group.members.map(member => `
          <div class="member-item">
            <input type="checkbox" id="member-${member.id}" class="member-checkbox">
            <div class="member-info">
              <div>${member.name}</div>
              <div class="text-muted">${member.phone}</div>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="action-buttons">
        <button id="addMemberBtn" class="btn primary">Add Member</button>
        <button id="removeMembersBtn" class="btn danger">Remove Selected</button>
        <button id="buzzSelectedBtn" class="btn accent">Buzz Selected</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  
  // Modal event listeners
  modal.querySelector('#closeModal').addEventListener('click', () => {
    modal.remove();
  });

  // Add other modal button handlers...
}

// Core Functions
function handleLogin() {
  const phone = document.getElementById('phone').value;
  const password = document.getElementById('password').value;
  
  const user = database.users.find(u => u.phone === phone && u.password === password);
  if (user) {
    appState.currentUser = user;
    saveToStorage();
    renderGroupsScreen();
  } else {
    alert('Invalid credentials');
  }
}

function handleCreateGroup() {
  const name = prompt('Enter group name:');
  if (name) {
    appState.groups.push({
      id: 'group' + Date.now(),
      name,
      members: []
    });
    saveToStorage();
    renderGroupsScreen();
  }
}

function handleBuzzAll(groupId) {
  const group = appState.groups.find(g => g.id === groupId);
  if (group) {
    elements.buzzSound.play();
    alert(`Buzzed ${group.members.length} members!`);
  }
}

// Event Listeners
function setupEventListeners() {
  document.addEventListener('click', (e) => {
    // Password toggle
    if (e.target.id === 'showPassword') {
      const input = document.getElementById('password');
      input.type = e.target.checked ? 'text' : 'password';
    }
    
    // Navigation
    if (e.target.id === 'createAccountLink') {
      e.preventDefault();
      renderSignupScreen();
    }
    
    if (e.target.id === 'loginBtn') {
      handleLogin();
    }
    
    if (e.target.id === 'createGroupBtn') {
      handleCreateGroup();
    }
    
    if (e.target.id === 'logoutBtn') {
      localStorage.removeItem('buzzall_user');
      renderLoginScreen();
    }
    
    // Group actions
    if (e.target.closest('[data-action="view-members"]')) {
      const groupId = e.target.closest('[data-group-id]').dataset.groupId;
      showMemberModal(groupId);
    }
    
    if (e.target.closest('[data-action="buzz-all"]')) {
      const groupId = e.target.closest('[data-group-id]').dataset.groupId;
      handleBuzzAll(groupId);
    }
  });
}

// Storage
function loadFromStorage() {
  const user = localStorage.getItem('buzzall_user');
  if (user) {
    appState.currentUser = JSON.parse(user);
    appState.groups = JSON.parse(localStorage.getItem('buzzall_groups')) || database.groups;
  }
}

function saveToStorage() {
  localStorage.setItem('buzzall_user', JSON.stringify(appState.currentUser));
  localStorage.setItem('buzzall_groups', JSON.stringify(appState.groups));
}

// Initialize
document.addEventListener('DOMContentLoaded', init);
