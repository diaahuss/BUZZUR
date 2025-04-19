const app = document.getElementById('app');
const socket = io();

let users = JSON.parse(localStorage.getItem('users') || '[]');
let groups = JSON.parse(localStorage.getItem('groups') || '[]');
let currentUser = null;

// 1. LOGIN VIEW
function renderLogin() {
  app.innerHTML = `
    <div class="container">
      <h2>BUZZUR</h2>
      <input type="tel" id="login-phone" placeholder="Phone Number">
      <input type="password" id="login-pass" placeholder="Password">
      <button onclick="handleLogin()">Login</button>
      <p><a href="#" onclick="renderSignup()">Sign Up</a></p>
    </div>
  `;
}

// 2. SIGNUP VIEW
function renderSignup() {
  app.innerHTML = `
    <div class="container">
      <h2>Create Account</h2>
      <input type="text" id="signup-name" placeholder="Name">
      <input type="tel" id="signup-phone" placeholder="Phone Number">
      <input type="password" id="signup-pass" placeholder="Password">
      <input type="password" id="signup-confirm" placeholder="Confirm Password">
      <button onclick="handleSignup()">Sign Up</button>
      <p><a href="#" onclick="renderLogin()">Back to Login</a></p>
    </div>
  `;
}

// 3. DASHBOARD VIEW
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

// 4. LOGIN LOGIC
function handleLogin() {
  const phone = document.getElementById('login-phone').value.trim();
  const pass = document.getElementById('login-pass').value.trim();
  const user = users.find(u => u.phone === phone && u.password === pass);
  if (!user) return alert("Invalid login");

  currentUser = user;
  renderDashboard();
}

// 5. SIGNUP LOGIC
function handleSignup() {
  const name = document.getElementById('signup-name').value.trim();
  const phone = document.getElementById('signup-phone').value.trim();
  const pass = document.getElementById('signup-pass').value;
  const confirm = document.getElementById('signup-confirm').value;

  if (!name || !phone || !pass) return alert("All fields required");
  if (pass !== confirm) return alert("Passwords don't match");
  if (users.some(u => u.phone === phone)) return alert("Phone already registered");

  users.push({ name, phone, password: pass });
  localStorage.setItem('users', JSON.stringify(users));
  alert("Account created!");
  renderLogin();
}

// 6. LOGOUT
function logout() {
  currentUser = null;
  renderLogin();
}

// 7. GROUP CREATION
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

// 8. RENDER GROUPS
function renderGroups() {
  const container = document.getElementById('groups-container');
  container.innerHTML = '';
  const myGroups = groups.filter(g => g.owner === currentUser.phone);

  myGroups.forEach(group => {
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

// 9. GROUP NAME EDIT
function renameGroup(groupId, newName) {
  const group = groups.find(g => g.id === groupId);
  if (group) {
    group.name = newName.trim();
    saveGroups();
  }
}

// 10. GROUP DELETE
function deleteGroup(groupId) {
  groups = groups.filter(g => g.id !== groupId);
  saveGroups();
  renderGroups();
}

// 11. ADD MEMBER
function addMember(groupId) {
  const group = groups.find(g => g.id === groupId);
  if (group) {
    group.members.push({ name: '', phone: '', selected: true });
    saveGroups();
    renderMembers(groupId);
  }
}

// 12. RENDER MEMBERS
function renderMembers(groupId) {
  const group = groups.find(g => g.id === groupId);
  const container = document.getElementById(`members-${groupId}`);
  container.innerHTML = '';

  group.members.forEach((member, index) => {
    container.innerHTML += `
      <input type="text" placeholder="Name" value="${member.name}" onchange="updateMember('${groupId}', ${index}, 'name', this.value)">
      <input type="tel" placeholder="Phone" value="${member.phone}" onchange="updateMember('${groupId}', ${index}, 'phone', this.value)">
      <label>
        <input type="checkbox" ${member.selected ? 'checked' : ''} onchange="updateMember('${groupId}', ${index}, 'selected', this.checked)"> Selected
      </label>
      <button onclick="removeMember('${groupId}', ${index})">Remove</button>
      <hr>
    `;
  });
}

// 13. UPDATE MEMBER
function updateMember(groupId, index, key, value) {
  const group = groups.find(g => g.id === groupId);
  if (group) {
    if (key === 'selected') {
      group.members[index][key] = value;
    } else {
      group.members[index][key] = value.trim();
    }
    saveGroups();
  }
}

// 14. REMOVE MEMBER
function removeMember(groupId, index) {
  const group = groups.find(g => g.id === groupId);
  if (group) {
    group.members.splice(index, 1);
    saveGroups();
    renderMembers(groupId);
  }
}

// 15. BUZZ SELECTED
function buzzSelected(groupId) {
  const group = groups.find(g => g.id === groupId);
  if (!group) return;

  const phones = group.members.filter(m => m.selected && m.phone).map(m => m.phone);
  if (!phones.length) return alert("No selected members");

  sendBuzz(phones, `Buzz from ${group.name}`);
}

// 16. BUZZ ALL
function buzzAll(groupId) {
  const group = groups.find(g => g.id === groupId);
  if (!group) return;

  const phones = group.members.filter(m => m.phone).map(m => m.phone);
  if (!phones.length) return alert("No members to buzz");

  sendBuzz(phones, `Buzz from ${group.name}`);
}

// 17. SEND BUZZ REQUEST
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
        alert("Buzz failed");
      }
    });
}

// 18. BUZZ SOUND LISTENER
socket.on('buzz', () => {
  document.getElementById('buzz-sound').play();
});

// 19. SAVE GROUPS TO STORAGE
function saveGroups() {
  localStorage.setItem('groups', JSON.stringify(groups));
}

// INIT
renderLogin();
