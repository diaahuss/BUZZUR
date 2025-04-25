const app = document.getElementById('app');
let currentUser = null;
let groups = JSON.parse(localStorage.getItem('buzzerGroups') || '[]');
let users = JSON.parse(localStorage.getItem('buzzerUsers') || '[]');

<<<<<<< HEAD
// Connect to the backend via Socket.IO
const socket = io();  // Ensure the backend server is running and accessible

// Function to show the login screen
function showLogin() {
  app.innerHTML = `
    <div class="container">
      <div class="banner">Login</div>
      <input type="text" id="phone" placeholder="Phone Number">
      <input type="password" id="password" placeholder="Password">
      <button onclick="login()">Login</button>
      <p>Don't have an account? <a href="#" onclick="showSignup()">Sign up</a></p>
      <p><a href="#" onclick="showForgotPassword()">Forgot Password?</a></p>
=======
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

function renderBanner(title) {
  return `<div class="banner" style="max-width: 400px; margin: 0 auto;">${title}</div>`;
}

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
>>>>>>> 1e57d4453086b558bb8a04ff23f32cafb32750b8
    </div>
  `;
}

<<<<<<< HEAD
// Function to show the signup screen
function showSignup() {
  app.innerHTML = `
    <div class="container">
      <div class="banner">Signup</div>
=======
function showSignup() {
  app.innerHTML = `
    <div class="container">
      ${renderBanner('Signup')}
>>>>>>> 1e57d4453086b558bb8a04ff23f32cafb32750b8
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
<<<<<<< HEAD
  
  document.getElementById('showPassword').addEventListener('change', togglePasswordVisibility);
}

// Function to toggle password visibility
function togglePasswordVisibility() {
  const passwordField = document.getElementById('password');
  const confirmPasswordField = document.getElementById('confirmPassword');
  const isChecked = document.getElementById('showPassword').checked;
  passwordField.type = isChecked ? 'text' : 'password';
  confirmPasswordField.type = isChecked ? 'text' : 'password';
}

