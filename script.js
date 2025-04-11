// Connect to Socket.IO server
const socket = io('https://buzzur-server.onrender.com');

// DOM references
const app = document.getElementById('app');

// State
let currentUser = null;

// Load initial UI
renderLoginPage();

// Page Renderers
function renderLoginPage() {
  app.innerHTML = `
    <h1>BUZZUR</h1>
    <input placeholder="Username" id="username" />
    <input placeholder="Password" type="password" id="password" />
    <button onclick="login()">Login</button>
    <p>No account? <a href="#" onclick="renderSignupPage()">Sign up</a></p>
  `;
}

function renderSignupPage() {
  app.innerHTML = `
    <h1>Sign Up</h1>
    <input placeholder="Username" id="username" />
    <input placeholder="Password" type="password" id="password" />
    <button onclick="signup()">Create Account</button>
    <p>Have an account? <a href="#" onclick="renderLoginPage()">Login</a></p>
  `;
}

function renderGroupsPage() {
  const userData = getUserData(currentUser);
  const groupList = userData.groups.map((group, i) => `
    <div class="group">
      <strong>${group.name}</strong>
      <button onclick="buzzGroup(${i})">Buzz</button>
      <button onclick="editGroup(${i})">Edit</button>
      <button onclick="removeGroup(${i})">Remove</button>
      <ul>${group.members.map((m, mi) => `
        <li>${m.name} (${m.phone}) 
          <button onclick="removeMember(${i}, ${mi})">Remove</button>
        </li>`).join('')}
      </ul>
    </div>
  `).join('');

  app.innerHTML = `
    <h1>Welcome, ${currentUser}</h1>
    <button onclick="logout()">Logout</button>
    <h2>My Groups</h2>
    ${groupList}
    <h3>Create New Group</h3>
    <input id="groupName" placeholder="Group name" />
    <button onclick="createGroup()">Add Group</button>
  `;
}

function editGroup(index) {
  const newName = prompt('Enter new group name:');
  if (!newName) return;
  const userData = getUserData(currentUser);
  userData.groups[index].name = newName;
  saveUserData(currentUser, userData);
  renderGroupsPage();
}

// Auth
function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const userData = getUserData(username);
  if (!userData || userData.password !== password) {
    alert('Invalid credentials');
    return;
  }
  currentUser = username;
  renderGroupsPage();
}

function signup() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  if (getUserData(username)) {
    alert('User already exists');
    return;
  }
  const newUser = { password, groups: [] };
  saveUserData(username, newUser);
  currentUser = username;
  renderGroupsPage();
}

function logout() {
  currentUser = null;
  renderLoginPage();
}

// Group Management
function createGroup() {
  const name = document.getElementById('groupName').value;
  if (!name) return alert("Group name required");
  const userData = getUserData(currentUser);
  userData.groups.push({ name, members: [] });
  saveUserData(currentUser, userData);
  renderGroupsPage();
}

function removeGroup(index) {
  const userData = getUserData(currentUser);
  userData.groups.splice(index, 1);
  saveUserData(currentUser, userData);
  renderGroupsPage();
}

function removeMember(groupIndex, memberIndex) {
  const userData = getUserData(currentUser);
  userData.groups[groupIndex].members.splice(memberIndex, 1);
  saveUserData(currentUser, userData);
  renderGroupsPage();
}

function addMember(groupIndex) {
  const name = prompt('Member name:');
  const phone = prompt('Phone number:');
  if (!name || !phone) return;
  const userData = getUserData(currentUser);
  userData.groups[groupIndex].members.push({ name, phone });
  saveUserData(currentUser, userData);
  renderGroupsPage();
}

function buzzGroup(groupIndex) {
  const userData = getUserData(currentUser);
  const group = userData.groups[groupIndex];

  // Emit buzz over socket
  socket.emit('buzz');

  // Simulate fetch to server if needed
  fetch('https://buzzur-server.onrender.com/send-buzz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ group })
  })
    .then(res => res.json())
    .then(data => {
      alert('Buzz sent!');
    })
    .catch(err => {
      console.error('Error sending buzz:', err);
      alert('Failed to send buzz');
    });
}

// LocalStorage helpers
function getUserData(username) {
  return JSON.parse(localStorage.getItem(username));
}

function saveUserData(username, data) {
  localStorage.setItem(username, JSON.stringify(data));
}

// Listen for buzz events
socket.on('buzz', () => {
  alert('🔔 You got buzzed!');
});
