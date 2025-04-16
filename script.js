const app = document.getElementById('app');
let currentUser = null;
let groups = JSON.parse(localStorage.getItem('buzzerGroups') || '[]');
let users = JSON.parse(localStorage.getItem('buzzerUsers') || '[]');

// Socket.IO setup
const socket = io('https://buzzur-server.onrender.com');  // Connect to the Render backend

socket.on('connect', () => {
  console.log('Connected to the server');
});

socket.on('buzzReceived', (message) => {
  alert(message);  // Display alert when a buzz is received
});

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
      <label class="show-password">
        <input type="checkbox" id="showPassword"> Show Password
      </label>
      <button onclick="signup()">Sign Up</button>
      <p>Already have an account? <a href="#" onclick="showLogin()">Login</a></p>
    </div>
  `;
  document.getElementById('showPassword').addEventListener('change', togglePasswordVisibility);
}

function togglePasswordVisibility() {
  const passwordField = document.getElementById('password');
  const confirmPasswordField = document.getElementById('confirmPassword');
  const isChecked = document.getElementById('showPassword').checked;
  passwordField.type = isChecked ? 'text' : 'password';
  confirmPasswordField.type = isChecked ? 'text' : 'password';
}

function showForgotPassword() {
  app.innerHTML = `
    <div class="container">
      <div class="banner">Forgot Password</div>
      <input type="text" id="phone" placeholder="Phone Number">
      <button onclick="resetPassword()">Reset Password</button>
      <p>Remembered your password? <a href="#" onclick="showLogin()">Login</a></p>
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
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (password !== confirmPassword) {
    alert('Passwords do not match');
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
          <div class="group-buttons">
            <button onclick="editGroup('${g.name}')">Edit</button>
            <button onclick="removeGroup('${g.name}')">Remove</button>
            <button onclick="buzzAll('${g.name}')">Buzz All</button>
          </div>
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

  let membersList = group.members.map((m, i) => `
    <div>
      <input value="${m.name}" onchange="updateMember(${i}, 'name', this.value)">
      <input value="${m.phone}" onchange="updateMember(${i}, 'phone', this.value)">
      <input type="checkbox" class="select-member" data-index="${i}"> Select
      <button onclick="removeMember(${i})">Remove Member</button>
    </div>
  `).join('');

  app.innerHTML = `
    <div class="container">
      <div class="banner">Edit Group: ${group.name}</div>
      <input type="text" id="newGroupName" placeholder="New Group Name" value="${group.name}">
      <button onclick="updateGroupName('${group.name}')">Update Group Name</button>
      ${membersList}
      <button onclick="addMember('${group.name}')">Add Member</button>
      <button onclick="removeGroup('${group.name}')">Remove Group</button>
      <button onclick="buzzSelected('${group.name}')">Buzz Selected Members</button>
      <button onclick="showGroups()">Back</button>
      <button onclick="logout()">Logout</button>
    </div>
  `;
  window.editingGroup = group;
}

function updateGroupName(oldName) {
  const newName = document.getElementById('newGroupName').value;
  if (newName && newName !== oldName) {
    window.editingGroup.name = newName;
    saveGroups();
    showGroups();
  }
}

function addMember(groupName) {
  const name = prompt('Member name:');
  const phone = prompt('Member phone:');
  if (name && phone) {
    window.editingGroup.members.push({ name, phone });
    saveGroups();
    editGroup(groupName);
  }
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

  // Emit a buzz event to the backend
  socket.emit('buzzAll', { groupName, members: group.members });

  alert(`Buzz sent to all members: ${group.members.map(m => m.name).join(', ')}`);
}

function buzzSelected(groupName) {
  const group = groups.find(g => g.name === groupName);
  if (!group) return;

  const selectedMembers = Array.from(document.querySelectorAll('.select-member:checked'))
    .map(checkbox => group.members[checkbox.dataset.index].name);

  if (selectedMembers.length > 0) {
    // Emit a buzz event to the backend
    socket.emit('buzzSelected', { groupName, selectedMembers });

    alert(`Buzz sent to selected members: ${selectedMembers.join(', ')}`);
  } else {
    alert('No members selected');
  }
}

function saveGroups() {
  localStorage.setItem('buzzerGroups', JSON.stringify(groups));
}

showLogin();
