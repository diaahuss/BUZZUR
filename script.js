const socket = io("https://buzzur-server.onrender.com"); // Your Render backend

const app = document.getElementById('app');

// --- State ---
let currentUser = null;

// --- Initial Load ---
window.onload = () => {
  renderLogin();
};

// --- Views ---
function renderLogin() {
  app.innerHTML = `
    <div class="form-container">
      <h2>Login</h2>
      <input type="tel" id="login-phone" placeholder="Phone Number" />
      <input type="password" id="login-password" placeholder="Password" />
      <button onclick="login()">Login</button>
      <p><a href="#" onclick="renderSignup()">Sign Up</a></p>
    </div>
  `;
}

function renderSignup() {
  app.innerHTML = `
    <div class="form-container">
      <h2>Sign Up</h2>
      <input type="text" id="signup-name" placeholder="Name" />
      <input type="tel" id="signup-phone" placeholder="Phone Number" />
      <input type="password" id="signup-password" placeholder="Password" />
      <button onclick="signup()">Sign Up</button>
      <p><a href="#" onclick="renderLogin()">Back to Login</a></p>
    </div>
  `;
}

function renderDashboard() {
  const groups = getUserGroups();
  app.innerHTML = `
    <div class="dashboard">
      <h2>My Groups</h2>
      <button onclick="createGroup()">+ Create Group</button>
      <div id="group-list">
        ${groups.map(groupHTML).join('')}
      </div>
      <button class="logout" onclick="logout()">Logout</button>
    </div>
  `;
}

function groupHTML(group) {
  const members = group.members.map((member, index) => `
    <div class="member">
      <input value="${member.name}" onchange="updateMember('${group.id}', ${index}, 'name', this.value)" placeholder="Name" />
      <input value="${member.phone}" onchange="updateMember('${group.id}', ${index}, 'phone', this.value)" placeholder="Phone" />
      <button onclick="removeMember('${group.id}', ${index})">❌</button>
    </div>
  `).join('');

  return `
    <div class="group">
      <input value="${group.name}" onchange="renameGroup('${group.id}', this.value)" placeholder="Group Name" />
      <div class="members">${members}</div>
      <button onclick="addMember('${group.id}')">+ Add Member</button>
      <button onclick="buzzGroup('${group.id}')">🔔 Buzz All</button>
      <button onclick="removeGroup('${group.id}')">🗑️ Remove Group</button>
    </div>
  `;
}

// --- Auth Functions ---
function login() {
  const phone = document.getElementById('login-phone').value;
  const password = document.getElementById('login-password').value;
  const users = JSON.parse(localStorage.getItem('users') || '[]');

  const user = users.find(u => u.phone === phone && u.password === password);
  if (user) {
    currentUser = user;
    renderDashboard();
  } else {
    alert("Invalid credentials");
  }
}

function signup() {
  const name = document.getElementById('signup-name').value;
  const phone = document.getElementById('signup-phone').value;
  const password = document.getElementById('signup-password').value;

  const users = JSON.parse(localStorage.getItem('users') || '[]');

  if (users.some(u => u.phone === phone)) {
    alert("User already exists");
    return;
  }

  const newUser = { name, phone, password };
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));

  alert("Signup successful. Please login.");
  renderLogin();
}

function logout() {
  currentUser = null;
  renderLogin();
}

// --- Group & Member Functions ---
function getUserGroups() {
  const groups = JSON.parse(localStorage.getItem('groups') || '[]');
  return groups.filter(g => g.owner === currentUser.phone);
}

function saveGroups(updatedGroups) {
  localStorage.setItem('groups', JSON.stringify(updatedGroups));
  renderDashboard();
}

function createGroup() {
  const name = prompt("Enter group name:");
  if (!name) return;

  const groups = JSON.parse(localStorage.getItem('groups') || '[]');
  const newGroup = {
    id: Date.now().toString(),
    name,
    owner: currentUser.phone,
    members: []
  };
  groups.push(newGroup);
  saveGroups(groups);
}

function removeGroup(groupId) {
  let groups = JSON.parse(localStorage.getItem('groups') || '[]');
  groups = groups.filter(g => g.id !== groupId);
  saveGroups(groups);
}

function renameGroup(groupId, newName) {
  const groups = JSON.parse(localStorage.getItem('groups') || '[]');
  const group = groups.find(g => g.id === groupId);
  if (group) group.name = newName;
  saveGroups(groups);
}

function addMember(groupId) {
  const groups = JSON.parse(localStorage.getItem('groups') || '[]');
  const group = groups.find(g => g.id === groupId);
  if (group) group.members.push({ name: '', phone: '' });
  saveGroups(groups);
}

function updateMember(groupId, index, field, value) {
  const groups = JSON.parse(localStorage.getItem('groups') || '[]');
  const group = groups.find(g => g.id === groupId);
  if (group) group.members[index][field] = value;
  saveGroups(groups);
}

function removeMember(groupId, index) {
  const groups = JSON.parse(localStorage.getItem('groups') || '[]');
  const group = groups.find(g => g.id === groupId);
  if (group) group.members.splice(index, 1);
  saveGroups(groups);
}

// --- Buzz ---
function buzzGroup(groupId) {
  const groups = JSON.parse(localStorage.getItem('groups') || '[]');
  const group = groups.find(g => g.id === groupId);
  if (!group) return;

  socket.emit('buzz', {
    groupId: group.id,
    members: group.members
  });
}

// --- Buzz Listener ---
socket.on('buzzed', (data) => {
  console.log('Buzzed!', data);
  const audio = document.getElementById('buzz-sound');
  if (audio) audio.play();
});
