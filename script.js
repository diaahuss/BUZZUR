// script.js

const app = document.getElementById('app');
let currentUser = null;
const users = JSON.parse(localStorage.getItem('users')) || [];
const socket = io();

// Utility
const saveUsers = () => localStorage.setItem('users', JSON.stringify(users));

// Initial render
renderLogin();

// ========== AUTH SCREENS ==========

function renderLogin() {
  app.innerHTML = `
    <h2>Login</h2>
    <form id="login-form">
      <input type="text" id="login-phone" placeholder="Phone Number" required>
      <input type="password" id="login-password" placeholder="Password" required>
      <button type="submit">Login</button>
    </form>
    <p>
      <a href="#" id="to-signup">Sign Up</a> |
      <a href="#" id="to-forgot">Forgot Password?</a>
    </p>
  `;

  document.getElementById('login-form').addEventListener('submit', handleLogin);
  document.getElementById('to-signup').addEventListener('click', renderSignup);
  document.getElementById('to-forgot').addEventListener('click', renderForgot);
}

function renderSignup() {
  app.innerHTML = `
    <h2>Sign Up</h2>
    <form id="signup-form">
      <input type="text" id="signup-name" placeholder="Name" required>
      <input type="text" id="signup-phone" placeholder="Phone Number" required>
      <input type="password" id="signup-password" placeholder="Password" required>
      <input type="password" id="signup-confirm" placeholder="Confirm Password" required>
      <button type="submit">Sign Up</button>
    </form>
    <p><a href="#" id="back-to-login">Back to Login</a></p>
  `;

  document.getElementById('signup-form').addEventListener('submit', handleSignup);
  document.getElementById('back-to-login').addEventListener('click', renderLogin);
}

function renderForgot() {
  app.innerHTML = `
    <h2>Reset Password</h2>
    <form id="forgot-form">
      <input type="text" id="forgot-phone" placeholder="Phone Number" required>
      <button type="submit">Send Reset Link</button>
    </form>
    <p><a href="#" id="back-to-login">Back to Login</a></p>
  `;

  document.getElementById('forgot-form').addEventListener('submit', (e) => {
    e.preventDefault();
    alert("Reset link (simulated) sent!");
    renderLogin();
  });
  document.getElementById('back-to-login').addEventListener('click', renderLogin);
}

// ========== AUTH LOGIC ==========

function handleLogin(e) {
  e.preventDefault();
  const phone = document.getElementById('login-phone').value;
  const pass = document.getElementById('login-password').value;
  const user = users.find(u => u.phone === phone && u.password === pass);

  if (user) {
    currentUser = user;
    renderGroups();
  } else {
    alert("Invalid login credentials.");
  }
}

function handleSignup(e) {
  e.preventDefault();
  const name = document.getElementById('signup-name').value;
  const phone = document.getElementById('signup-phone').value;
  const pass = document.getElementById('signup-password').value;
  const confirm = document.getElementById('signup-confirm').value;

  if (pass !== confirm) return alert("Passwords do not match.");

  if (users.some(u => u.phone === phone)) return alert("User already exists.");

  const newUser = { name, phone, password: pass, groups: [] };
  users.push(newUser);
  saveUsers();
  alert("Signup successful. Please login.");
  renderLogin();
}

// ========== GROUP MANAGEMENT ==========

function renderGroups() {
  app.innerHTML = `
    <div class="banner">Welcome, ${currentUser.name || currentUser.phone}</div>
    <div id="groups-container"></div>
    <button id="create-group">Create Group</button>
    <button id="logout">Logout</button>
  `;

  document.getElementById('create-group').addEventListener('click', () => editGroup());
  document.getElementById('logout').addEventListener('click', () => {
    currentUser = null;
    renderLogin();
  });

  updateGroupList();
}

function updateGroupList() {
  const container = document.getElementById('groups-container');
  container.innerHTML = '';
  const user = users.find(u => u.phone === currentUser.phone);
  user.groups.forEach((group, index) => {
    const div = document.createElement('div');
    div.className = 'group';
    div.innerHTML = `
      <h3>${group.name}</h3>
      ${group.members.map((m, i) => `
        <div>
          <input value="${m.name}" data-g="${index}" data-i="${i}" class="member-name">
          <input value="${m.phone}" data-g="${index}" data-i="${i}" class="member-phone">
          <button onclick="removeMember(${index}, ${i})">Remove</button>
        </div>`).join('')}
      <button onclick="addMember(${index})">Add Member</button>
      <button onclick="buzzAll(${index})">Buzz All</button>
      <button onclick="buzzSelected(${index})">Buzz Selected</button>
      <button onclick="editGroup(${index})">Edit Group</button>
      <button onclick="removeGroup(${index})">Delete Group</button>
    `;
    container.appendChild(div);
  });

  document.querySelectorAll('.member-name').forEach(input => {
    input.addEventListener('input', (e) => {
      const g = e.target.dataset.g;
      const i = e.target.dataset.i;
      users.find(u => u.phone === currentUser.phone).groups[g].members[i].name = e.target.value;
      saveUsers();
    });
  });

  document.querySelectorAll('.member-phone').forEach(input => {
    input.addEventListener('input', (e) => {
      const g = e.target.dataset.g;
      const i = e.target.dataset.i;
      users.find(u => u.phone === currentUser.phone).groups[g].members[i].phone = e.target.value;
      saveUsers();
    });
  });
}

function addMember(gIndex) {
  const user = users.find(u => u.phone === currentUser.phone);
  user.groups[gIndex].members.push({ name: '', phone: '' });
  saveUsers();
  updateGroupList();
}

function removeMember(gIndex, mIndex) {
  const user = users.find(u => u.phone === currentUser.phone);
  user.groups[gIndex].members.splice(mIndex, 1);
  saveUsers();
  updateGroupList();
}

function buzzAll(gIndex) {
  const group = users.find(u => u.phone === currentUser.phone).groups[gIndex];
  socket.emit('buzz', { members: group.members });
  alert('Buzzed all!');
}

function buzzSelected(gIndex) {
  const group = users.find(u => u.phone === currentUser.phone).groups[gIndex];
  const selected = group.members.filter(m => m.selected);
  socket.emit('buzz', { members: selected });
  alert('Buzzed selected!');
}

function removeGroup(gIndex) {
  const user = users.find(u => u.phone === currentUser.phone);
  user.groups.splice(gIndex, 1);
  saveUsers();
  updateGroupList();
}

function editGroup(index = null) {
  const name = prompt("Enter group name:");
  if (!name) return;

  const user = users.find(u => u.phone === currentUser.phone);
  if (index === null) {
    user.groups.push({ name, members: [] });
  } else {
    user.groups[index].name = name;
  }
  saveUsers();
  updateGroupList();
}

