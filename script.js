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
function handleSignup() {
  const name = document.getElementById('name')?.value.trim();
  const phone = document.getElementById('phone')?.value.trim();
  const password = document.getElementById('password')?.value;
  const confirmPassword = document.getElementById('confirmPassword')?.value;

  if (!name || !phone || !password) {
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

  currentUser.groups.push({ 
    name: groupName, 
    members: [],
    selectedMembers: [] 
  });
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
  // Remove from selected members if present
  const selectedIndex = currentUser.groups[groupIndex].selectedMembers.indexOf(memberIndex);
  if (selectedIndex > -1) {
    currentUser.groups[groupIndex].selectedMembers.splice(selectedIndex, 1);
  }
  saveCurrentUser();
  renderGroupDetailsScreen(groupIndex);
}

function toggleMemberSelection(groupIndex, memberIndex) {
  const selectedMembers = currentUser.groups[groupIndex].selectedMembers;
  const index = selectedMembers.indexOf(memberIndex);
  
  if (index > -1) {
    selectedMembers.splice(index, 1);
  } else {
    selectedMembers.push(memberIndex);
  }
  saveCurrentUser();
  renderGroupDetailsScreen(groupIndex);
}

function handleBuzzSelected(groupIndex) {
  const group = currentUser.groups[groupIndex];
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

function handleBuzzAll(groupIndex) {
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
      <div class="password-container">
        <input type="password" id="password" placeholder="Password" />
        <button class="show-password" data-input="password" onclick="togglePasswordVisibility('password')">
          <i class="fas fa-eye"></i>
        </button>
      </div>
      <button class="login-btn" onclick="handleLogin()">Login</button>
      <p>
        <a href="#" onclick="renderSignupScreen()">Sign Up</a> | 
        <a href="#" onclick="renderForgotPasswordScreen()">Forgot Password</a>
      </p>
    </div>
  `;
}

function renderSignupScreen() {
  app.innerHTML = `
    <div class="banner">BUZZUR</div>
    <div class="form">
      <h2>Sign Up</h2>
      <input type="text" id="name" placeholder="Name" />
      <input type="text" id="phone" placeholder="Phone Number" />
      <div class="password-container">
        <input type="password" id="password" placeholder="Password" />
        <button class="show-password" data-input="password" onclick="togglePasswordVisibility('password')">
          <i class="fas fa-eye"></i>
        </button>
      </div>
      <div class="password-container">
        <input type="password" id="confirmPassword" placeholder="Confirm Password" />
        <button class="show-password" data-input="confirmPassword" onclick="togglePasswordVisibility('confirmPassword')">
          <i class="fas fa-eye"></i>
        </button>
      </div>
      <button class="signup-btn" onclick="handleSignup()">Sign Up</button>
      <p><a href="#" onclick="renderLoginScreen()">Back to Login</a></p>
    </div>
  `;
}

function renderForgotPasswordScreen() {
  app.innerHTML = `
    <div class="banner">BUZZUR</div>
    <div class="form">
      <h2>Forgot Password</h2>
      <input type="text" id="phone" placeholder="Phone Number" />
      <button class="reset-btn" onclick="handleResetPassword()">Reset Password</button>
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
        <button class="group-btn" onclick="renderGroupDetailsScreen(${index})">${group.name}</button>
      `).join('')}
    </div>
    <div class="form">
      <input type="text" id="newGroupName" placeholder="New Group Name" />
      <button class="create-group-btn" onclick="handleCreateGroup()">Create Group</button>
      <button class="logout-btn" onclick="handleLogout()">Logout</button>
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
      <button class="save-btn" onclick="handleSaveGroupName(${groupIndex})">Save Name</button>
      <h3>Members</h3>
      ${group.members.map((member, memberIndex) => `
        <div class="member">
          <span>${member.name} (${member.phone})</span>
          <input type="checkbox" ${group.selectedMembers.includes(memberIndex) ? 'checked' : ''} onclick="toggleMemberSelection(${groupIndex}, ${memberIndex})" />
          <button class="remove-btn" onclick="handleRemoveMember(${groupIndex}, ${memberIndex})">Remove Member</button>
        </div>
      `).join('')}
      <input type="text" id="newMemberName" placeholder="New Member Name" />
      <input type="text" id="newMemberPhone" placeholder="New Member Phone" />
      <button class="add-btn" onclick="handleAddMember(${groupIndex})">Add Member</button>
      <div class="buzz-buttons">
        <button class="buzz-all-btn" onclick="handleBuzzAll(${groupIndex})">Buzz All</button>
        <button class="buzz-selected-btn" onclick="handleBuzzSelected(${groupIndex})">Buzz Selected</button>
      </div>
      <button class="delete-btn" onclick="handleDeleteGroup(${groupIndex})">Delete Group</button>
      <button class="back-btn" onclick="renderGroupsScreen()">Back</button>
    </div>
  `;
}

// Initialize the app
function init() {
  const user = localStorage.getItem('currentUser');
  if (user) {
    currentUser = JSON.parse(user);
    renderGroupsScreen();
  } else {
    renderLoginScreen();
  }
}

init();
