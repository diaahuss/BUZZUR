// ====== Socket.IO Setup ======
const socket = io();
socket.on("connect", () => console.log("Connected to server"));

socket.on("buzzReceived", (message) => {
  console.log("Buzz received:", message);
  const sound = document.getElementById("buzzSound");
  if (sound) sound.play();
  alert(message);
});

// ====== DOM Reference ======
const app = document.getElementById("app");

// ====== LocalStorage ======
let users = JSON.parse(localStorage.getItem("users")) || [];
let groups = JSON.parse(localStorage.getItem("groups")) || [];
let currentUser = JSON.parse(localStorage.getItem("currentUser"));

// ====== Auth Views ======
function showLogin() {
  app.innerHTML = `
    <div class="container">
      <div class="banner">Login</div>
      <input placeholder="Phone" id="loginPhone">
      <input placeholder="Password" id="loginPass" type="password">
      <button onclick="login()">Login</button>
      <a href="#" onclick="showSignup()">Sign Up</a> | <a href="#" onclick="showForgot()">Forgot Password?</a>
    </div>`;
}

function showSignup() {
  app.innerHTML = `
    <div class="container">
      <div class="banner">Sign Up</div>
      <input placeholder="Name" id="signupName">
      <input placeholder="Phone" id="signupPhone">
      <input placeholder="Password" id="signupPass" type="password">
      <input placeholder="Confirm Password" id="signupConfirm" type="password">
      <button onclick="signup()">Sign Up</button>
      <a href="#" onclick="showLogin()">Back to Login</a>
    </div>`;
}

function showForgot() {
  app.innerHTML = `
    <div class="container">
      <div class="banner">Forgot Password</div>
      <input placeholder="Phone" id="forgotPhone">
      <button onclick="resetPassword()">Reset</button>
      <a href="#" onclick="showLogin()">Back to Login</a>
    </div>`;
}

// ====== Auth Logic ======
function signup() {
  const name = document.getElementById("signupName").value;
  const phone = document.getElementById("signupPhone").value;
  const pass = document.getElementById("signupPass").value;
  const confirm = document.getElementById("signupConfirm").value;
  if (pass !== confirm) return alert("Passwords do not match");
  if (users.find(u => u.phone === phone)) return alert("User already exists");
  users.push({ name, phone, pass });
  localStorage.setItem("users", JSON.stringify(users));
  showLogin();
}

function login() {
  const phone = document.getElementById("loginPhone").value;
  const pass = document.getElementById("loginPass").value;
  const user = users.find(u => u.phone === phone && u.pass === pass);
  if (!user) return alert("Invalid credentials");
  currentUser = user;
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  showGroups();
}

function resetPassword() {
  const phone = document.getElementById("forgotPhone").value;
  const user = users.find(u => u.phone === phone);
  if (!user) return alert("User not found");
  const newPass = prompt("Enter new password");
  if (!newPass) return;
  user.pass = newPass;
  localStorage.setItem("users", JSON.stringify(users));
  alert("Password updated");
  showLogin();
}

function logout() {
  currentUser = null;
  localStorage.removeItem("currentUser");
  showLogin();
}

// ====== Group Logic ======
function showGroups() {
  const userGroups = groups.filter(g => g.owner === currentUser.phone);
  app.innerHTML = `
    <div class="container">
      <div class="banner">My Groups</div>
      ${userGroups.map(g => `
        <div class="group-section">
          <b>${g.name}</b>
          <div class="group-buttons">
            <button onclick="editGroup('${g.name}')">Edit</button>
            <button onclick="removeGroup('${g.name}')">Remove</button>
            <button onclick="buzzAll('${g.name}')">Buzz All</button>
          </div>
        </div>`).join('')}
      <button onclick="createGroup()">Create New Group</button>
      <button onclick="logout()">Logout</button>
    </div>`;
}

function createGroup() {
  const name = prompt("Enter group name");
  if (!name) return;
  groups.push({ name, owner: currentUser.phone, members: [] });
  localStorage.setItem("groups", JSON.stringify(groups));
  showGroups();
}

function removeGroup(name) {
  if (!confirm("Are you sure?")) return;
  groups = groups.filter(g => g.name !== name || g.owner !== currentUser.phone);
  localStorage.setItem("groups", JSON.stringify(groups));
  showGroups();
}

function editGroup(name) {
  const group = groups.find(g => g.name === name && g.owner === currentUser.phone);
  if (!group) return;
  app.innerHTML = `
    <div class="container">
      <div class="banner">Edit: ${group.name}</div>
      ${group.members.map((m, i) => `
        <div class="member-entry">
          <input type="text" placeholder="Name" value="${m.name}" onchange="updateMemberName('${name}', ${i}, this.value)">
          <input type="tel" placeholder="Phone" value="${m.phone}" onchange="updateMemberPhone('${name}', ${i}, this.value)">
          <input type="checkbox" class="member-select" data-index="${i}">
          <button onclick="removeMember('${name}', ${i})">Remove</button>
        </div>`).join('')}
      <button onclick="addMember('${name}')">Add Member</button>
      <button onclick="buzzSelected('${name}')">Buzz Selected</button>
      <button onclick="showGroups()">Back</button>
    </div>`;
}

function addMember(groupName) {
  const group = groups.find(g => g.name === groupName);
  group.members.push({ name: "", phone: "" });
  localStorage.setItem("groups", JSON.stringify(groups));
  editGroup(groupName);
}

function removeMember(groupName, index) {
  const group = groups.find(g => g.name === groupName);
  group.members.splice(index, 1);
  localStorage.setItem("groups", JSON.stringify(groups));
  editGroup(groupName);
}

function updateMemberName(groupName, index, newName) {
  const group = groups.find(g => g.name === groupName);
  group.members[index].name = newName;
  localStorage.setItem("groups", JSON.stringify(groups));
}

function updateMemberPhone(groupName, index, newPhone) {
  const group = groups.find(g => g.name === groupName);
  group.members[index].phone = newPhone;
  localStorage.setItem("groups", JSON.stringify(groups));
}

// ====== Buzzing ======
function buzzAll(groupName) {
  const group = groups.find(g => g.name === groupName);
  if (!group || group.members.length === 0) return alert("No members to buzz");

  const phones = group.members.map(m => m.phone).filter(Boolean);
  if (phones.length === 0) return alert("No valid phone numbers");

  console.log("Buzz All clicked");
  socket.emit("buzz", { from: currentUser.name || "Someone", phones });
}

function buzzSelected(groupName) {
  const checkboxes = document.querySelectorAll(".member-select");
  const group = groups.find(g => g.name === groupName);
  if (!group) return alert("Group not found");

  const phones = [...checkboxes]
    .filter(cb => cb.checked)
    .map(cb => group.members[cb.dataset.index].phone)
    .filter(Boolean);

  if (phones.length === 0) return alert("No members selected");

  console.log("Buzz Selected clicked");
  socket.emit("buzz", { from: currentUser.name || "Someone", phones });
}

// ====== Init ======
currentUser ? showGroups() : showLogin();
