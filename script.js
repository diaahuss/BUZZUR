const app = document.getElementById('app');
const socket = io('https://your-app-name.onrender.com'); // Replace with your actual Render app URL

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

function renderMembers(groupId) {
  const group = groups.find(g => g.id === groupId);
  const container = document.getElementById(`members-${groupId}`);
  container.innerHTML = '';
  group.members.forEach((member, index) => {
    const row = document.createElement('div');
    row.className = 'member-inputs';
    row.innerHTML = `
      <input type="text" value="${member.name}" placeholder="Name" 
        onchange="updateMember('${groupId}', ${index}, 'name', this.value)">
      <input type="tel" value="${member.phone}" placeholder="Phone" 
        onchange="updateMember('${groupId}', ${index}, 'phone', this.value)">
      <input type="checkbox" data-index="${index}">
      <button onclick="removeMember('${groupId}', ${index})">Remove</button>
    `;
    container.appendChild(row);
  });
}

function buzzSelected(groupId) {
  const checkboxes = document.querySelectorAll(`#members-${groupId} input[type="checkbox"]`);
  const group = groups.find(g => g.id === groupId);
  const selected = [];
  checkboxes.forEach((box, i) => {
    if (box.checked) selected.push(group.members[i]);
  });
  if (selected.length) {
    socket.emit("buzz", { groupId, members: selected });
  } else
::contentReference[oaicite:0]{index=0}
 
