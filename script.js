// ===== STATE MANAGEMENT =====
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
const socket = io();

// ===== CORE FUNCTIONS =====
function saveData() {
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

function playBuzz() {
  document.getElementById('buzz-sound').play();
}

// ===== VIEW RENDERING =====
function renderLogin() {
  document.getElementById('app').innerHTML = `
    <h2>Login</h2>
    <input type="text" id="login-phone" placeholder="Phone">
    <input type="password" id="login-pw" placeholder="Password">
    <button id="login-btn">Login</button>
    <div class="flex mt-20">
      <button id="show-signup">Sign Up</button>
      <button id="show-forgot">Forgot PW?</button>
    </div>
  `;
  
  document.getElementById('login-btn').onclick = handleLogin;
  document.getElementById('show-signup').onclick = renderSignup;
}

function renderSignup() {
  document.getElementById('app').innerHTML = `
    <h2>Sign Up</h2>
    <input type="text" id="signup-name" placeholder="Name">
    <input type="text" id="signup-phone" placeholder="Phone">
    <input type="password" id="signup-pw" placeholder="Password">
    <input type="password" id="signup-confirm" placeholder="Confirm Password">
    <button id="signup-btn">Create Account</button>
    <button class="mt-20" id="show-login">Back to Login</button>
  `;
  
  document.getElementById('signup-btn').onclick = handleSignup;
  document.getElementById('show-login').onclick = renderLogin;
}

function renderDashboard() {
  document.getElementById('app').innerHTML = `
    <h2>My Groups</h2>
    <div id="groups-container"></div>
    <button id="create-group" class="mt-20">+ New Group</button>
    <button id="logout-btn" class="danger mt-20">Logout</button>
  `;
  
  renderGroups();
  document.getElementById('create-group').onclick = createGroup;
  document.getElementById('logout-btn').onclick = logout;
}

// ===== EVENT HANDLERS =====
function handleLogin() {
  const phone = document.getElementById('login-phone').value;
  const pw = document.getElementById('login-pw').value;
  
  const user = users.find(u => u.phone === phone && u.password === pw);
  if (user) {
    currentUser = user;
    saveData();
    renderDashboard();
  } else {
    alert('Invalid credentials');
  }
}

function handleSignup() {
  const name = document.getElementById('signup-name').value;
  const phone = document.getElementById('signup-phone').value;
  const pw = document.getElementById('signup-pw').value;
  const confirm = document.getElementById('signup-confirm').value;
  
  if (pw !== confirm) return alert("Passwords don't match");
  if (users.some(u => u.phone === phone)) return alert("User exists");
  
  users.push({ name, phone, password: pw, groups: [] });
  saveData();
  alert('Account created!');
  renderLogin();
}

// ===== GROUP FUNCTIONS =====
function renderGroups() {
  const container = document.getElementById('groups-container');
  container.innerHTML = '';
  
  currentUser.groups.forEach((group, gi) => {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'group';
    groupDiv.innerHTML = `
      <h3>${group.name}</h3>
      <div class="members" id="members-${gi}"></div>
      <button onclick="addMember(${gi})">+ Add Member</button>
      <button onclick="buzzGroup(${gi})">Buzz All</button>
      <button class="danger" onclick="deleteGroup(${gi})">Delete Group</button>
    `;
    container.appendChild(groupDiv);
    renderMembers(gi);
  });
}

function renderMembers(groupIndex) {
  const container = document.getElementById(`members-${groupIndex}`);
  container.innerHTML = '';
  
  currentUser.groups[groupIndex].members.forEach((member, mi) => {
    const memberDiv = document.createElement('div');
    memberDiv.className = 'member';
    memberDiv.innerHTML = `
      <input value="${member.name}" placeholder="Name" onchange="updateMember(${groupIndex}, ${mi}, 'name', this.value)">
      <input value="${member.phone}" placeholder="Phone" onchange="updateMember(${groupIndex}, ${mi}, 'phone', this.value)">
      <button class="danger" onclick="removeMember(${groupIndex}, ${mi})">Remove</button>
    `;
    container.appendChild(memberDiv);
  });
}

// ===== INITIALIZATION =====
socket.on('buzz', playBuzz);
currentUser ? renderDashboard() : renderLogin();
