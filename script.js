console.log("✅ script.js loaded");
const app = document.getElementById('app');
const socket = io(); // Connect to server

let currentUser = null;
let users = JSON.parse(localStorage.getItem('users') || '[]');
let groups = JSON.parse(localStorage.getItem('groups') || '[]');

// SOCKET LISTENER
socket.on('buzzed', data => {
  if (currentUser && currentUser.phone === data.to) {
    playBuzzSound();
    alert('You got buzzed!');
  }
});

// BUZZ SOUND
function playBuzzSound() {
  const sound = document.getElementById('buzz-sound');
  sound.play();
}

// LOGIN PAGE
function renderLogin() {
  app.innerHTML = `
    <div class="container">
      <h2>BUZZUR</h2>
      <input type="tel" id="login-phone" placeholder="Phone Number">
      <input type="password" id="login-password" placeholder="Password">
      <button onclick="login()">Login</button>
      <div class="link-row">
        <span onclick="renderSignup()">Sign Up</span>
        <span onclick="alert('Reset password coming soon')">Forgot Password</span>
      </div>
    </div>
  `;
}

// SIGNUP PAGE
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
      <div class="link-row">
        <span onclick="renderLogin()">Back to Login</span>
      </div>
    </div>
  `;
}

// DASHBOARD
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

// AUTH
function login() {
  const phone = document.getElementById('login-phone').value.trim();
  const pass = document.getElementById('login-password').value.trim();
  const user = users.find(u => u.phone === phone && u.password === pass);
  if (user) {
    currentUser = user;
    renderDashboard();
  } else {
    alert('Invalid login');
  }
}

function signup() {
  const name = document.getElementById('signup-name').value.trim();
  const phone = document.getElementById('signup-phone').value.trim();
  const pw = document.getElementById('signup-password').value;
  const confirm = document.getElementById('signup-confirm').value;
  if (!name || !phone || !pw || !confirm) return alert('Please fill in all fields');
  if (pw !== confirm) return alert('Passwords do not match');
  if (users.find(u => u.phone === phone)) return alert('Phone already registered');
  users.push({ name, phone, password: pw });
  localStorage.setItem('users', JSON.stringify(users));
  alert('Signup successful');
  renderLogin();
}

function logout() {
  currentUser = null;
  renderLogin();
}

function togglePassword() {
  const pw = document.getElementById('signup-password');
  const confirm = document.getElementById('signup-confirm');
  const type = pw.type === 'password' ? 'text' : 'password';
  pw.type = type;
  confirm.type = type;
}

// GROUPS
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

function renderGroups() {
  const container = document.getElementById('groups-container');
  container.innerHTML = '';
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

function renameGroup(id, name) {
  const group = groups.find(g => g.id === id);
  if (group) {
    group.name = name;
    localStorage.setItem('groups', JSON.stringify(groups));
  }
}

function deleteGroup(id) {
  groups = groups.filter(g => g.id !== id);
  localStorage.setItem('groups', JSON.stringify(groups));
  renderGroups();
}

// MEMBERS
function renderMembers(groupId) {
  const group = groups.find(g => g.id === groupId);
  const container = document.getElementById(`members-${groupId}`);
  container.innerHTML = '';
  group.members.forEach((member, index) => {
    const div = document.createElement('div');
    div.className = 'member';
    div.innerHTML = `
      <input type="text" value="${member.name}" onchange="updateMember('${groupId}', ${index}, 'name', this.value)">
      <input type="tel" value="${member.phone}" onchange="updateMember('${groupId}', ${index}, 'phone', this.value)">
      <input type="checkbox" id="select-${groupId}-${index}">
      <button onclick="removeMember('${groupId}', ${index})">Remove</button>
    `;
    container.appendChild(div);
  });
}

function addMember(groupId) {
  const group = groups.find(g => g.id === groupId);
  group.members.push({ name: '', phone: '' });
  localStorage.setItem('groups', JSON.stringify(groups));
  renderMembers(groupId);
}

function removeMember(groupId, index) {
  const group = groups.find(g => g.id === groupId);
  group.members.splice(index, 1);
  localStorage.setItem('groups', JSON.stringify(groups));
  renderMembers(groupId);
}

function updateMember(groupId, index, field, value) {
  const group = groups.find(g => g.id === groupId);
  group.members[index][field] = value;
  localStorage.setItem('groups', JSON.stringify(groups));
}

// BUZZ
function buzzSelected(groupId) {
  const group = groups.find(g => g.id === groupId);
  group.members.forEach((member, index) => {
    const checkbox = document.getElementById(`select-${groupId}-${index}`);
    if (checkbox.checked) {
      socket.emit('buzz', { to: member.phone });
    }
  });
}

function buzzAll(groupId) {
  const group = groups.find(g => g.id === groupId);
  group.members.forEach(member => {
    socket.emit('buzz', { to: member.phone });
  });
}

// START
renderLogin();
