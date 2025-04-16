const socket = io(); // Connect to server
const app = document.getElementById('app');

// Load buzz sound
const buzzSound = new Audio('buzz.mp3'); // Ensure buzz.mp3 is in the same folder

// Dummy localStorage auth for demo (replace with Firebase later)
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let users = JSON.parse(localStorage.getItem('users')) || [];
let groups = JSON.parse(localStorage.getItem('groups')) || [];

function save() {
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('groups', JSON.stringify(groups));
  if (currentUser) {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }
}

function renderLogin() {
  app.innerHTML = `
    <div class="container">
      <div class="banner">Login</div>
      <input type="tel" id="loginPhone" placeholder="Phone Number">
      <input type="password" id="loginPassword" placeholder="Password">
      <button onclick="login()">Login</button>
      <a href="#" onclick="renderSignup()">Sign Up</a> |
      <a href="#" onclick="renderForgotPassword()">Forgot Password</a>
    </div>
  `;
}

function renderSignup() {
  app.innerHTML = `
    <div class="container">
      <div class="banner">Sign Up</div>
      <input type="text" id="signupName" placeholder="Your Name">
      <input type="tel" id="signupPhone" placeholder="Phone Number">
      <input type="password" id="signupPassword" placeholder="Password">
      <button onclick="signup()">Sign Up</button>
      <a href="#" onclick="renderLogin()">Back to Login</a>
    </div>
  `;
}

function renderForgotPassword() {
  app.innerHTML = `
    <div class="container">
      <div class="banner">Reset Password</div>
      <input type="tel" id="resetPhone" placeholder="Your Phone Number">
      <input type="password" id="newPassword" placeholder="New Password">
      <button onclick="resetPassword()">Reset Password</button>
      <a href="#" onclick="renderLogin()">Back to Login</a>
    </div>
  `;
}

function login() {
  const phone = document.getElementById('loginPhone').value;
  const password = document.getElementById('loginPassword').value;
  const user = users.find(u => u.phone === phone && u.password === password);
  if (user) {
    currentUser = user;
    save();
    showGroups();
  } else {
    alert('Invalid credentials');
  }
}

function signup() {
  const name = document.getElementById('signupName').value;
  const phone = document.getElementById('signupPhone').value;
  const password = document.getElementById('signupPassword').value;

  if (users.find(u => u.phone === phone)) {
    alert('Phone already registered');
    return;
  }

  const newUser = { name, phone, password };
  users.push(newUser);
  currentUser = newUser;
  save();
  showGroups();
}

function resetPassword() {
  const phone = document.getElementById('resetPhone').value;
  const newPassword = document.getElementById('newPassword').value;
  const user = users.find(u => u.phone === phone);
  if (user) {
    user.password = newPassword;
    save();
    alert('Password updated');
    renderLogin();
  } else {
    alert('User not found');
  }
}

function logout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  renderLogin();
}

function showGroups() {
  const userGroups = groups.filter(g => g.owner === currentUser.phone);
  app.innerHTML = `
    <div class="container">
      <div class="banner">My Groups</div>
      ${userGroups.map(g => `
        <div class="group-section">
          <b>${g.name}</b><br>
          <div class="group-buttons">
            <button onclick="editGroup('${g.name}')">Edit</button>
            <button onclick="removeGroup('${g.name}')">Remove</button>
            <button onclick="buzzAll('${g.name}')">Buzz All</button>
          </div>
        </div>
      `).join('')}
      <button onclick="createGroup()">Create New Group</button>
      <button onclick="logout()">Logout</button>
    </div>
  `;
}

function createGroup() {
  const name = prompt('Enter group name:');
  if (!name) return;
  groups.push({ name, owner: currentUser.phone, members: [] });
  save();
  showGroups();
}

function editGroup(groupName) {
  const group = groups.find(g => g.name === groupName && g.owner === currentUser.phone);
  if (!group) return;
  const newName = prompt('Edit group name:', group.name);
  if (newName) group.name = newName;

  const membersHTML = group.members.map((m, i) => `
    <div>
      <input type="text" value="${m.name}" placeholder="Name" onchange="updateMember('${group.name}', ${i}, 'name', this.value)">
      <input type="tel" value="${m.phone}" placeholder="Phone" onchange="updateMember('${group.name}', ${i}, 'phone', this.value)">
      <button onclick="removeMember('${group.name}', ${i})">Remove</button>
    </div>
  `).join('');

  app.innerHTML = `
    <div class="container">
      <div class="banner">Edit Group: ${group.name}</div>
      ${membersHTML}
      <button onclick="addMember('${group.name}')">Add Member</button>
      <button onclick="showGroups()">Back</button>
    </div>
  `;
}

function updateMember(groupName, index, field, value) {
  const group = groups.find(g => g.name === groupName);
  if (group) {
    group.members[index][field] = value;
    save();
  }
}

function removeGroup(name) {
  groups = groups.filter(g => g.name !== name || g.owner !== currentUser.phone);
  save();
  showGroups();
}

function addMember(groupName) {
  const group = groups.find(g => g.name === groupName);
  if (!group) return;
  group.members.push({ name: '', phone: '' });
  save();
  editGroup(groupName);
}

function removeMember(groupName, index) {
  const group = groups.find(g => g.name === groupName);
  if (group) {
    group.members.splice(index, 1);
    save();
    editGroup(groupName);
  }
}

function buzzAll(groupName) {
  const group = groups.find(g => g.name === groupName);
  if (!group || !group.members.length) return alert("No members to buzz.");
  const numbers = group.members.map(m => m.phone);
  socket.emit('sendBuzz', { to: numbers, message: `Buzz from ${currentUser.name}!` });
  alert('Buzz sent to all members!');
}

// Socket.IO receive buzz and play sound
socket.on('buzzReceived', (message) => {
  console.log('Buzz received:', message);
  buzzSound.play();
  alert(message);
});

// Start app
if (currentUser) {
  showGroups();
} else {
  renderLogin();
}
