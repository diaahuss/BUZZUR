// App State
let currentUser = null;
let currentGroupIndex = null;
const socket = io('https://buzzur-server.onrender.com', {
  reconnectionAttempts: 3,
  timeout: 2000
});

// DOM Elements
const app = document.getElementById('app');
const buzzSound = document.getElementById('buzzSound');

// ===== UTILITY FUNCTIONS =====
function showError(message) {
  alert(`Error: ${message}`);
}

function playBuzzSound() {
  buzzSound.currentTime = 0;
  buzzSound.play().catch(e => console.error('Sound error:', e));
}

function togglePasswordVisibility(inputId) {
  const input = document.getElementById(inputId);
  const icon = document.querySelector(`[data-input="${inputId}"] i`);
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.replace('fa-eye', 'fa-eye-slash');
    icon.title = "Hide Password";
  } else {
    input.type = 'password';
    icon.classList.replace('fa-eye-slash', 'fa-eye');
    icon.title = "Show Password";
  }
}

// ===== AUTH FUNCTIONS =====
function handleSignup(e) {
  e.preventDefault();
  const name = document.getElementById('signup-name')?.value.trim();
  const phone = document.getElementById('signup-phone')?.value.trim();
  const password = document.getElementById('signup-password')?.value;
  const confirmPassword = document.getElementById('confirm-password')?.value;

  if (!name || !phone || !password || !confirmPassword) {
    return showError('All fields are required!');
  }

  if (password !== confirmPassword) {
    return showError('Passwords do not match!');
  }

  const user = { name, phone, password, groups: [] };
  localStorage.setItem(`user_${phone}`, JSON.stringify(user));
  alert('Account created! Please login.');
  renderLoginScreen();
}

function handleLogin(e) {
  e.preventDefault();
  const phone = document.getElementById('login-phone')?.value.trim();
  const password = document.getElementById('login-password')?.value;

  const userData = localStorage.getItem(`user_${phone}`);
  if (!userData) return showError('User not found!');

  const user = JSON.parse(userData);
  if (user.password !== password) return showError('Wrong password!');

  currentUser = user;
  localStorage.setItem('currentUser', JSON.stringify(user));
  renderGroupsScreen();
}

// ===== GROUP FUNCTIONS =====
function handleCreateGroup() {
  const groupName = prompt('Enter group name:');
  if (!groupName) return;

  currentUser.groups.push({ 
    name: groupName, 
    members: [],
    selectedMembers: [] 
  });
  saveCurrentUser();
  renderGroupsScreen();
}

function toggleMemberSelection(memberIndex) {
  const selectedMembers = currentUser.groups[currentGroupIndex].selectedMembers;
  const index = selectedMembers.indexOf(memberIndex);
  
  if (index > -1) {
    selectedMembers.splice(index, 1); // Deselect
  } else {
    selectedMembers.push(memberIndex); // Select
  }
  saveCurrentUser();
  renderGroupScreen();
}

function toggleSelectAllMembers() {
  const group = currentUser.groups[currentGroupIndex];
  group.selectedMembers = group.selectedMembers.length === group.members.length 
    ? [] // Deselect all
    : group.members.map((_, i) => i); // Select all
  saveCurrentUser();
  renderGroupScreen();
}

function handleBuzzSelected() {
  const group = currentUser.groups[currentGroupIndex];
  if (group.selectedMembers.length === 0) {
    return showError('No members selected!');
  }

  group.selectedMembers.forEach(index => {
    const member = group.members[index];
    if (member.phone) socket.emit('buzz', { to: member.phone });
  });
  playBuzzSound();
}

function handleBuzzAll() {
  const group = currentUser.groups[currentGroupIndex];
  group.members.forEach(member => {
    if (member.phone) socket.emit('buzz', { to: member.phone });
  });
  playBuzzSound();
}

// ===== RENDER FUNCTIONS =====
function renderLoginScreen() {
  app.innerHTML = `
    <div class="auth-screen">
      <h1 class="app-title">BUZZUR</h1>
      <form id="login-form" class="auth-form">
        <input type="text" id="login-phone" placeholder="Phone" required>
        <div class="input-group">
          <input type="password" id="login-password" placeholder="Password" required>
          <button type="button" class="toggle-password" data-input="login-password" onclick="togglePasswordVisibility('login-password')">
            <i class="fas fa-eye" title="Show Password"></i>
          </button>
        </div>
        <button type="submit" class="btn btn-primary">Login</button>
      </form>
      <div class="auth-links">
        <a href="#" onclick="renderSignupScreen()">Sign up</a>
        <a href="#" onclick="renderForgotPasswordScreen()">Forgot password?</a>
      </div>
    </div>
  `;
  document.getElementById('login-form').addEventListener('submit', handleLogin);
}

function renderGroupsScreen() {
  if (!currentUser) return renderLoginScreen();

  app.innerHTML = `
    <div class="groups-screen">
      <h1>My Groups</h1>
      <button onclick="handleCreateGroup()" class="btn btn-primary">+ New Group</button>
      <div class="group-list">
        ${currentUser.groups.map((group, i) => `
          <div class="group-card" onclick="openGroup(${i})">
            <h3>${group.name}</h3>
            <span>${group.members.length} members</span>
          </div>
        `).join('')}
      </div>
      <button onclick="handleLogout()" class="btn btn-logout">Logout</button>
    </div>
  `;
}

function renderGroupScreen() {
  if (!currentUser) return renderLoginScreen();
  const group = currentUser.groups[currentGroupIndex];

  app.innerHTML = `
    <div class="group-screen">
      <h1>${group.name}</h1>
      
      <div class="member-controls">
        <button onclick="toggleSelectAllMembers()" class="btn btn-small">
          ${group.selectedMembers.length === group.members.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>
      
      <div class="member-list">
        ${group.members.map((member, i) => `
          <div class="member-card ${group.selectedMembers.includes(i) ? 'selected' : ''}">
            <button class="select-btn" onclick="event.stopPropagation(); toggleMemberSelection(${i})">
              <i class="fas ${group.selectedMembers.includes(i) ? 'fa-check-square' : 'fa-square'}"></i>
            </button>
            <div class="member-details">
              <strong>${member.name}</strong>
              <span>${member.phone}</span>
            </div>
          </div>
        `).join('')}
      </div>
      
      <div class="group-actions">
        <input type="text" id="new-member-name" placeholder="Name">
        <input type="text" id="new-member-phone" placeholder="Phone">
        <button onclick="addMember()" class="btn btn-primary">Add Member</button>
      </div>
      
      <div class="buzz-actions">
        <button onclick="handleBuzzSelected()" class="btn btn-accent">Buzz Selected</button>
        <button onclick="handleBuzzAll()" class="btn btn-accent">Buzz All</button>
      </div>
      
      <button onclick="renderGroupsScreen()" class="btn btn-back">← Back</button>
    </div>
  `;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    renderGroupsScreen();
  } else {
    renderLoginScreen();
  }
});

// Socket.io
socket.on('receive-buzz', playBuzzSound);
