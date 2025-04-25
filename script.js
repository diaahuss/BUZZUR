const app = document.getElementById('app');
let currentUser = null;
let groups = JSON.parse(localStorage.getItem('buzzerGroups') || '[]');
let users = JSON.parse(localStorage.getItem('buzzerUsers') || '[]');

// Connect to deployed Socket.IO server
const socket = io('https://buzzur-server.onrender.com');

// Log socket connection for debugging
socket.on('connect', () => {
  console.log('Connected to server via Socket.IO');
});

// Handle incoming buzz
const buzzAudio = document.getElementById('buzz-audio');
socket.on('buzz', () => {
  buzzAudio?.play().catch(err => console.warn('Audio play failed:', err));
});

// Render banner helper function
function renderBanner(title) {
  return `<div class="banner" style="max-width: 400px; margin: 0 auto;">${title}</div>`;
}

// Show login screen
function showLogin() {
  app.innerHTML = `
    <div class="container">
      ${renderBanner('Login')}
      <input type="text" id="phone" placeholder="Phone Number">
      <input type="password" id="password" placeholder="Password">
      <button onclick="login()">Login</button>
      <div class="link-row">
        <p><a href="#" onclick="showForgotPassword()">Forgot Password?</a></p>
        <p><a href="#" class="signup-link" onclick="showSignup()">Sign Up</a></p>
      </div>
    </div>
  `;
}

// Show signup screen
function showSignup() {
  app.innerHTML = `
    <div class="container">
      ${renderBanner('Signup')}
      <input type="text" id="name" placeholder="Name">
      <input type="text" id="phone" placeholder="Phone Number">
      <input type="password" id="password" placeholder="Password">
      <input type="password" id="confirmPassword" placeholder="Confirm Password">
      <label class="show-password">
        <input type="checkbox" id="showPassword"> Show Password
      </label>
      <button onclick="signup()">Sign Up</button>
      <p>Already have an account? <a href="#" onclick="showLogin()">Login</a></p>
    </div>
  `;
  document.getElementById('showPassword').addEventListener('change', togglePasswordVisibility);
}

// Toggle password visibility
function togglePasswordVisibility() {
  const passwordField = document.getElementById('password');
  const confirmPasswordField = document.getElementById('confirmPassword');
  const isChecked = document.getElementById('showPassword').checked;
  passwordField.type = isChecked ? 'text' : 'password';
  confirmPasswordField.type = isChecked ? 'text' : 'password';
}

// Show forgot password screen
function showForgotPassword() {
  app.innerHTML = `
    <div class="container">
      ${renderBanner('Forgot Password')}
      <input type="text" id="phone" placeholder="Phone Number">
      <button onclick="resetPassword()">Reset Password</button>
      <p>Remembered your password? <a href="#" onclick="showLogin()">Login</a></p>
    </div>
  `;
}

// Reset password
function resetPassword() {
  const phone = document.getElementById('phone').value.trim();
  const user = users.find(u => u.phone === phone);
  if (!user) return alert('User not found');

  const newPassword = prompt('Enter new password');
  if (newPassword?.trim()) {
    user.password = newPassword.trim();
    localStorage.setItem('buzzerUsers', JSON.stringify(users));
    alert('Password reset successfully.');
    showLogin();
  }
}

// Login function
function login() {
  const phone = document.getElementById('phone').value.trim();
  const password = document.getElementById('password').value.trim();
  const user = users.find(u => u.phone === phone && u.password === password);
  if (!user) return alert('Invalid credentials');
  currentUser = user;
  showGroups();
}

// Signup function
function signup() {
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const password = document.getElementById('password').value.trim();
  const confirmPassword = document.getElementById('confirmPassword').value.trim();

  if (!name || !phone || !password || !confirmPassword)
    return alert('Please fill all fields.');

  if (password !== confirmPassword)
    return alert('Passwords do not match.');

  if (users.some(u => u.phone === phone))
    return alert('User already exists.');

  users.push({ name, phone, password });
  localStorage.setItem('buzzerUsers', JSON.stringify(users));
  alert('Signup successful!');
  showLogin();
}

