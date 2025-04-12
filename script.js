const socket = io('https://buzzur-server.onrender.com'); // Update if needed
const app = document.getElementById('app');
const buzzSound = document.getElementById('buzz-sound');

let currentUser = null;

// Initial load
renderLogin();

// === RENDER FUNCTIONS ===

function renderLogin() {
  app.innerHTML = `
    <div class="banner">BUZZUR</div>
    <form id="loginForm" class="form-section">
      <input type="tel" placeholder="Phone Number" required />
      <input type="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
    <div class="links-row">
      <a href="#" id="forgotLink">Forgot Password?</a>
      <a href="#" id="signupLink">Sign Up</a>
    </div>
  `;

  document.getElementById('signupLink').onclick = renderSignup;
  document.getElementById('forgotLink').onclick = () => alert('Feature coming soon!');
  document.getElementById('loginForm').onsubmit = handleLogin;
}

function renderSignup() {
  app.innerHTML = `
    <div class="banner">Sign Up</div>
    <form id="signupForm" class="form-section">
      <input type="text" placeholder="Name" required />
      <input type="tel" placeholder="Phone Number" required />
      <input type="password" placeholder="Password" required />
      <input type="password" placeholder="Confirm Password" required />
      <label><input type="checkbox" id="showPassword"> Show Password</label>
      <button type="submit">Sign Up</button>
    </form>
  `;

  const passwordFields = app.querySelectorAll('input[type="password"]');
  document.getElementById('showPassword').onchange = (e) => {
    passwordFields.forEach(field => field.type = e.target.checked ? 'text' : 'password');
  };

  document.getElementById('signupForm').onsubmit = handleSignup;
}

function renderDashboard() {
  const groups = getUserGroups();
  app.innerHTML = `
    <div class="banner">My Groups</div>
    <div class="form-section">
      <input type="text" id="newGroupName" placeholder="Group Name" />
      <button onclick="createGroup()">Create Group</button>
      <div id="groupList">${groups.map(renderGroupCard).join('')}</div>
      <button class="logout-button" onclick="logout()">Logout</button>
    </div>
  `;
}

// === GROUP RENDERING ===

function renderGroupCard(group) {
  const memberList = group.members.map((m, i) => `
    <div class="member">
      <span>${m.name} (${m.phone})</span>
      <div>
        <input type="checkbox" data-member="${i}" data-group="${group.name}">
        <button onclick="removeMember('${group.name}', ${i})">Remove</button>
      </div>
    </div>
  `).join('');

  return `
    <div class="group-card" id="group-${group.name}">
      <h3>${group.name}</h3>
      <button onclick="editGroupName('${group.name}')">Edit Name</button>
      <button onclick="addMember('${group.name}')">Add Member</button>
      ${memberList}
      <div class="controls">
        <button onclick="buzzSelected('${group.name}')">Buzz Selected</button>
        <button onclick="buzzAll('${group.name}')">Buzz All</button>
        <button onclick="removeGroup('${group.name}')">Remove Group</button>
      </div>
    </div>
  `;
}

// === EVENT HANDLERS ===

function handleLogin(e) {
  e.preventDefault();
  const [phoneInput, passInput] = e.target.elements;
  const phone = phoneInput.value.trim();
  const password = passInput.value.trim();

  const user = JSON.parse(localStorage.getItem(`user:${phone}`));
  if (user && user.password === password) {
    currentUser = user;
    renderDashboard();
  } else {
    alert('Invalid phone or password');
  }
}

function handleSignup(e) {
  e.preventDefault();
  const [name, phone, password, confirm] = e.target.elements;

  if (password.value !== confirm.value) {
    alert('Passwords do not match');
    return;
  }

  const user = {
    name: name.value.trim(),
    phone: phone.value.trim(),
    password: password.value.trim(),
    groups: []
  };

  localStorage.setItem(`user:${user.phone}`, JSON.stringify(user));
  alert('Sign-up successful! Please login.');
  renderLogin();
}

function logout() {
  currentUser = null;
  renderLogin();
}

// === GROUP FUNCTIONS ===

function getUserGroups() {
  const user = JSON.parse(localStorage.getItem(`user:${currentUser.phone}`));
  return user.groups || [];
}

function saveUserGroups(groups) {
  currentUser.groups = groups;
  localStorage.setItem(`user:${currentUser.phone}`, JSON.stringify(currentUser));
  renderDashboard();
}

function createGroup() {
  const name = document.getElementById('newGroupName').value.trim();
  if (!name) return alert('Enter a group name');

  const groups = getUserGroups();
  if (groups.find(g => g.name === name)) {
    return alert('Group name already exists');
  }

  groups.push({ name, members: [] });
  saveUserGroups(groups);
}

function removeGroup(name) {
  const groups = getUserGroups().filter(g => g.name !== name);
  saveUserGroups(groups);
}

function addMember(groupName) {
  const name = prompt('Member name?');
  const phone = prompt('Member phone?');
  if (!name || !phone) return;

  const groups = getUserGroups();
  const group = groups.find(g => g.name === groupName);
  group.members.push({ name, phone });
  saveUserGroups(groups);
}

function removeMember(groupName, index) {
  const groups = getUserGroups();
  const group = groups.find(g => g.name === groupName);
  group.members.splice(index, 1);
  saveUserGroups(groups);
}

function editGroupName(oldName) {
  const newName = prompt('New group name?');
  if (!newName) return;

  const groups = getUserGroups();
  const group = groups.find(g => g.name === oldName);
  group.name = newName;
  saveUserGroups(groups);
}

function buzzAll(groupName) {
  const group = getUserGroups().find(g => g.name === groupName);
  if (group.members.length === 0) return alert('No members to buzz');

  playBuzz();
  sendBuzz(group.members);
}

function buzzSelected(groupName) {
  const checkboxes = document.querySelectorAll(`input[data-group="${groupName}"]:checked`);
  const group = getUserGroups().find(g => g.name === groupName);
  const selected = [...checkboxes].map(cb => group.members[cb.dataset.member]);

  if (selected.length === 0) return alert('No members selected');
  playBuzz();
  sendBuzz(selected);
}

function playBuzz() {
  buzzSound.currentTime = 0;
  buzzSound.play();
}

function sendBuzz(members) {
  fetch('https://buzzur-server.onrender.com/send-buzz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ members }),
  });

  socket.emit('buzz', { members });
}

socket.on('receive-buzz', () => {
  playBuzz();
});
