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

// Utility Functions
function showError(message) {
  alert(`Error: ${message}`);
}

function playBuzzSound() {
  buzzSound.currentTime = 0;
  buzzSound.play().catch(e => console.error('Error playing sound:', e));
}

function togglePasswordVisibility(inputId) {
  const input = document.getElementById(inputId);
  const icon = document.querySelector(`[data-input="${inputId}"] i`);
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.replace('fa-eye', 'fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.replace('fa-eye-slash', 'fa-eye');
  }
}

// Authentication Functions
function handleSignup(e) {
  e.preventDefault();
  const name = document.getElementById('signup-name')?.value.trim();
  const phone = document.getElementById('signup-phone')?.value.trim();
  const password = document.getElementById('signup-password')?.value;
  const confirmPassword = document.getElementById('confirm-password')?.value;

  if (!name || !phone || !password || !confirmPassword) {
    return showError('Please fill all fields');
  }

  if (password !== confirmPassword) {
    return showError('Passwords do not match');
  }

  const user = { name, phone, password, groups: [] };
  localStorage.setItem(`user_${phone}`, JSON.stringify(user));
  alert('Sign Up Successful!');
  renderLoginScreen();
}

function handleLogin(e) {
  e.preventDefault();
  const phone = document.getElementById('login-phone')?.value.trim();
  const password = document.getElementById('login-password')?.value;

  const userData = localStorage.getItem(`user_${phone}`);
  if (!userData) return showError('User not found');

  try {
    const user = JSON.parse(userData);
    if (user.password !== password) return showError('Invalid password');

    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    renderGroupsScreen();
  } catch (e) {
    showError('Failed to login');
    console.error(e);
  }
}

function handleLogout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  renderLoginScreen();
}

// Group Management Functions
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
    selectedMembers.splice(index, 1);
  } else {
    selectedMembers.push(memberIndex);
  }
  saveCurrentUser();
  renderGroupScreen();
}

function handleBuzzSelected() {
  const group = currentUser.groups[currentGroupIndex];
  if (group.selectedMembers.length === 0) {
    return showError('No members selected');
  }

  group.selectedMembers.forEach(index => {
    const member = group.members[index];
    if (member.phone) {
      socket.emit('buzz', { to: member.phone });
    }
  });
  playBuzzSound();
}

function handleBuzzAll() {
  const group = currentUser.groups[currentGroupIndex];
  group.members.forEach(member => {
    if (member.phone) {
      socket.emit('buzz', { to: member.phone });
    }
  });
  playBuzzSound();
}

