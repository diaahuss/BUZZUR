const app = document.getElementById("app");
let users = JSON.parse(localStorage.getItem("buzzerUsers")) || [];
let groups = JSON.parse(localStorage.getItem("buzzerGroups")) || [];
let currentUser = null;
let showPass = false;

function saveUsers() {
  localStorage.setItem("buzzerUsers", JSON.stringify(users));
}

function saveGroups() {
  localStorage.setItem("buzzerGroups", JSON.stringify(groups));
}

function showLogin() {
  app.innerHTML = `
    <div class="container">
      <div class="banner">BUZZUR</div>
      <input type="text" placeholder="Phone Number" id="loginPhone">
      <input type="${showPass ? "text" : "password"}" placeholder="Password" id="loginPass">
      <button onclick="togglePassword()">Show Password</button>
      <button onclick="login()">Login</button>
      <div class="link-row">
        <span onclick="showSignup()">Sign Up</span>
        <span onclick="showForgot()">Forgot Password</span>
      </div>
    </div>
  `;
}

function showSignup() {
  app.innerHTML = `
    <div class="container">
      <div class="banner">Sign Up</div>
      <input type="text" placeholder="Name" id="signupName">
      <input type="text" placeholder="Phone Number" id="signupPhone">
      <input type="${showPass ? "text" : "password"}" placeholder="Password" id="signupPass">
      <input type="${showPass ? "text" : "password"}" placeholder="Confirm Password" id="signupConfirm">
      <button onclick="togglePassword()">Show Password</button>
      <button onclick="signup()">Sign Up</button>
      <div class="link-row"><span onclick="showLogin()">Back to Login</span></div>
    </div>
  `;
}

function showForgot() {
  app.innerHTML = `
    <div class="container">
      <div class="banner">Forgot Password</div>
      <input type="text" placeholder="Phone Number" id="forgotPhone">
      <button onclick="resetPassword()">Reset Password</button>
      <div class="link-row"><span onclick="showLogin()">Back to Login</span></div>
    </div>
  `;
}

function togglePassword() {
  showPass = !showPass;
  currentUser ? showGroups() : showLogin();
}

function login() {
  const phone = document.getElementById("loginPhone").value;
  const pass = document.getElementById("loginPass").value;
  const user = users.find(u => u.phone === phone && u.pass === pass);
  if (user) {
    currentUser = user;
    showGroups();
  } else {
    alert("Invalid phone or password");
  }
}

function signup() {
  const name = document.getElementById("signupName").value;
  const phone = document.getElementById("signupPhone").value;
  const pass = document.getElementById("signupPass").value;
  const confirm = document.getElementById("signupConfirm").value;
  if (users.find(u => u.phone === phone)) {
    alert("Phone already registered");
    return;
  }
  if (pass !== confirm) {
    alert("Passwords do not match");
    return;
  }
  const user = { name, phone, pass };
  users.push(user);
  saveUsers();
  alert("Signup successful. Please login.");
  showLogin();
}

function resetPassword() {
  const phone = document.getElementById("forgotPhone").value;
  const user = users.find(u => u.phone === phone);
  if (user) {
    const newPass = prompt("Enter new password:");
    if (newPass) {
      user.pass = newPass;
      saveUsers();
      alert("Password reset successful.");
      showLogin();
    }
  } else {
    alert("User not found.");
  }
}

function logout() {
  currentUser = null;
  showLogin();
}

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
      <button onclick="logout()">Logout</button>
    </div>
  `;
}

function createGroup() {
  const groupName = prompt("Enter group name:");
  if (!groupName) return;
  const newGroup = { name: groupName, members: [], owner: currentUser.phone };
  groups.push(newGroup);
  saveGroups();
  showGroups();
}

function editGroup(name) {
  const group = groups.find(g => g.name === name && g.owner === currentUser.phone);
  if (!group) return;

  let membersList = group.members.map((m, i) => `
    <div>
      <input value="${m.name}" onchange="updateMember(${i}, 'name', this.value)">
      <input value="${m.phone}" onchange="updateMember(${i}, 'phone', this.value)">
      <input type="checkbox" class="select-member" data-index="${i}"> Select
      <button onclick="removeMember(${i})">Remove</button>
    </div>
  `).join('');

  app.innerHTML = `
    <div class="container">
      <div class="banner">Edit Group: ${group.name}</div>
      <input type="text" id="newGroupName" value="${group.name}">
      <button onclick="updateGroupName('${group.name}')">Update Name</button>
      ${membersList}
      <button onclick="addMember('${group.name}')">Add Member</button>
      <button onclick="buzzSelected('${group.name}')">Buzz Selected</button>
      <button onclick="removeGroup('${group.name}')">Remove Group</button>
      <button onclick="showGroups()">Back</button>
      <button onclick="logout()">Logout</button>
    </div>
  `;
  window.editingGroup = group;
}

function updateGroupName(oldName) {
  const newName = document.getElementById("newGroupName").value;
  if (newName && newName !== oldName) {
    window.editingGroup.name = newName;
    saveGroups();
    showGroups();
  }
}

function addMember(groupName) {
  const name = prompt("Member name:");
  const phone = prompt("Member phone:");
  if (name && phone) {
    window.editingGroup.members.push({ name, phone });
    saveGroups();
    editGroup(groupName);
  }
}

function updateMember(index, field, value) {
  window.editingGroup.members[index][field] = value;
  saveGroups();
}

function removeMember(index) {
  window.editingGroup.members.splice(index, 1);
  saveGroups();
  editGroup(window.editingGroup.name);
}

function removeGroup(name) {
  const groupIndex = groups.findIndex(g => g.name === name && g.owner === currentUser.phone);
  if (groupIndex > -1) {
    groups.splice(groupIndex, 1);
    saveGroups();
    showGroups();
  }
}

function buzzAll(groupName) {
  const group = groups.find(g => g.name === groupName);
  if (!group) return;
  alert(`Buzz sent to: ${group.members.map(m => m.name).join(', ')}`);
}

function buzzSelected(groupName) {
  const group = groups.find(g => g.name === groupName);
  if (!group) return;

  const selected = Array.from(document.querySelectorAll(".select-member:checked"))
    .map(cb => group.members[cb.dataset.index].name);
  alert(selected.length ? `Buzz sent to: ${selected.join(", ")}` : "No members selected.");
}

showLogin();
