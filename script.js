// ======================
// BUZZALL - Fixed Working Version
// ======================

// App State
const appState = {
  currentUser: null,
  currentGroup: null,
  groups: []
};

// DOM Elements
const app = document.getElementById('app');
const buzzSound = document.getElementById('buzzSound');

// Mock User Database
const mockUsers = [
  {
    phone: "+1234567890",
    password: "password123",
    fullName: "Demo User"
  }
];

// Initialize the app
function init() {
  checkAuthState();
  setupEventListeners();
}

// Check authentication state
function checkAuthState() {
  const user = localStorage.getItem('buzzall_user');
  if (user) {
    appState.currentUser = JSON.parse(user);
    loadGroups();
    renderGroupsScreen();
  } else {
    renderLoginScreen();
  }
}

// Load groups from localStorage
function loadGroups() {
  const savedGroups = localStorage.getItem('buzzall_groups');
  appState.groups = savedGroups ? JSON.parse(savedGroups) : [
    {
      id: 'group1',
      name: 'Sample Group',
      members: [
        { id: 'm1', name: 'John Doe', phone: '+1234567891' },
        { id: 'm2', name: 'Jane Smith', phone: '+1234567892' }
      ]
    }
  ];
}

// Save groups to localStorage
function saveGroups() {
  localStorage.setItem('buzzall_groups', JSON.stringify(appState.groups));
}

// ======================
// Authentication Functions
// ======================

function handleLogin() {
  const phone = document.getElementById('phone').value;
  const password = document.getElementById('password').value;

  // Simple validation
  if (!phone || !password) {
    showAlert('Please enter both phone and password');
    return;
  }

  // Check mock users
  const user = mockUsers.find(u => u.phone === phone && u.password === password);
  if (user) {
    appState.currentUser = {
      phone: user.phone,
      fullName: user.fullName
    };
    localStorage.setItem('buzzall_user', JSON.stringify(appState.currentUser));
    loadGroups();
    renderGroupsScreen();
  } else {
    showAlert('Invalid phone number or password');
  }
}

function handleSignup() {
  const fullName = document.getElementById('fullName').value;
  const phone = document.getElementById('phone').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  // Validation
  if (password !== confirmPassword) {
    showAlert("Passwords don't match!");
    return;
  }

  // Check if user exists
  if (mockUsers.some(u => u.phone === phone)) {
    showAlert("User already exists with this phone number");
    return;
  }

  // Create new user
  mockUsers.push({ phone, password, fullName });
  showAlert("Account created successfully! Please login.", true);
  renderLoginScreen();
}

function handleLogout() {
  localStorage.removeItem('buzzall_user');
  appState.currentUser = null;
  renderLoginScreen();
}

// ======================
// Group Management
// ======================

function createGroup(name) {
  const newGroup = {
    id: 'group' + Date.now(),
    name: name,
    members: []
  };
  appState.groups.push(newGroup);
  saveGroups();
  renderGroupsScreen();
  showAlert(`Group "${name}" created!`, true);
}

function addMember(groupId, name, phone) {
  const group = appState.groups.find(g => g.id === groupId);
  if (group) {
    group.members.push({
      id: 'member' + Date.now(),
      name: name,
      phone: phone
    });
    saveGroups();
    renderGroupDetailScreen(groupId);
    showAlert(`Added ${name} to group!`, true);
  }
}

function removeMembers(groupId, memberIds) {
  const group = appState.groups.find(g => g.id === groupId);
  if (group) {
    group.members = group.members.filter(m => !memberIds.includes(m.id));
    saveGroups();
    renderGroupDetailScreen(groupId);
    showAlert(`Removed ${memberIds.length} members`, true);
  }
}

// ======================
// Buzz Functionality
// ======================

function buzzMembers(memberIds) {
  buzzSound.play();
  showAlert(`Buzzing ${memberIds.length} members!`, true);
}

function buzzAll(groupId) {
  const group = appState.groups.find(g => g.id === groupId);
  if (group) {
    buzzSound.play();
    showAlert(`Buzzing all ${group.members.length} members!`, true);
  }
}

// ======================
// UI Rendering
// ======================

