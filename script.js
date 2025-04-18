// script.js
const app = document.getElementById('app');
const socket = io("https://buzzur-server.onrender.com"); // Ensure this matches your backend URL
let currentUser = null;
let groups = JSON.parse(localStorage.getItem('groups') || '[]');
let users = JSON.parse(localStorage.getItem('users') || '[]');

// Show the login page
function renderLogin() {
  app.innerHTML = `
    <div class="container">
      <h2>BUZZUR</h2>
      <input type="tel" id="login-phone" placeholder="Phone Number">
      <input type="password" id="login-password" placeholder="Password">
      <button onclick="login()">Login</button>
      <div class="link-row">
        <span onclick="renderSignup()">Sign Up</span>
        <span onclick="alert('Reset password coming soon')">Reset Password</span>
      </div>
    </div>
  `;
}

// Show the signup page
function renderSignup() {
  app.innerHTML = `
    <div class="container">
      <h2>Sign Up</h2>
      <input type="text" id="signup-name" placeholder="Name">
      <input type="tel" id="signup-phone" placeholder="Phone Number">
      <input type="password" id="signup-password" placeholder="Password">
      <input type="password" id="signup-confirm" placeholder="Confirm Password">
      <label><input type="checkbox" onclick="togglePassword()"> Show Password</label>
      <button onclick="signup()">Sign Up</button>
      <div class="link-row"><span onclick="renderLogin()">Back to Login</span></div>
    </div>
  `;
}

// Show the dashboard (My Groups page)
function renderDashboard() {
  app.innerHTML = `
    <div class="container">
      <h2>My Groups</h2>
      <button onclick="createGroup()">Create Group</button>
      <div id="groups-container"></div>
      <button onclick="logout()">Logout</button>
    </div>
  `;
  renderGroups();
}

// Render the list of groups the user is in
function renderGroups() {
  const container = document.getElementById('groups-container');
  if (!container) return;
  container.innerHTML = '';  // Clear existing content
  groups.filter(g => g.owner === currentUser.phone).forEach(group => {
    const div = document.createElement('div');
    div.className = 'group-card';
    div.innerHTML = `
      <input type="text" value="${group.name}" onchange="renameGroup('${group.id}', this.value)">
      <div id="members-${group.id}"></div>
      <div class="actions">
        <button onclick="addMember('${group.id}')">Add Member</button>
        <button onclick="buzzSelected('${group.id}')">Buzz Selected</button>
        <button onclick="buzzAll('${group.id}')">Buzz All</button>
        <button onclick="deleteGroup('${group.id}')">Delete</button>
      </div>
    `;
    container.appendChild(div);
    renderMembers(group.id);
  });
}

// Render the members of a group
function renderMembers(groupId) {
  const group = groups.find(g => g.id === groupId);
  const container = document.getElementById(`members-${groupId}`);
  container.innerHTML = '';
  group.members.forEach((member, index) => {
    const row = document.createElement('div');
    row.className = 'member-inputs';
    row.innerHTML = `
      <input type="checkbox" data-index="${index}">
      <input type="text" value="${member.name}" onchange="updateMember('${groupId}', ${index}, 'name', this.value)">
      <input type="tel" value="${member.phone}" onchange="updateMember('${groupId}', ${index}, 'phone', this.value)">
      <button onclick="removeMember('${groupId}', ${index})">Remove</button>
    `;
    container.appendChild(row);
  });
}

// Handle the login process
function login() {
  const phone = document.getElementById('login-phone').value;
  const password = document.getElementById('login-password').value;
  const user = users.find(u => u.phone === phone && u.password === password);
  if (user) {
    currentUser = user;
    renderDashboard();
  } else {
    alert('Invalid credentials');
  }
}

// Handle the signup process
function signup() {
  const name = document.getElementById('signup-name').value;
  const phone = document.getElementById('signup-phone').value;
  const pw = document.getElementById('signup-password').value;
  const confirm = document.getElementById('signup-confirm').value;
  if (pw !== confirm) return alert("Passwords don't match");
  const newUser = { name, phone, password: pw };
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  alert('Signup successful');
  renderLogin();
}

// Logout the current user and return to the login screen
function logout() {
  currentUser = null;
  renderLogin();
}

// Toggle the password visibility
function togglePassword() {
  const pw = document.getElementById('signup-password');
  const confirm = document.getElementById('signup-confirm');
  const type = pw.type === 'password' ? 'text' : 'password';
  pw.type = type;
  confirm.type = type;
}

// Create a new group
function createGroup() {
  const name = prompt('Group name?');
  if (!name) return;
  const group = {
    id: Date.now().toString(),
    name,
    owner: currentUser.phone,
    members: []
  };
  groups.push(group);
  localStorage.setItem('groups', JSON.stringify(groups));
  renderGroups();
}

// Rename a group
function renameGroup(id, newName) {
  const group = groups.find(g => g.id === id);
  group.name = newName;
  localStorage.setItem('groups', JSON.stringify(groups));
}

// Delete a group
function deleteGroup(id) {
  groups = groups.filter(g => g.id !== id);
  localStorage.setItem('groups', JSON.stringify(groups));
  renderGroups();
}

// Add a new member to the group
function addMember(groupId) {
  const group = groups.find(g => g.id === groupId);
  group.members.push({ name: '', phone: '' });
  localStorage.setItem('groups', JSON.stringify(groups));
  renderMembers(groupId);
}

// Remove a member from the group
function removeMember(groupId, index) {
  const group = groups.find(g => g.id === groupId);
  group.members.splice(index, 1);
  localStorage.setItem('groups', JSON.stringify(groups));
  renderMembers(groupId);
}

// Update member details (name or phone)
function updateMember(groupId, index, field, value) {
  const group = groups.find(g => g.id === groupId);
  group.members[index][field] = value;
  localStorage.setItem('groups', JSON.stringify(groups));
}

// Buzz selected members in the group
function buzzSelected(groupId) {
  const checkboxes = document.querySelectorAll(`#members-${groupId} input[type='checkbox']`);
  const group = groups.find(g => g.id === groupId);
  const selected = [];
  checkboxes.forEach((box, i) => {
    if (box.checked) selected.push(group.members[i]);
  });
  if (selected.length) socket.emit('buzz', { groupId, members: selected });
}

// Buzz all members in the group
function buzzAll(groupId) {
  const group = groups.find(g => g.id === groupId);
  socket.emit('buzz', { groupId, members: group.members });
}

// Listen for the "buzzed" event from the server to play a sound
socket.on('buzzed', data => {
  const sound = document.getElementById('buzz-sound');
  sound.play();
});

// Initial page load - render login screen
renderLogin();
