const app = document.getElementById('app');
let currentUser = null;
let groups = JSON.parse(localStorage.getItem('buzzerGroups') || '[]');
let users = JSON.parse(localStorage.getItem('buzzerUsers') || '[]');

function showLogin() {
  app.innerHTML = `
    <div class="container">
      <div class="banner">Login</div>
      <input type="text" id="phone" placeholder="Phone Number">
      <input type="password" id="password" placeholder="Password">
      <label><input type="checkbox" onclick="togglePassword('password')"> Show Password</label>
      <button onclick="login()">Login</button>
      <p>Don't have an account? <a href="#" onclick="showSignup()">Sign up</a></p>
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
      <label><input type="checkbox" onclick="togglePassword('password', 'confirmPassword')"> Show Password</label>
      <button onclick="signup()">Sign Up</button>
      <p>Already have an account? <a href="#" onclick="showLogin()">Login</a></p>
    </div>
  `;
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
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (password !== confirmPassword) {
    alert('Passwords do not match!');
    return;
  }

  if (users.find(u => u.phone === phone)) {
    alert('User already exists');
    return;
  }

  const newUser = { name, phone, password };
  users.push(newUser);
  localStorage.setItem('buzzerUsers', JSON.stringify(users));
  alert('Signup successful');
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
          <button onclick="buzz('${g.name}')">Buzz All</button>
          <button onclick="editGroup('${g.name}')">Edit</button>
        </div>
      `).join('')}
      <button onclick="createGroup()">Create New Group</button>
      <button onclick="logout()">Logout</button>
    </div>
  `;
}

function createGroup() {
  const groupName = prompt('Enter group name:');
  if (!groupName) return;
  const newGroup = { name: groupName, members: [], owner: currentUser.phone };
  groups.push(newGroup);
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
      <button onclick="removeMember(${i})">Remove</button>
    </div>
  `).join('');
  app.innerHTML = `
    <div class="container">
      <div class="banner">Edit Group: ${group.name}</div>
      ${membersList}
      <button onclick="addMember()">Add Member</button>
      <button onclick="showGroups()">Back</button>
      <button onclick="logout()">Logout</button>
    </div>
  `;
  window.editingGroup = group;
}

function addMember() {
  const name = prompt('Member name:');
  const phone = prompt('Member phone:');
  if (!name || !phone) return;
  window.editingGroup.members.push({ name, phone });
  saveGroups();
  editGroup(window.editingGroup.name);
}

function removeMember(index) {
  window.editingGroup.members.splice(index, 1);
  saveGroups();
  editGroup(window.editingGroup.name);
}

function updateMember(index, field, value) {
  window.editingGroup.members[index][field] = value;
  saveGroups();
}

function saveGroups() {
  localStorage.setItem('buzzerGroups', JSON.stringify(groups));
}

function buzz(groupName) {
  const group = groups.find(g => g.name === groupName);
  if (!group) return;
  alert(`Buzz sent to ${group.members.map(m => m.name).join(', ')}`);
}

function togglePassword(...ids) {
  ids.forEach(id => {
    const field = document.getElementById(id);
    field.type = field.type === 'password' ? 'text' : 'password';
  });
}

showLogin();

