const app = document.getElementById('app');
const socket = io(); // Connects to the server that served the page
let currentUser = null;
let groups = JSON.parse(localStorage.getItem('groups') || '[]');
let users = JSON.parse(localStorage.getItem('users') || '[]');

// Pages
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

// Logic
function login() {
  const phone = document.getElementById('login-phone').value;
  const pass = document.getElementById('login-password').value;
  const user = users.find(u => u.phone === phone && u.password === pass);
  if (user) {
    currentUser = user;
    renderDashboard();
  } else {
    alert('Invalid login');
  }
}

function signup() {
  const name = document.getElementById('signup-name').value;
  const phone = document.getElementById('signup-phone').value;
  const pw = document.getElementById('signup-password').value;
  const confirm = document.getElementById('signup-confirm').value;
  if (pw !== confirm) return alert('Passwords do not match');
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
  group.name = name;
  localStorage.setItem('groups', JSON.stringify(groups));
}

function deleteGroup(id) {
  groups = groups.filter(g => g.id !== id);
  localStorage.setItem('groups', JSON.stringify(groups));
  renderGroups();
}

function renderMembers(groupId) {
  const group = groups.find(g => g.id === groupId);
  const container = document.getElementById(`members-${groupId}`);
  container.innerHTML = '';
  group.members.forEach((member, index) => {
    const div = document.createElement('div');
    div.className = 'member-row';
    div.innerHTML = `
      <input type="text" value="${member.name}" onchange="updateMemberName('${groupId}', ${index}, this.value)">
      <input type="tel" value="${member.phone}" onchange="updateMemberPhone('${groupId}', ${index}, this.value)">
      <input type="checkbox" id="select-${groupId}-${index}">
      <button onclick="removeMember('${groupId}', ${index})">Remove</button>
    `;
    container.appendChild(div);
  });
}

function addMember(groupId) {
  const name = prompt('Member name?');
  const phone = prompt('Phone number?');
  if (!name || !phone) return;
  const group = groups.find(g => g.id === groupId);
  group.members.push({ name, phone });
  localStorage.setItem('groups', JSON.stringify(groups));
  renderMembers(groupId);
}

function removeMember(groupId, index) {
  const group = groups.find(g => g.id === groupId);
  group.members.splice(index, 1);
  localStorage.setItem('groups', JSON.stringify(groups));
  renderMembers(groupId);
}

function updateMemberName(groupId, index, value) {
  const group = groups.find(g => g.id === groupId);
  group.members[index].name = value;
  localStorage.setItem('groups', JSON.stringify(groups));
}

function updateMemberPhone(groupId, index, value) {
  const group = groups.find(g => g.id === groupId);
  group.members[index].phone = value;
  localStorage.setItem('groups', JSON.stringify(groups));
}

function buzzSelected(groupId) {
  const group = groups.find(g => g.id === groupId);
  const selected = group.members.filter((_, i) => document.getElementById(`select-${groupId}-${i}`).checked);
  if (selected.length === 0) return alert('No members selected');
  selected.forEach(member => {
    socket.emit('buzz', { to: member.phone });
  });
  playBuzzSound();
}

function buzzAll(groupId) {
  const group = groups.find(g => g.id === groupId);
  group.members.forEach(member => {
    socket.emit('buzz', { to: member.phone });
  });
  playBuzzSound();
}

// Play buzz sound
function playBuzzSound() {
  const audio = document.getElementById('buzz-sound');
  if (audio) audio.play();
}

// Listen for buzzes sent to this user
socket.on('buzzed', data => {
  if (currentUser && currentUser.phone === data.to) {
    playBuzzSound();
    alert('You got buzzed!');
  }
});
