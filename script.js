const app = document.getElementById("app");
let users = JSON.parse(localStorage.getItem("users")) || [];
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
let socket = io(); // Ensure your server is running and connected

function togglePassword(id) {
  const input = document.getElementById(id);
  if (input) input.type = input.type === "password" ? "text" : "password";
}

function showLogin() {
  app.innerHTML = `
    <div class="container">
      <div class="banner">Login</div>
      <input placeholder="Phone" id="loginPhone">
      <input placeholder="Password" id="loginPass" type="password">
      <label><input type="checkbox" onclick="togglePassword('loginPass')"> Show Password</label>
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
      <label><input type="checkbox" onclick="togglePassword('signupPass'); togglePassword('signupConfirm')"> Show Password</label>
      <button onclick="signup()">Sign Up</button>
      <a href="#" onclick="showLogin()">Back to Login</a>
    </div>`;
}

function showForgot() {
  app.innerHTML = `
    <div class="container">
      <div class="banner">Reset Password</div>
      <input placeholder="Phone" id="resetPhone">
      <input placeholder="New Password" id="resetPass" type="password">
      <label><input type="checkbox" onclick="togglePassword('resetPass')"> Show Password</label>
      <button onclick="resetPassword()">Reset</button>
      <a href="#" onclick="showLogin()">Back to Login</a>
    </div>`;
}

function login() {
  const phone = document.getElementById("loginPhone").value.trim();
  const pass = document.getElementById("loginPass").value;

  users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find(u => u.phone === phone && u.pass === pass);
  if (!user) return alert("Invalid phone or password");

  currentUser = user;
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  showGroups();
}

function signup() {
  const name = document.getElementById("signupName").value.trim();
  const phone = document.getElementById("signupPhone").value.trim();
  const pass = document.getElementById("signupPass").value;
  const confirm = document.getElementById("signupConfirm").value;

  if (!name || !phone || !pass) return alert("All fields are required");
  if (pass !== confirm) return alert("Passwords do not match");

  users = JSON.parse(localStorage.getItem("users")) || [];
  if (users.find(u => u.phone === phone)) return alert("Account already exists");

  users.push({ name, phone, pass });
  localStorage.setItem("users", JSON.stringify(users));
  alert("Account created! Please log in.");
  showLogin();
}

function resetPassword() {
  const phone = document.getElementById("resetPhone").value.trim();
  const newPass = document.getElementById("resetPass").value;

  users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find(u => u.phone === phone);
  if (!user) return alert("Account not found");

  user.pass = newPass;
  localStorage.setItem("users", JSON.stringify(users));
  alert("Password reset! Please log in.");
  showLogin();
}

function showGroups() {
  app.innerHTML = `
    <div class="container">
      <div class="banner">My Groups</div>
      <div id="groupList"></div>
      <button onclick="createGroup()">Create Group</button>
      <button onclick="logout()" style="margin-top:20px;">Logout</button>
    </div>`;
  renderGroups();
}

function renderGroups() {
  const groupList = document.getElementById("groupList");
  const groups = JSON.parse(localStorage.getItem("groups_" + currentUser.phone)) || [];

  groupList.innerHTML = groups.map((group, i) => `
    <div class="group">
      <input value="${group.name}" onchange="renameGroup(${i}, this.value)">
      <button onclick="removeGroup(${i})">Remove</button>
      <div id="members${i}">${group.members.map((m, j) => `
        <div class="member">
          <input value="${m.name}" onchange="updateMember(${i}, ${j}, 'name', this.value)">
          <input value="${m.phone}" onchange="updateMember(${i}, ${j}, 'phone', this.value)">
          <input type="checkbox" id="select${i}_${j}">
          <button onclick="removeMember(${i}, ${j})">X</button>
        </div>`).join('')}</div>
      <button onclick="addMember(${i})">Add Member</button>
      <button onclick="buzzSelected(${i})">Buzz Selected</button>
      <button onclick="buzzAll(${i})">Buzz All</button>
    </div>`).join('');
}

function createGroup() {
  const groups = JSON.parse(localStorage.getItem("groups_" + currentUser.phone)) || [];
  groups.push({ name: "New Group", members: [] });
  localStorage.setItem("groups_" + currentUser.phone, JSON.stringify(groups));
  renderGroups();
}

function renameGroup(index, newName) {
  const groups = JSON.parse(localStorage.getItem("groups_" + currentUser.phone)) || [];
  groups[index].name = newName;
  localStorage.setItem("groups_" + currentUser.phone, JSON.stringify(groups));
}

function removeGroup(index) {
  const groups = JSON.parse(localStorage.getItem("groups_" + currentUser.phone)) || [];
  groups.splice(index, 1);
  localStorage.setItem("groups_" + currentUser.phone, JSON.stringify(groups));
  renderGroups();
}

function addMember(groupIndex) {
  const groups = JSON.parse(localStorage.getItem("groups_" + currentUser.phone)) || [];
  groups[groupIndex].members.push({ name: "Name", phone: "Phone" });
  localStorage.setItem("groups_" + currentUser.phone, JSON.stringify(groups));
  renderGroups();
}

function updateMember(groupIndex, memberIndex, field, value) {
  const groups = JSON.parse(localStorage.getItem("groups_" + currentUser.phone)) || [];
  groups[groupIndex].members[memberIndex][field] = value;
  localStorage.setItem("groups_" + currentUser.phone, JSON.stringify(groups));
}

function removeMember(groupIndex, memberIndex) {
  const groups = JSON.parse(localStorage.getItem("groups_" + currentUser.phone)) || [];
  groups[groupIndex].members.splice(memberIndex, 1);
  localStorage.setItem("groups_" + currentUser.phone, JSON.stringify(groups));
  renderGroups();
}

function buzzAll(groupIndex) {
  const groups = JSON.parse(localStorage.getItem("groups_" + currentUser.phone)) || [];
  const group = groups[groupIndex];
  if (!group.members.length) return alert("No members to buzz.");
  group.members.forEach(m => buzz(m));
}

function buzzSelected(groupIndex) {
  const groups = JSON.parse(localStorage.getItem("groups_" + currentUser.phone)) || [];
  const group = groups[groupIndex];
  group.members.forEach((m, i) => {
    const checkbox = document.getElementById(`select${groupIndex}_${i}`);
    if (checkbox && checkbox.checked) buzz(m);
  });
}

function buzz(member) {
  const audio = document.getElementById("buzzSound");
  if (audio) audio.play();
  socket.emit("buzz", member);
  console.log("Buzzed", member);
}

function logout() {
  localStorage.removeItem("currentUser");
  currentUser = null;
  showLogin();
}

// Initial screen
if (currentUser) showGroups();
else showLogin();
