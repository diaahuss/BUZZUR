// App State
let currentUser = null;
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

function togglePasswordVisibility(inputId, checkboxId) {
  const passwordInput = document.getElementById(inputId);
  const checkbox = document.getElementById(checkboxId);
  passwordInput.type = checkbox.checked ? 'text' : 'password';
}

// Authentication Functions
function handleSignup() {
  const name = document.getElementById('name')?.value.trim();
  const phone = document.getElementById('phone')?.value.trim();
  const password = document.getElementById('password')?.value;

  if (!name || !phone || !password) {
    return showError('Please fill all fields');
  }

  const user = { name, phone, password, groups: [] };
  localStorage.setItem(`user_${phone}`, JSON.stringify(user));
  alert('Sign Up Successful!');
  renderLoginScreen();
}

function handleLogin() {
  const phone = document.getElementById('phone')?.value.trim();
  const password = document.getElementById('password')?.value;

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

function handleResetPassword() {
  const phone = document.getElementById('phone')?.value.trim();
  const userData = localStorage.getItem(`user_${phone}`);

  if (!userData) return showError('User not found');

  try {
    const user = JSON.parse(userData);
    user.password = '1234';
    localStorage.setItem(`user_${phone}`, JSON.stringify(user));
    alert('Password reset to 1234');
    renderLoginScreen();
  } catch (e) {
    showError('Failed to reset password');
    console.error(e);
  }
}

// Group Management Functions
function handleCreateGroup() {
  if (!currentUser) return handleLogout();

  const groupName = document.getElementById('newGroupName')?.value.trim();
  if (!groupName) return showError('Enter group name');

  currentUser.groups.push({ name: groupName, members: [] });
  saveCurrentUser();
  renderGroupsScreen();
}

function handleSaveGroupName(groupIndex) {
  const newName = document.getElementById('editGroupName')?.value.trim();
  if (!newName) return showError('Enter group name');

  currentUser.groups[groupIndex].name = newName;
  saveCurrentUser();
  renderGroupDetailsScreen(groupIndex);
}

function handleDeleteGroup(groupIndex) {
  if (!confirm('Are you sure you want to delete this group?')) return;

  currentUser.groups.splice(groupIndex, 1);
  saveCurrentUser();
  renderGroupsScreen();
}

function handleAddMember(groupIndex) {
  const name = document.getElementById('newMemberName')?.value.trim();
  const phone = document.getElementById('newMemberPhone')?.value.trim();
  if (!name || !phone) return showError('Enter name and phone');

  currentUser.groups[groupIndex].members.push({ name, phone });
  saveCurrentUser();
  renderGroupDetailsScreen(groupIndex);
}

function handleRemoveMember(groupIndex, memberIndex) {
  currentUser.groups[groupIndex].members.splice(memberIndex, 1);
  saveCurrentUser();
  renderGroupDetailsScreen(groupIndex);
}

function handleBuzzGroup(groupIndex) {
  const group = currentUser.groups[groupIndex];
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
    <div class="banner">BUZZUR</div>
    <div class="form">
      <h2>Login</h2>
      <input type="text" id="phone" placeholder="Phone Number" />
      <input type="password" id="password" placeholder="Password" />
      <label><input type="checkbox" id="showPassword"> Show Password</label>
      <button onclick="handleLogin()">Login</button>
      <p>
        <a href="#" onclick="renderSignupScreen()">Sign Up</a> | 
        <a href="#" onclick="renderForgotPasswordScreen()">Forgot Password</a>
      </p>
    </div>
  `;
  document.getElementById('showPassword')?.addEventListener('change', () => 
    togglePasswordVisibility('password', 'showPassword'));
}

function renderSignupScreen() {
  app.innerHTML = `
    <div class="banner">BUZZUR</div>
    <div class="form">
      <h2>Sign Up</h2>
      <input type="text" id="name" placeholder="Name" />
      <input type="text" id="phone" placeholder="Phone Number" />
      <input type="password" id="password" placeholder="Password" />
      <label><input type="checkbox" id="showPasswordSignup"> Show Password</label>
      <button onclick="handleSignup()">Sign Up</button>
      <p><a href="#" onclick="renderLoginScreen()">Back to Login</a></p>
    </div>
  `;
  document.getElementById('showPasswordSignup')?.addEventListener('change', () => 
    togglePasswordVisibility('password', 'showPasswordSignup'));
}

function renderForgotPasswordScreen() {
  app.innerHTML = `
    <div class="banner">BUZZUR</div>
    <div class="form">
      <h2>Forgot Password</h2>
      <input type="text" id="phone" placeholder="Phone Number" />
      <button onclick="handleResetPassword()">Reset Password</button>
      <p><a href="#" onclick="renderLoginScreen()">Back to Login</a></p>
    </div>
  `;
}

function renderGroupsScreen() {
  if (!currentUser) return handleLogout();

  app.innerHTML = `
    <div class="banner">My Groups</div>
    <div class="groups">
      ${currentUser.groups.map((group, index) => `
        <button onclick="renderGroupDetailsScreen(${index})">${group.name}</button>
      `).join('')}
    </div>
    <div class="form">
      <input type="text" id="newGroupName" placeholder="New Group Name" />
      <button onclick="handleCreateGroup()">Create Group</button>
      <button onclick="handleLogout()" class="logout-btn">Logout</button>
    </div>
  `;
}

function renderGroupDetailsScreen(groupIndex) {
  if (!currentUser) return handleLogout();
  const group = currentUser.groups[groupIndex];

  app.innerHTML = `
    <div class="banner">${group.name}</div>
    <div class="form">
      <input type="text" id="editGroupName" value="${group.name}" />
      <button onclick="handleSaveGroupName(${groupIndex})">Save Name</button>
      <h3>Members</h3>
      <div class="members">
        ${group.members.map((member, memberIndex) => `
          <div class="member-row">
            <input type="text" value="${member.name}" 
              onchange="currentUser.groups[${groupIndex}].members[${memberIndex}].name = this.value; saveCurrentUser()" />
            <input type="text" value="${member.phone}" 
              onchange="currentUser.groups[${groupIndex}].members[${memberIndex}].phone = this.value; saveCurrentUser()" />
            <button onclick="handleRemoveMember(${groupIndex}, ${memberIndex})">Remove</button>
          </div>
        `).join('')}
      </div>
      <input type="text" id="newMemberName" placeholder="Member Name" />
      <input type="text" id="newMemberPhone" placeholder="Member Phone" />
      <button onclick="handleAddMember(${groupIndex})">Add Member</button>
      <hr>
      <button onclick="handleBuzzGroup(${groupIndex})" class="buzz-btn">Buzz All</button>
      <button onclick="handleDeleteGroup(${groupIndex})" class="delete-btn">Delete Group</button>
      <button onclick="renderGroupsScreen()" class="back-btn">Back</button>
    </div>
  `;
}

// Socket.IO Events
socket.on('receive-buzz', playBuzzSound);

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

// Expose functions to global scope for HTML onclick attributes
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.handleLogout = handleLogout;
window.handleResetPassword = handleResetPassword;
window.handleCreateGroup = handleCreateGroup;
window.handleSaveGroupName = handleSaveGroupName;
window.handleDeleteGroup = handleDeleteGroup;
window.handleAddMember = handleAddMember;
window.handleRemoveMember = handleRemoveMember;
window.handleBuzzGroup = handleBuzzGroup;
window.renderLoginScreen = renderLoginScreen;
window.renderSignupScreen = renderSignupScreen;
window.renderForgotPasswordScreen = renderForgotPasswordScreen;
window.renderGroupsScreen = renderGroupsScreen;
window.renderGroupDetailsScreen = renderGroupDetailsScreen;
