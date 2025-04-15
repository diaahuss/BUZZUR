const app = document.getElementById('app');
let currentUser = null;
let groups = JSON.parse(localStorage.getItem('buzzerGroups') || '[]');
let users = JSON.parse(localStorage.getItem('buzzerUsers') || '[]');

function saveGroups() {
  localStorage.setItem('buzzerGroups', JSON.stringify(groups));
}

function showLogin() {
  app.innerHTML = `
    <div class="container">
      <div class="banner">Login</div>
      <input type="text" id="phone" placeholder="Phone Number">
      <input type="password" id="password" placeholder="Password">
      <button onclick="login()">Login</button>
      <p>
        <a href="#" onclick="showForgotPassword()">Forgot Password?</a>
        <span style="float: right;"><a href="#" onclick="showSignup()">Sign up</a></span>
      </p>
    </div>
  `;
}

function showSignup() {
  app.innerHTML = `
    <div class="container">
      <div class="banner">Sign Up</div>
      <input type="text" id="name" placeholder="Name">
      <input type="text" id="phone" placeholder="Phone Number">
      <input type="password" id="password" placeholder="Password">
      <input type="password" id="confirmPassword" placeholder="Confirm Password">
      <label><input type="checkbox" id="showPassword"> Show Password</label>
      <button onclick="signup()">Sign Up</button>
      <p>Already have an account? <a href="#" onclick="showLogin()">Login</a></p>
    </div>
  `;

  document.getElementById('showPassword').addEventListener('change', () => {
    const pwd = document.getElementById('password');
    const confirm = document.getElementById('confirmPassword');
    const visible = document.getElementById('showPassword').checked;
    pwd.type = visible ? 'text' : 'password';
    confirm.type = visible ? 'text' : 'password';
  });
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

function resetPassword() {
  const phone = document.getElementById('phone').value;
  const user = users.find(u => u.phone === phone);
  if (user) {
    const newPassword = prompt('Enter a new password');
    user.password = newPassword;
    localStorage.setItem('buzzerUsers', JSON.stringify(users));
    alert('Password reset successful');
    showLogin();
  } else {
    alert('User not found');
  }
}

function login() {
  const phone = document.getElementById('phone').value;
  const password = document.getElementById('password').value;
  const user = users.find(u => u.phone === phone && u.password === password);
  if (user) {
    currentUser = user;
    showGroups();
  } else {
    alert('Invalid login');
  }
}

function signup() {
  const name = document.getElementById('name').value;
  const phone = document.getElementById('phone').value;
  const password = document.getElementById('password').value;
  const confirm = document.getElementById('confirmPassword').value;

  if (password !== confirm) return alert("Passwords don't match.");
  if (users.some(u => u.phone === phone)) return alert("User already exists.");

  const newUser = { name, phone, password };
  users.push(newUser);
  localStorage.setItem('buzzerUsers', JSON.stringify(users));
  alert("Signup successful");
  showLogin();
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
      <button onclick="logout()" style="margin-top: 20px;">Logout</button>
    </div>
  `;
}

function createGroup() {
  const groupName = prompt("Enter new group name:");
  if (!groupName) return;
  groups.push({ name: groupName, members: [], owner: currentUser.phone });
  saveGroups();
  showGroups();
}

function editGroup(name) {
  const group = groups.find(g => g.name === name && g.owner === currentUser.phone);
  if (!group) return;
  window.editingGroup = group;

  const memberInputs = group.members.map((m, i) => `
    <div style="margin-bottom: 10px;">
      <input value="${m.name}" onchange="updateMember(${i}, 'name', this.value)" placeholder="Name" style="display:block; width: 100%;">
      <input value="${m.phone}" onchange="updateMember(${i}, 'phone', this.value)" placeholder="Phone" style="display:block; width: 100%; margin-top: 5px;">
      <input type="checkbox" class="select-member" data-index="${i}"> Select
      <button onclick="removeMember(${i})">Remove</button>
    </div>
  `).join('');

  app.innerHTML = `
    <div class="container">
      <div class="banner">Edit Group: ${group.name}</div>
      <input type="text" id="newGroupName" value="${group.name}" placeholder="New Group Name" style="width: 100%;">
      <button onclick="updateGroupName('${group.name}')">Update Name</button>
      ${memberInputs}
      <button onclick="addMember()">Add Member</button>
      <button onclick="buzzSelected('${group.name}')">Buzz Selected</button>
      <button onclick="removeGroup('${group.name}')">Remove Group</button>
      <button onclick="showGroups()">Back</button>
      <button onclick="logout()">Logout</button>
    </div>
  `;
}

function updateGroupName(oldName) {
  const newName = document.getElementById('newGroupName').value;
  if (newName && newName !== oldName) {
    window.editingGroup.name = newName;
    saveGroups();
    showGroups();
  }
}

function addMember() {
  const name = prompt("Member name:");
  const phone = prompt("Member phone:");
  if (name && phone) {
    window.editingGroup.members.push({ name, phone });
    saveGroups();
    editGroup(window.editingGroup.name);
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
  groups = groups.filter(g => !(g.name === name && g.owner === currentUser.phone));
  saveGroups();
  showGroups();
}

function buzzAll(name) {
  const group = groups.find(g => g.name === name);
  if (!group) return;
  alert("Buzz sent to: " + group.members.map(m => m.name).join(', '));
}

function buzzSelected(name) {
  const group = groups.find(g => g.name === name);
  if (!group) return;
  const selected = Array.from(document.querySelectorAll('.select-member:checked'))
    .map(cb => group.members[cb.dataset.index].name);
  alert(selected.length > 0 ? `Buzzed: ${selected.join(', ')}` : 'No members selected');
}

showLogin();
