const app = document.getElementById('app');
let currentUser = null;
let groups = JSON.parse(localStorage.getItem('buzzerGroups') || '[]');
let users = JSON.parse(localStorage.getItem('buzzerUsers') || '[]');

// Connect to deployed Socket.IO server
const socket = io('https://buzzur-server.onrender.com');

// Handle incoming buzz
const buzzAudio = document.getElementById('buzz-audio');
socket.on('buzz', () => {
  buzzAudio?.play().catch(err => console.warn('Audio play failed:', err));
});

// Show Login
function showLogin() {
  app.innerHTML = `
    <div class="container">
      <div class="banner">Login</div>
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

// Show Signup
function showSignup() {
  app.innerHTML = `
    <div class="container">
      <div class="banner">Signup</div>
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

function togglePasswordVisibility() {
  const passwordField = document.getElementById('password');
  const confirmField = document.getElementById('confirmPassword');
  const isVisible = document.getElementById('showPassword').checked;
  passwordField.type = confirmField.type = isVisible ? 'text' : 'password';
}

// Forgot Password
function showForgotPassword() {
  app.innerHTML = `
    <div class="container">
      <div class="banner">Forgot Password</div>
      <input type="text" id="phone" placeholder="Phone Number">
      <button onclick="resetPassword()">Reset Password</button>
      <p>Remembered your password? <a href="#" onclick="showLogin()">Login</a></p>
    </div>
  `;
}

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

// Login
function login() {
  const phone = document.getElementById('phone').value.trim();
  const password = document.getElementById('password').value.trim();
  const user = users.find(u => u.phone === phone && u.password === password);
  if (!user) return alert('Invalid credentials');
  currentUser = user;
  showGroups();
}

// Signup
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

function logout() {
  currentUser = null;
  showLogin();
}

// Show groups
function showGroups() {
  const userGroups = groups.filter(g => g.owner === currentUser.phone);
  app.innerHTML = `
    <div class="container">
      <div class="banner">My Groups</div>
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

// Create group
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
      <div class="banner">Edit Group: ${group.name}</div>
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

function updateGroupName(oldName) {
  const newName = document.getElementById('newGroupName').value.trim();
  const group = groups.find(g => g.name === oldName && g.owner === currentUser.phone);
  if (group && newName && newName !== oldName) {
    group.name = newName;
    saveGroups();
    showGroups();
  }
}

function addMember(groupName) {
  const group = groups.find(g => g.name === groupName && g.owner === currentUser.phone);
  if (!group) return;

  const name = prompt('Member name:')?.trim();
  const phone = prompt('Member phone:')?.trim();
  if (!name || !phone) return;

  group.members.push({ name, phone });
  saveGroups();
  editGroup(groupName);
}

function updateMember(groupName, index, field, value) {
  const group = groups.find(g => g.name === groupName && g.owner === currentUser.phone);
  if (group?.members[index]) {
    group.members[index][field] = value.trim();
    saveGroups();
  }
}

function removeMember(groupName, index) {
  const group = groups.find(g => g.name === groupName && g.owner === currentUser.phone);
  if (!group) return;
  group.members.splice(index, 1);
  saveGroups();
  editGroup(groupName);
}

function removeGroup(name) {
  groups = groups.filter(g => !(g.name === name && g.owner === currentUser.phone));
  saveGroups();
  showGroups();
}

function buzzAll(groupName) {
  const group = groups.find(g => g.name === groupName);
  if (!group) return;
  sendBuzz(group.members.map(m => m.phone), group.name);
}

function buzzSelected(groupName) {
  const group = groups.find(g => g.name === groupName);
  if (!group) return;

  const selected = Array.from(document.querySelectorAll('.select-member:checked'))
    .map(cb => group.members[cb.dataset.index]?.phone)
    .filter(Boolean);

  if (selected.length === 0) return alert('No members selected');
  sendBuzz(selected, group.name);
}

function sendBuzz(toPhones, groupName) {
  const payload = {
    to: toPhones,
    from: currentUser.phone,
    group: groupName
  };

  socket.emit('buzz', payload);

  fetch('https://buzzur-server.onrender.com/send-buzz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(() => alert('Buzz was sent!'))
  .catch(err => {
    console.error('Buzz error:', err);
    alert('Failed to send buzz');
  });
}

function saveGroups() {
  localStorage.setItem('buzzerGroups', JSON.stringify(groups));
}

showLogin();
