const app = document.getElementById('app');
let currentUser = null;
let groups = JSON.parse(localStorage.getItem('buzzerGroups') || '[]');
let users = JSON.parse(localStorage.getItem('buzzerUsers') || '[]');

function showLogin() {
  app.innerHTML = `
    <div class="container">
      <h2>Login</h2>
      <input type="text" id="phone" placeholder="Phone Number">
      <input type="password" id="password" placeholder="Password">
      <button onclick="login()">Login</button>
      <p>Don't have an account? <a href="#" onclick="showSignup()">Sign up</a></p>
    </div>
  `;
}

function showSignup() {
  app.innerHTML = `
    <div class="container">
      <h2>Signup</h2>
      <input type="text" id="name" placeholder="Name">
      <input type="text" id="phone" placeholder="Phone Number">
      <input type="password" id="password" placeholder="Password">
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

function showGroups() {
  const userGroups = groups.filter(g => g.owner === currentUser.phone);
  app.innerHTML = `
    <div class="container">
      <h2>Your Groups</h2>
      ${userGroups.map(g => `
        <div>
          <b>${g.name}</b> 
          <button onclick="buzz('${g.name}')">Buzz All</button> 
          <button onclick="editGroup('${g.name}')">Edit</button>
        </div>
      `).join('')}
      <button onclick="createGroup()">Create New Group</button>
    </div>
  `;
}

function createGroup() {
  const groupName = prompt('Enter group name:');
  if (!groupName) return;
  const newGroup = { name: groupName, members: [], owner: currentUser.phone };
  groups.push(newGroup);
  localStorage.setItem('buzzerGroups', JSON.stringify(groups));
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
      <h2>Edit Group: ${group.name}</h2>
      <div>${membersList}</div>
      <button onclick="addMember()">Add Member</button>
      <button onclick="showGroups()">Back</button>
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

showLogin();