function renderLoginScreen() {
  app.innerHTML = `
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
  app.innerHTML = `
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
  app.innerHTML = `
    <div class="screen my-groups-screen">
      <div class="banner">MY GROUPS</div>
      <div class="group-list">
        ${appState.groups.map(group => `
          <div class="group-item" data-group-id="${group.id}">
            <div class="group-info">
              <h3>${group.name}</h3>
              <span class="member-count">${group.members.length} members</span>
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
  
  app.innerHTML = `
    <div class="screen group-detail-screen">
      <div class="banner">${group.name}</div>
      <div class="member-list">
        ${group.members.map(member => `
          <div class="member-item">
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
  const modalHTML = `
    <div class="modal active">
      <div class="modal-content">
        <h3>Create New Group</h3>
        <div class="input-group">
          <input type="text" id="groupNameInput" placeholder="Enter group name" required>
        </div>
        <div class="modal-actions">
          <button id="cancelGroupBtn" class="btn secondary">Cancel</button>
          <button id="confirmGroupBtn" class="btn primary">Create</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  document.getElementById('confirmGroupBtn').addEventListener('click', () => {
    const groupName = document.getElementById('groupNameInput').value.trim();
    if (groupName) {
      createGroup(groupName);
      closeModal();
    }
  });
  
  document.getElementById('cancelGroupBtn').addEventListener('click', closeModal);
}

function renderAddMemberModal() {
  const modalHTML = `
    <div class="modal active">
      <div class="modal-content">
        <h3>Add New Member</h3>
        <div class="input-group">
          <input type="text" id="memberNameInput" placeholder="Member name" required>
        </div>
        <div class="input-group">
          <input type="tel" id="memberPhoneInput" placeholder="Phone number" required>
        </div>
        <div class="modal-actions">
          <button id="cancelMemberBtn" class="btn secondary">Cancel</button>
          <button id="confirmMemberBtn" class="btn primary">Add</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  document.getElementById('confirmMemberBtn').addEventListener('click', () => {
    const name = document.getElementById('memberNameInput').value.trim();
    const phone = document.getElementById('memberPhoneInput').value.trim();
    if (name && phone) {
      addMember(appState.currentGroup.id, name, phone);
      closeModal();
    }
  });
  
  document.getElementById('cancelMemberBtn').addEventListener('click', closeModal);
}

function closeModal() {
  const modal = document.querySelector('.modal');
  if (modal) modal.remove();
}

function showAlert(message, isSuccess = false) {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert ${isSuccess ? 'success' : 'error'}`;
  alertDiv.textContent = message;
  document.body.appendChild(alertDiv);
  setTimeout(() => alertDiv.remove(), 3000);
}

// ======================
// Event Handling
// ======================

function setupEventListeners() {
  // Password visibility toggle
  document.addEventListener('change', (e) => {
    if (e.target.id === 'showPassword') {
      const input = e.target.closest('.input-group').querySelector('input[type="password"]');
      if (input) input.type = e.target.checked ? 'text' : 'password';
    }
  });
  
  // Navigation
  document.addEventListener('click', (e) => {
    if (e.target.id === 'createAccountLink' || e.target.id === 'loginLink') {
      e.preventDefault();
      renderSignupScreen();
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
      renderCreateGroupModal();
    }
    
    if (e.target.id === 'addMemberBtn') {
      e.preventDefault();
      renderAddMemberModal();
    }
    
    // Buzz actions
    if (e.target.id === 'buzzSelectedBtn') {
      e.preventDefault();
      const selected = Array.from(document.querySelectorAll('.member-checkbox:checked'))
        .map(checkbox => checkbox.id.replace('member-', ''));
      if (selected.length > 0) {
        buzzMembers(selected);
      } else {
        showAlert('Please select at least one member');
      }
    }
    
    if (e.target.id === 'buzzAllBtn') {
      e.preventDefault();
      buzzAll(appState.currentGroup.id);
    }
    
    if (e.target.id === 'removeMemberBtn') {
      e.preventDefault();
      const selected = Array.from(document.querySelectorAll('.member-checkbox:checked'))
        .map(checkbox => checkbox.id.replace('member-', ''));
      if (selected.length > 0) {
        removeMembers(appState.currentGroup.id, selected);
      } else {
        showAlert('Please select members to remove');
      }
    }
    
    // Modal close
    if (e.target.classList.contains('modal')) {
      closeModal();
    }
  });
}

// Start the app
init();