function saveCurrentUser() {
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

// Render Functions
function renderLoginScreen() {
  app.innerHTML = `
    <div class="screen">
      <div class="banner">BUZZUR</div>
      <div class="form">
        <h2>Login</h2>
        <form id="login-form">
          <input type="text" id="login-phone" placeholder="Phone Number" required>
          <div class="password-container">
            <input type="password" id="login-password" placeholder="Password" required>
            <button type="button" class="toggle-password" data-input="login-password" onclick="togglePasswordVisibility('login-password')">
              <i class="fas fa-eye"></i>
            </button>
          </div>
          <button type="submit" class="btn-green">Login</button>
        </form>
        <div class="links">
          <a href="#" onclick="renderSignupScreen()">Sign up</a> | 
          <a href="#" onclick="renderForgotPasswordScreen()">Forgot Password?</a>
        </div>
      </div>
    </div>
  `;
  document.getElementById('login-form')?.addEventListener('submit', handleLogin);
}

function renderSignupScreen() {
  app.innerHTML = `
    <div class="screen">
      <div class="banner">BUZZUR</div>
      <div class="form">
        <h2>Sign Up</h2>
        <form id="signup-form">
          <input type="text" id="signup-name" placeholder="Full Name" required>
          <input type="text" id="signup-phone" placeholder="Phone Number" required>
          <div class="password-container">
            <input type="password" id="signup-password" placeholder="Password" required>
            <button type="button" class="toggle-password" data-input="signup-password" onclick="togglePasswordVisibility('signup-password')">
              <i class="fas fa-eye"></i>
            </button>
          </div>
          <div class="password-container">
            <input type="password" id="confirm-password" placeholder="Confirm Password" required>
            <button type="button" class="toggle-password" data-input="confirm-password" onclick="togglePasswordVisibility('confirm-password')">
              <i class="fas fa-eye"></i>
            </button>
          </div>
          <button type="submit" class="btn-green">Sign Up</button>
        </form>
        <div class="links">
          <a href="#" onclick="renderLoginScreen()">Already have an account? Login</a>
        </div>
      </div>
    </div>
  `;
  document.getElementById('signup-form')?.addEventListener('submit', handleSignup);
}

function renderGroupsScreen() {
  if (!currentUser) return renderLoginScreen();

  app.innerHTML = `
    <div class="screen">
      <div class="banner">My Groups</div>
      <div class="form">
        <button onclick="handleCreateGroup()" class="btn-green">Create Group</button>
        <div class="group-list">
          ${currentUser.groups.map((group, index) => `
            <div class="group-item" onclick="openGroup(${index})">
              ${group.name}
              <span class="member-count">${group.members.length} members</span>
            </div>
          `).join('')}
        </div>
        <button onclick="handleLogout()" class="btn-green">Logout</button>
      </div>
    </div>
  `;
}

function renderGroupScreen() {
  if (!currentUser) return renderLoginScreen();
  const group = currentUser.groups[currentGroupIndex];

  app.innerHTML = `
    <div class="screen">
      <div class="banner">${group.name}</div>
      <div class="form">
        <h3>Members</h3>
        <div class="member-list">
          ${group.members.map((member, index) => `
            <div class="member-item ${group.selectedMembers.includes(index) ? 'selected' : ''}">
              <button class="select-btn" onclick="event.stopPropagation(); toggleMemberSelection(${index})">
                <i class="fas ${group.selectedMembers.includes(index) ? 'fa-check-circle' : 'fa-circle'}"></i>
              </button>
              <div class="member-info">
                <div class="member-name">${member.name}</div>
                <div class="member-phone">${member.phone}</div>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="form-actions">
          <input type="text" id="new-member-name" placeholder="Member Name">
          <input type="text" id="new-member-phone" placeholder="Phone Number">
          <button onclick="addMember()" class="btn-green">Add Member</button>
        </div>
        
        <div class="buzz-actions">
          <button onclick="handleBuzzSelected()" class="btn-green">Buzz Selected</button>
          <button onclick="handleBuzzAll()" class="btn-green">Buzz All</button>
        </div>
        
        <div class="navigation-actions">
          <button onclick="renderGroupsScreen()" class="btn-green">Back to Groups</button>
        </div>
      </div>
    </div>
  `;
}

function openGroup(index) {
  currentGroupIndex = index;
  renderGroupScreen();
}

function addMember() {
  const name = document.getElementById('new-member-name')?.value.trim();
  const phone = document.getElementById('new-member-phone')?.value.trim();
  if (!name || !phone) return showError('Please enter name and phone number');

  currentUser.groups[currentGroupIndex].members.push({ name, phone });
  saveCurrentUser();
  renderGroupScreen();
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  try {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      currentUser = JSON.parse(userData);
      renderGroupsScreen();
    } else {
      renderLoginScreen();
    }
  } catch (e) {
    console.error('Initialization error:', e);
    renderLoginScreen();
  }
});

// Socket.IO Events
socket.on('receive-buzz', playBuzzSound);

// Expose functions to global scope
window.togglePasswordVisibility = togglePasswordVisibility;
window.renderLoginScreen = renderLoginScreen;
window.renderSignupScreen = renderSignupScreen;
window.renderForgotPasswordScreen = renderForgotPasswordScreen;
window.renderGroupsScreen = renderGroupsScreen;
window.openGroup = openGroup;
window.handleLogout = handleLogout;
window.handleCreateGroup = handleCreateGroup;
window.toggleMemberSelection = toggleMemberSelection;
window.handleBuzzSelected = handleBuzzSelected;
window.handleBuzzAll = handleBuzzAll;
window.addMember = addMember;