// Logout function
function logout() {
  currentUser = null;
  showLogin();
}

// Show groups screen
function showGroups() {
  const userGroups = groups.filter(g => g.owner === currentUser.phone);
  app.innerHTML = `
    <div class="container">
      ${renderBanner('My Groups')}
      ${userGroups.map(g => `
        <div class="group-section">
          <b>${g.name}</b><br>
          <button onclick="editGroup('${g.name}')">Edit</button>
          <button onclick="removeGroup('${g.name}')">Remove</button>
          <button onclick="buzzAll('${g.name}')">Buzz All</button>
        </div>
      `).join('')}
      <button onclick="createGroup()">Create New Group</button>
      <button class="logout-button" onclick="logout()">Logout</button>
    </div>
  `;
}

// Create new group
function createGroup() {
  const name = prompt('Group name:')?.trim();
  if (!name) return;
  groups.push({ name, members: [], owner: currentUser.phone });
  saveGroups();
  showGroups();
}

// Edit group
function editGroup(name) {
  const group = groups.find(g => g.name === name && g.owner === currentUser.phone);
  if (!group) return;

  const membersList = group.members.map((m, i) => `
    <div class="member-entry">
      <input value="${m.name}" onchange="updateMember('${name}', ${i}, 'name', this.value)">
      <input value="${m.phone}" onchange="updateMember('${name}', ${i}, 'phone', this.value)">
      <input type="checkbox" class="select-member" data-index="${i}"> Select
      <button onclick="removeMember('${name}', ${i})">Remove</button>
    </div>
  `).join('');

  app.innerHTML = `
    <div class="container">
      ${renderBanner(`Edit Group: ${group.name}`)}
      <input type="text" id="newGroupName" value="${group.name}">
      <button onclick="updateGroupName('${name}')">Update Group Name</button>
      ${membersList}
      <button onclick="addMember('${name}')">Add Member</button>
      <button onclick="removeGroup('${name}')">Remove Group</button>
      <button onclick="buzzSelected('${name}')">Buzz Selected</button>
      <button onclick="showGroups()">Back</button>
      <button class="logout-button" onclick="logout()">Logout</button>
    </div>
  `;
}

// Update group name
function updateGroupName(oldName) {
  const newName = document.getElementById('newGroupName').value.trim();
  const group = groups.find(g => g.name === oldName && g.owner === currentUser.phone);
  if (group && newName && newName !== oldName) {
    group.name = newName;
    saveGroups();
    showGroups();
  }
}

// Add member to group
function addMember(groupName) {
  const name = prompt('Enter member name:');
  const phone = prompt('Enter member phone:');
  if (!name || !phone) return;

  const group = groups.find(g => g.name === groupName && g.owner === currentUser.phone);
  if (!group) return;

  group.members.push({ name, phone });
  saveGroups();
  editGroup(groupName);
}

// Remove member from group
function removeMember(groupName, index) {
  const group = groups.find(g => g.name === groupName && g.owner === currentUser.phone);
  if (!group || !group.members[index]) return;

  group.members.splice(index, 1);
  saveGroups();
  editGroup(groupName);
}

// Save groups to localStorage
function saveGroups() {
  localStorage.setItem('buzzerGroups', JSON.stringify(groups));
}

// Remove group
function removeGroup(groupName) {
  groups = groups.filter(g => g.name !== groupName || g.owner !== currentUser.phone);
  saveGroups();
  showGroups();
}

// Buzz all members of a group
function buzzAll(groupName) {
  const group = groups.find(g => g.name === groupName && g.owner === currentUser.phone);
  if (group) socket.emit('buzz', { groupName, allMembers: true });
}

// Buzz selected members of a group
function buzzSelected(groupName) {
  const group = groups.find(g => g.name === groupName && g.owner === currentUser.phone);
  if (group) {
    const selectedMembers = group.members.filter((m, index) => document.querySelector(`.select-member[data-index="${index}"]`).checked);
    if (selectedMembers.length > 0) {
      socket.emit('buzz', { groupName, selectedMembers });
    }
  }
}
