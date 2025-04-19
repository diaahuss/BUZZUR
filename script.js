const app = document.getElementById('app');
const socket = io();
let users = JSON.parse(localStorage.getItem('users') || '[]');
let groups = JSON.parse(localStorage.getItem('groups') || '[]');
let currentUser = null;

// Initial Render
renderLogin();

function renderLogin() {
  app.innerHTML = `
    <div class="container">
      <h2>BUZZUR</h2>
      <input type="tel" id="login-phone" placeholder="Phone Number">
      <input type="password" id="login-pass" placeholder="Password">
      <button onclick="login()">Login</button>
      <p><a href="#" onclick="renderSignup()">Sign Up</a></p>
    </div>
  `;
}

function renderSignup() {
  app.innerHTML = `
    <div class="container">
      <h2>Sign Up</h2>
      <input type="text" id="signup-name" placeholder="Name">
      <input type="tel" id="signup-phone" placeholder="Phone Number">
      <input type="password" id="signup-pass" placeholder="Password">
      <input type="password" id="signup-confirm" placeholder="Confirm Password">
      <button onclick="signup()">Create Account</button>
      <p><a href="#" onclick="renderLogin()">Back to Login</a></p>
    </div>
  `;
}

function login() {
  const phone = document.getElementById('login-phone').value;
  const pass = document.getElementById('login-pass').value;
  const user = users.find(u => u.phone === phone && u.password === pass);
  if (user) {
    currentUser = user;
    renderDashboard();
  } else {
    alert('Invalid credentials');
  }
}

function signup() {
  const name = document.getElementById('signup-name').value;
  const phone = document.getElementById('signup-phone').value;
  const pass = document.getElementById('signup-pass').value;
  const confirm = document.getElementById('signup-confirm').value;

  if (pass !== confirm) return alert("Passwords don't match");
  if (users.some(u => u.phone === phone)) return alert("User already exists");

  users.push({ name, phone, password: pass });
  localStorage.setItem('users', JSON.stringify(users));
  alert('Account created!');
  renderLogin();
}

function renderDashboard() {
  app.innerHTML = `
    <div class="container">
      <h2>My Groups</h2>
      <button onclick="createGroup()">Create Group</button>
      <div id="groups-container"></div>
      <button onclick="logout()">Logout</button>
      <audio id="buzz-sound" src="buzz.mp3" preload="auto"></audio>
    </div>
  `;
  renderGroups();
}

function logout() {
  currentUser = null;
  renderLogin();
}

function createGroup() {
  const name = prompt("Group name:");
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
  const userGroups = groups.filter(g => g.owner === currentUser.phone);

  userGroups.forEach(group => {
    const div = document.createElement('div');
    div.className = 'group-card';
    div.innerHTML = `
      <input type="text" value="${group.name}" onchange="renameGroup('${group.id}', this.value)">
      <div id="members-${group.id}"></div>
      <button onclick="addMember('${group.id}')">Add Member</button>
      <button onclick="buzzSelected('${group.id}')">Buzz Selected</button>
      <button onclick="buzzAll('${group.id}')">Buzz All</button>
      <button onclick="deleteGroup('${group.id}')">Delete Group</button>
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

function addMember(groupId) {
  const group = groups.find(g => g.id === groupId);
  if (group) {
    group.members.push({ name: '', phone: '', selected: true });
    localStorage.setItem('groups', JSON.stringify(groups));
    renderMembers(groupId);
  }
}

function renderMembers(groupId) {
  const group = groups.find(g => g.id === groupId);
  const container = document.getElementById(`members-${groupId}`);
  container.innerHTML = '';

  group.members.forEach((member, i) => {
    container.innerHTML += `
      <input type="text" placeholder="Name" value="${member.name}" onchange="updateMember('${groupId}', ${i}, 'name', this.value)">
      <input type="tel" placeholder="Phone" value="${member.phone}" onchange="updateMember('${groupId}', ${i}, 'phone', this.value)">
      <label>
        <input type="checkbox" ${member.selected ? 'checked' : ''} onchange="updateMember('${groupId}', ${i}, 'selected', this.checked)">
        Selected
      </label>
      <button onclick="removeMember('${groupId}', ${i})">Remove</button>
      <hr>
    `;
  });
}

function updateMember(groupId, index, key, value) {
  const group = groups.find(g => g.id === groupId);
  if (group) {
    group.members[index][key] = key === 'selected' ? value : value.trim();
    localStorage.setItem('groups', JSON.stringify(groups));
  }
}

function removeMember(groupId, index) {
  const group = groups.find(g => g.id === groupId);
  if (group) {
    group.members.splice(index, 1);
    localStorage.setItem('groups', JSON.stringify(groups));
    renderMembers(groupId);
  }
}

function buzzSelected(groupId) {
  const group = groups.find(g => g.id === groupId);
  const selectedPhones = group.members.filter(m => m.selected && m.phone).map(m => m.phone);
  if (selectedPhones.length === 0) return alert("No members selected");

  sendBuzz(selectedPhones, `Buzz from ${group.name}`);
}

function buzzAll(groupId) {
  const group = groups.find(g => g.id === groupId);
  const allPhones = group.members.filter(m => m.phone).map(m => m.phone);
  if (allPhones.length === 0) return alert("No members to buzz");

  sendBuzz(allPhones, `Buzz from ${group.name}`);
}

function sendBuzz(phoneNumbers, message) {
  fetch('/send-buzz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumbers, message })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        socket.emit('buzz');
        alert("Buzz sent!");
      } else {
        alert("Failed to send buzz");
      }
    });
}

// Listen for buzz sound
socket.on('buzz', () => {
  document.getElementById('buzz-sound').play();
});