// Function to show the forgot password screen
function showForgotPassword() {
  app.innerHTML = `
    <div class="container">
      <div class="banner">Forgot Password</div>
=======
  document.getElementById('showPassword').addEventListener('change', togglePasswordVisibility);
}

function togglePasswordVisibility() {
  const passwordField = document.getElementById('password');
  const confirmField = document.getElementById('confirmPassword');
  const isVisible = document.getElementById('showPassword').checked;
  passwordField.type = confirmField.type = isVisible ? 'text' : 'password';
}

function showForgotPassword() {
  app.innerHTML = `
    <div class="container">
      ${renderBanner('Forgot Password')}
>>>>>>> 1e57d4453086b558bb8a04ff23f32cafb32750b8
      <input type="text" id="phone" placeholder="Phone Number">
      <button onclick="resetPassword()">Reset Password</button>
      <p>Remembered your password? <a href="#" onclick="showLogin()">Login</a></p>
    </div>
  `;
}

<<<<<<< HEAD
// Function to reset the password
function resetPassword() {
  const phone = document.getElementById('phone').value;
  const user = users.find(u => u.phone === phone);
  if (user) {
    const newPassword = prompt('Enter a new password');
    user.password = newPassword;
    localStorage.setItem('buzzerUsers', JSON.stringify(users));
    alert('Password reset successful');
    showLogin();
  } else {
    alert('User not found');
  }
}

// Function to login the user
function login() {
  const phone = document.getElementById('phone').value;
  const password = document.getElementById('password').value;
  const user = users.find(u => u.phone === phone && u.password === password);
  if (user) {
    currentUser = user;
    showGroups();
  } else {
    alert('Invalid login');
  }
}

// Function to signup the user
function signup() {
  const name = document.getElementById('name').value;
  const phone = document.getElementById('phone').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (password !== confirmPassword) {
    alert('Passwords do not match');
    return;
  }

  if (users.find(u => u.phone === phone)) {
    alert('User already exists');
    return;
  }

  const newUser = { name, phone, password };
  users.push(newUser);
  localStorage.setItem('buzzerUsers', JSON.stringify(users));
  alert('Signup successful');
  showLogin();
}

// Function to logout the user
=======
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

function login() {
  const phone = document.getElementById('phone').value.trim();
  const password = document.getElementById('password').value.trim();
  const user = users.find(u => u.phone === phone && u.password === password);
  if (!user) return alert('Invalid credentials');
  currentUser = user;
  showGroups();
}

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

>>>>>>> 1e57d4453086b558bb8a04ff23f32cafb32750b8
function logout() {
  currentUser = null;
  showLogin();
}

<<<<<<< HEAD
// Function to show groups
=======
>>>>>>> 1e57d4453086b558bb8a04ff23f32cafb32750b8
function showGroups() {
  const userGroups = groups.filter(g => g.owner === currentUser.phone);
  app.innerHTML = `
    <div class="container">
<<<<<<< HEAD
      <div class="banner">My Groups</div>
=======
      ${renderBanner('My Groups')}
>>>>>>> 1e57d4453086b558bb8a04ff23f32cafb32750b8
      ${userGroups.map(g => `
        <div class="group-section">
          <b>${g.name}</b><br>
          <button onclick="editGroup('${g.name}')">Edit</button>
          <button onclick="removeGroup('${g.name}')">Remove</button>
          <button onclick="buzzAll('${g.name}')">Buzz All</button>
        </div>
      `).join('')}
      <button onclick="createGroup()">Create New Group</button>
<<<<<<< HEAD
      <button onclick="logout()">Logout</button>
=======
      <button class="logout-button" onclick="logout()">Logout</button>
>>>>>>> 1e57d4453086b558bb8a04ff23f32cafb32750b8
    </div>
  `;
}

<<<<<<< HEAD
// Function to create a new group
function createGroup() {
  const groupName = prompt('Enter group name:');
  if (!groupName) return;
  const newGroup = { name: groupName, members: [], owner: currentUser.phone };
  groups.push(newGroup);
=======
function createGroup() {
  const name = prompt('Group name:')?.trim();
  if (!name) return;
  groups.push({ name, members: [], owner: currentUser.phone });
>>>>>>> 1e57d4453086b558bb8a04ff23f32cafb32750b8
  saveGroups();
  showGroups();
}

<<<<<<< HEAD
// Function to edit a group
function editGroup(name) {
  const group = groups.find(g => g.name === name && g.owner === currentUser.phone);
  if (!group) return;
  
  let membersList = group.members.map((m, i) => `
    <div>
      <input value="${m.name}" onchange="updateMember(${i}, 'name', this.value)">
      <input value="${m.phone}" onchange="updateMember(${i}, 'phone', this.value)">
      <input type="checkbox" class="select-member" data-index="${i}"> Select
      <button onclick="removeMember(${i})">Remove Member</button>
=======
function editGroup(name) {
  const group = groups.find(g => g.name === name && g.owner === currentUser.phone);
  if (!group) return;

  const membersList = group.members.map((m, i) => `
    <div class="member-entry">
      <input value="${m.name}" onchange="updateMember('${name}', ${i}, 'name', this.value)">
      <input value="${m.phone}" onchange="updateMember('${name}', ${i}, 'phone', this.value)">
      <input type="checkbox" class="select-member" data-index="${i}"> Select
      <button onclick="removeMember('${name}', ${i})">Remove</button>
>>>>>>> 1e57d4453086b558bb8a04ff23f32cafb32750b8
    </div>
  `).join('');

  app.innerHTML = `
    <div class="container">
<<<<<<< HEAD
      <div class="banner">Edit Group: ${group.name}</div>
      <input type="text" id="newGroupName" placeholder="New Group Name" value="${group.name}">
      <button onclick="updateGroupName('${group.name}')">Update Group Name</button>
      ${membersList}
      <button onclick="addMember('${group.name}')">Add Member</button>
      <button onclick="removeGroup('${group.name}')">Remove Group</button>
      <button onclick="buzzSelected('${group.name}')">Buzz Selected Members</button>
      <button onclick="showGroups()">Back</button>
      <button onclick="logout()">Logout</button>
    </div>
  `;
  window.editingGroup = group;
}

// Function to update group name
function updateGroupName(oldName) {
  const newName = document.getElementById('newGroupName').value;
  if (newName && newName !== oldName) {
    window.editingGroup.name = newName;
=======
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

function updateGroupName(oldName) {
  const newName = document.getElementById('newGroupName').value.trim();
  const group = groups.find(g => g.name === oldName && g.owner === currentUser.phone);
  if (group && newName && newName !== oldName) {
    group.name = newName;
>>>>>>> 1e57d4453086b558bb8a04ff23f32cafb32750b8
    saveGroups();
    showGroups();
  }
}

<<<<<<< HEAD
// Function to add a member to a group
function addMember(groupName) {
  const name = prompt('Member name:');
  const phone = prompt('Member phone:');
  if (name && phone) {
    window.editingGroup.members.push({ name, phone });
    saveGroups();
    editGroup(groupName);
  }
}

// Function to remove a member from a group
function removeMember(index) {
  window.editingGroup.members.splice(index, 1);
  saveGroups();
  editGroup(window.editingGroup.name);
}

// Function to remove a group
function removeGroup(name) {
  const groupIndex = groups.findIndex(g => g.name === name && g.owner === currentUser.phone);
  if (groupIndex > -1) {
    groups.splice(groupIndex, 1);
    saveGroups();
    showGroups();
  }
}

// Function to buzz all members in a group
function buzzAll(groupName) {
  const group = groups.find(g => g.name === groupName);
  if (!group) return;

  // Emit a 'buzz' event for all members in the group
  socket.emit('buzz', { groupName, members: group.members });

  // Listen for the server confirmation
  socket.on('buzzSent', (response) => {
    alert(`Buzz sent to all members: ${group.members.map(m => m.name).join(', ')}`);
  });
}

// Function to buzz selected members in a group
=======
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
  const group = groups.find(g => g.name === groupName && g.owner === currentUser.phone);
  if (group) {
    socket.emit('buzz', group.members);
  }
}

>>>>>>> 1e57d4453086b558bb8a04ff23f32cafb32750b8
function buzzSelected(groupName) {
  const group = groups.find(g => g.name === groupName && g.owner === currentUser.phone);
  if (!group) return;

<<<<<<< HEAD
<<<<<<< HEAD
  const selectedMembers = Array.from(document.querySelectorAll('.select-member:checked'))
    .map(checkbox => group.members[checkbox.dataset.index].name);

  if (selectedMembers.length === 0) {
    alert('No members selected');
    return;
  }

  // Emit a 'buzz' event for selected members
  socket.emit('buzz', { groupName, members: selectedMembers });

  // Listen for the server confirmation
  socket.on('buzzSent', (response) => {
    alert(`Buzz sent to selected members: ${selectedMembers.join(', ')}`);
  });
}

// Function to save groups to localStorage
=======
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
=======
  const selectedMembers = [...document.querySelectorAll('.select-member:checked')].map(checkbox => {
    const index = checkbox.dataset.index;
    return group.members[index];
>>>>>>> 2fb01014207b83b4c48b14c95ecd9a767bfcfe8e
  });

  if (selectedMembers.length) {
    socket.emit('buzz', selectedMembers);
  }
}

>>>>>>> 1e57d4453086b558bb8a04ff23f32cafb32750b8
function saveGroups() {
  localStorage.setItem('buzzerGroups', JSON.stringify(groups));
}

<<<<<<< HEAD
<<<<<<< HEAD
// Initialize the app
=======
>>>>>>> 1e57d4453086b558bb8a04ff23f32cafb32750b8
showLogin();
=======
showLogin(); // Start with the login view
>>>>>>> 2fb01014207b83b4c48b14c95ecd9a767bfcfe8e
