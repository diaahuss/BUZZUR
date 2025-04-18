// script.js

const app = document.getElementById('app');
const socket = io("https://buzzur-server.onrender.com");

let currentUser = null;
let users = JSON.parse(localStorage.getItem("users") || "[]");
let groups = JSON.parse(localStorage.getItem("groups") || "[]");

function renderLogin() {
  app.innerHTML = `
    <div class="form-container">
      <h1>BUZZUR</h1>
      <input type="tel" id="login-phone" placeholder="Phone Number" />
      <input type="password" id="login-password" placeholder="Password" />
      <button onclick="login()">Login</button>
      <div class="links">
        <span onclick="renderSignup()">Don't have an account? Sign Up</span>
        <span onclick="alert('Reset password coming soon')">Reset Password</span>
      </div>
    </div>
  `;
}

function renderSignup() {
  app.innerHTML = `
    <div class="form-container">
      <h1>Sign Up</h1>
      <input type="text" id="signup-name" placeholder="Name" />
      <input type="tel" id="signup-phone" placeholder="Phone Number" />
      <input type="password" id="signup-password" placeholder="Password" />
      <input type="password" id="signup-confirm" placeholder="Confirm Password" />
      <label><input type="checkbox" onclick="togglePassword()"> Show Password</label>
      <button onclick="signup()">Sign Up</button>
      <div class="links">
        <span onclick="renderLogin()">Back to Login</span>
      </div>
    </div>
  `;
}

function togglePassword() {
  const pw = document.getElementById('signup-password');
  const confirm = document.getElementById('signup-confirm');
  const type = pw.type === "password" ? "text" : "password";
  pw.type = type;
  confirm.type = type;
}

function login() {
  const phone = document.getElementById("login-phone").value;
  const password = document.getElementById("login-password").value;

  const user = users.find(u => u.phone === phone && u.password === password);
  if (user) {
    currentUser = user;
    renderDashboard();
  } else {
    alert("Invalid credentials.");
  }
}

function signup() {
  const name = document.getElementById("signup-name").value;
  const phone = document.getElementById("signup-phone").value;
  const pw = document.getElementById("signup-password").value;
  const confirm = document.getElementById("signup-confirm").value;

  if (pw !== confirm) return alert("Passwords do not match.");
  if (users.some(u => u.phone === phone)) return alert("Phone already registered.");

  const user = { name, phone, password: pw };
  users.push(user);
  localStorage.setItem("users", JSON.stringify(users));
  alert("Signup successful!");
  renderLogin();
}

function renderDashboard() {
  app.innerHTML = `
    <div class="header"><h2>My Groups</h2></div>
    <div class="dashboard">
      <button onclick="createGroup()">Create Group</button>
      <div id="groups-container"></div>
      <button onclick="logout()" class="logout">Logout</button>
    </div>
  `;
  renderGroups();
}

function logout() {
  currentUser = null;
  renderLogin();
}

function createGroup() {
  const name = prompt("Group name?");
  if (!name) return;

  const group = {
    id: Date.now().toString(),
    name,
    owner: currentUser.phone,
    members: []
  };
  groups.push(group);
  localStorage.setItem("groups", JSON.stringify(groups));
  renderGroups();
}

function renderGroups() {
  const container = document.getElementById("groups-container");
  container.innerHTML = "";

  groups.filter(g => g.owner === currentUser.phone).forEach(group => {
    const groupDiv = document.createElement("div");
    groupDiv.className = "group-card";

    groupDiv.innerHTML = `
      <input class="group-name" value="${group.name}" onchange="renameGroup('${group.id}', this.value)" />
      <div id="members-${group.id}"></div>
      <div class="group-actions">
        <button onclick="addMember('${group.id}')">Add Member</button>
        <button onclick="buzzSelected('${group.id}')">Buzz Selected</button>
        <button onclick="buzzAll('${group.id}')">Buzz All</button>
        <button onclick="deleteGroup('${group.id}')">Delete Group</button>
      </div>
    `;

    container.appendChild(groupDiv);
    renderMembers(group.id);
  });
}

function renderMembers(groupId) {
  const group = groups.find(g => g.id === groupId);
  const container = document.getElementById(`members-${groupId}`);
  container.innerHTML = '';

  group.members.forEach((member, index) => {
    const memberDiv = document.createElement('div');
    memberDiv.className = 'member';

    memberDiv.innerHTML = `
      <input type="checkbox" data-index="${index}" />
      <input type="text" value="${member.name}" onchange="updateMember('${groupId}', ${index}, 'name', this.value)" />
      <input type="tel" value="${member.phone}" onchange="updateMember('${groupId}', ${index}, 'phone', this.value)" />
      <button onclick="removeMember('${groupId}', ${index})">Remove</button>
    `;

    container.appendChild(memberDiv);
  });
}

function addMember(groupId) {
  const group = groups.find(g => g.id === groupId);
  group.members.push({ name: "", phone: "" });
  localStorage.setItem("groups", JSON.stringify(groups));
  renderMembers(groupId);
}

function updateMember(groupId, index, field, value) {
  const group = groups.find(g => g.id === groupId);
  group.members[index][field] = value;
  localStorage.setItem("groups", JSON.stringify(groups));
}

function removeMember(groupId, index) {
  const group = groups.find(g => g.id === groupId);
  group.members.splice(index, 1);
  localStorage.setItem("groups", JSON.stringify(groups));
  renderMembers(groupId);
}

function renameGroup(id, newName) {
  const group = groups.find(g => g.id === id);
  group.name = newName;
  localStorage.setItem("groups", JSON.stringify(groups));
}

function deleteGroup(id) {
  groups = groups.filter(g => g.id !== id);
  localStorage.setItem("groups", JSON.stringify(groups));
  renderGroups();
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
  }
}

function buzzAll(groupId) {
  const group = groups.find(g => g.id === groupId);
  socket.emit("buzz", { groupId, members: group.members });
}

socket.on("buzzed", () => {
  const sound = document.getElementById("buzz-sound");
  if (sound) sound.play();
});

renderLogin();
