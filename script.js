// buzzur/script.js

const SERVER_URL = "https://buzzur-server.onrender.com";
const app = document.getElementById("app");
let currentUser = null;
let groups = JSON.parse(localStorage.getItem("buzzerGroups") || "[]");
let users = JSON.parse(localStorage.getItem("buzzerUsers") || "[]");

const socket = io(SERVER_URL);

// Entry point
showLogin();

// =================== AUTH SCREENS ===================

function showLogin() {
  app.innerHTML = `
    <div class="container">
      <div class="banner">Login</div>
      <input type="text" id="phone" placeholder="Phone Number">
      <input type="password" id="password" placeholder="Password">
      <button onclick="login()">Login</button>
      <p>Don't have an account? <a href="#" onclick="showSignup()">Sign up</a></p>
      <p><a href="#" onclick="showForgotPassword()">Forgot Password?</a></p>
    </div>
  `;
}

function showSignup() {
  app.innerHTML = `
    <div class="container">
      <div class="banner">Signup</div>
      <input type="text" id="name" placeholder="Name">
      <input type="text" id="phone" placeholder="Phone Number">
      <input type="password" id="password" placeholder="Password">
      <input type="password" id="confirmPassword" placeholder="Confirm Password">
      <label><input type="checkbox" id="showPassword"> Show Password</label>
      <button onclick="signup()">Sign Up</button>
      <p>Already have an account? <a href="#" onclick="showLogin()">Login</a></p>
    </div>
  `;
  document.getElementById("showPassword").addEventListener("change", togglePasswordVisibility);
}

function showForgotPassword() {
  app.innerHTML = `
    <div class="container">
      <div class="banner">Forgot Password</div>
      <input type="text" id="phone" placeholder="Phone Number">
      <button onclick="resetPassword()">Reset Password</button>
      <p><a href="#" onclick="showLogin()">Back to Login</a></p>
    </div>
  `;
}

// =================== AUTH LOGIC ===================

function login() {
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value;
  const user = users.find(u => u.phone === phone && u.password === password);
  if (!user) return alert("Invalid credentials.");
  currentUser = user;
  showGroups();
}

function signup() {
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value;
  const confirm = document.getElementById("confirmPassword").value;
  if (password !== confirm) return alert("Passwords do not match.");
  if (users.find(u => u.phone === phone)) return alert("User already exists.");
  users.push({ name, phone, password });
  localStorage.setItem("buzzerUsers", JSON.stringify(users));
  alert("Signup successful.");
  showLogin();
}

function resetPassword() {
  const phone = document.getElementById("phone").value.trim();
  const user = users.find(u => u.phone === phone);
  if (!user) return alert("User not found.");
  const newPass = prompt("Enter new password:");
  if (!newPass) return;
  user.password = newPass;
  localStorage.setItem("buzzerUsers", JSON.stringify(users));
  alert("Password updated.");
  showLogin();
}

function togglePasswordVisibility() {
  const show = document.getElementById("showPassword").checked;
  document.getElementById("password").type = show ? "text" : "password";
  document.getElementById("confirmPassword").type = show ? "text" : "password";
}

// =================== GROUP SCREENS ===================

function showGroups() {
  const userGroups = groups.filter(g => g.owner === currentUser.phone);
  app.innerHTML = `
    <div class="container">
      <div class="banner">My Groups</div>
      ${userGroups.map(g => `
        <div class="group-section">
          <b>${g.name}</b><br>
          <button onclick="editGroup('${g.name}')">Edit</button>
          <button onclick="removeGroup('${g.name}')">Remove</button>
          <button onclick="buzzAll('${g.name}')">Buzz All</button>
        </div>
      `).join('')}
      <button onclick="createGroup()">Create New Group</button>
      <button class="logout" onclick="logout()">Logout</button>
    </div>
  `;
}

function createGroup() {
  const name = prompt("Group name:");
  if (!name) return;
  groups.push({ name: name.trim(), members: [], owner: currentUser.phone });
  saveGroups();
  showGroups();
}

function editGroup(name) {
  const group = groups.find(g => g.name === name && g.owner === currentUser.phone);
  if (!group) return;

  const membersList = group.members.map((m, i) => `
    <div>
      <input value="${m.name}" onchange="updateMember(${i}, 'name', this.value)">
      <input value="${m.phone}" onchange="updateMember(${i}, 'phone', this.value)">
      <input type="checkbox" class="select-member" data-index="${i}"> Select
      <button onclick="removeMember(${i})">Remove</button>
    </div>
  `).join("");

  app.innerHTML = `
    <div class="container">
      <div class="banner">Edit Group: ${group.name}</div>
      <input id="newGroupName" value="${group.name}" placeholder="New Group Name">
      <button onclick="updateGroupName('${group.name}')">Rename</button>
      ${membersList}
      <button onclick="addMember('${group.name}')">Add Member</button>
      <button onclick="buzzSelected('${group.name}')">Buzz Selected</button>
      <button onclick="removeGroup('${group.name}')">Delete Group</button>
      <button onclick="showGroups()">Back</button>
      <button class="logout" onclick="logout()">Logout</button>
    </div>
  `;
  window.editingGroup = group;
}

function updateGroupName(oldName) {
  const newName = document.getElementById("newGroupName").value.trim();
  if (newName && newName !== oldName) {
    window.editingGroup.name = newName;
    saveGroups();
    showGroups();
  }
}

function addMember(groupName) {
  const name = prompt("Member name:");
  const phone = prompt("Member phone:");
  if (!name || !phone) return;
  window.editingGroup.members.push({ name: name.trim(), phone: phone.trim() });
  saveGroups();
  editGroup(groupName);
}

function updateMember(index, field, value) {
  window.editingGroup.members[index][field] = value.trim();
  saveGroups();
}

function removeMember(index) {
  if (confirm("Remove this member?")) {
    window.editingGroup.members.splice(index, 1);
    saveGroups();
    editGroup(window.editingGroup.name);
  }
}

function removeGroup(name) {
  if (confirm(`Delete group "${name}"?`)) {
    groups = groups.filter(g => g.name !== name || g.owner !== currentUser.phone);
    saveGroups();
    showGroups();
  }
}

// =================== BUZZ ===================

function buzzAll(groupName) {
  const group = groups.find(g => g.name === groupName);
  if (!group) return;
  const phones = group.members.map(m => m.phone);
  sendBuzz(phones, "BUZZ from BUZZUR!");
}

function buzzSelected(groupName) {
  const group = groups.find(g => g.name === groupName);
  if (!group) return;
  const selected = Array.from(document.querySelectorAll(".select-member:checked"))
    .map(cb => group.members[cb.dataset.index]?.phone)
    .filter(Boolean);
  if (selected.length === 0) return alert("No members selected");
  sendBuzz(selected, "BUZZ just for YOU from BUZZUR!");
}

function sendBuzz(phoneNumbers, message) {
  socket.emit("buzz");
  fetch(`${SERVER_URL}/send-buzz`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phoneNumbers, message })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert("Buzz sent!");
      } else {
        alert("Buzz failed: " + data.error);
      }
    })
    .catch(err => {
      alert("Error sending buzz: " + err.message);
    });
}

// =================== UTILS ===================

function saveGroups() {
  localStorage.setItem("buzzerGroups", JSON.stringify(groups));
}

function logout() {
  currentUser = null;
  showLogin();
}
