const app = document.getElementById('app');
const buzzAudio = document.getElementById('buzz-audio');

const SERVER_URL = 'https://buzzur-server.onrender.com'; // <<<<<< Updated to your Render URL
const socket = io(SERVER_URL); // <<<<<< Connect to your server via socket.io

let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser'));
let groups = JSON.parse(localStorage.getItem('groups')) || [];

function saveData() {
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  localStorage.setItem('groups', JSON.stringify(groups));
}

function playBuzzSound() {
  if (buzzAudio) buzzAudio.play();
}

// Listen for buzz events from server
socket.on('buzz', () => {
  console.log('Buzz received!');
  playBuzzSound();
});

function showLogin() {
  app.innerHTML = `
    <div class="banner">BUZZALL</div>
    <div class="container">
      <h2>Login</h2>
      <input type="text" id="login-phone" placeholder="Phone Number" />
      <input type="password" id="login-password" placeholder="Password" />
      <button onclick="login()">Login</button>
      <p>
        <a href="#" onclick="showSignup()">Sign Up</a> |
        <a href="#" onclick="showForgotPassword()">Forgot Password?</a>
      </p>
    </div>
  `;
}

function showSignup() {
  app.innerHTML = `
    <div class="banner">BUZZALL</div>
    <div class="container">
      <h2>Sign Up</h2>
      <input type="text" id="signup-name" placeholder="Name" />
      <input type="text" id="signup-phone" placeholder="Phone Number" />
      <input type="password" id="signup-password" placeholder="Password" />
      <input type="password" id="signup-confirm" placeholder="Confirm Password" />
      <button onclick="signup()">Sign Up</button>
      <p><a href="#" onclick="showLogin()">Back to Login</a></p>
    </div>
  `;
}

function showForgotPassword() {
  app.innerHTML = `
    <div class="banner">BUZZALL</div>
    <div class="container">
      <h2>Reset Password</h2>
      <input type="text" id="reset-phone" placeholder="Phone Number" />
      <input type="password" id="reset-password" placeholder="New Password" />
      <button onclick="resetPassword()">Reset Password</button>
      <p><a href="#" onclick="showLogin()">Back to Login</a></p>
    </div>
  `;
}

function showGroups() {
  const userGroups = groups.filter(g => g.owner === currentUser.phone);
  app.innerHTML = `
    <div class="banner">BUZZALL</div>
    <div class="container">
      <h2>My Groups</h2>
      <button onclick="createGroup()">+ New Group</button>
      <div id="group-list">
        ${userGroups.map(group => `
          <div class="group">
            <strong>${group.name}</strong>
            <button onclick="editGroup('${group.name}')">Edit</button>
            <button onclick="removeGroup('${group.name}')">Remove</button>
            <button onclick="buzzAll('${group.name}')">Buzz All</button>
            <div class="member-list">
              ${group.members.map((m, idx) => `
                <div class="member">
                  <input type="checkbox" class="select-member" data-index="${idx}" />
                  <input type="text" value="${m.name}" disabled />
                  <input type="text" value="${m.phone}" disabled />
                </div>
              `).join('')}
            </div>
            <button onclick="buzzSelected('${group.name}')">Buzz Selected</button>
          </div>
        `).join('')}
      </div>
      <button onclick="logout()" class="logout">Logout</button>
    </div>
  `;
}

function createGroup() {
  const groupName = prompt('Enter group name:');
  if (groupName) {
    groups.push({ name: groupName, owner: currentUser.phone, members: [] });
    saveData();
    showGroups();
  }
}

function editGroup(name) {
  const group = groups.find(g => g.name === name && g.owner === currentUser.phone);
  if (!group) return;

  app.innerHTML = `
    <div class="banner">BUZZALL</div>
    <div class="container">
      <h2>Edit Group: ${group.name}</h2>
      <button onclick="renameGroup('${group.name}')">Rename Group</button>
      <h3>Members</h3>
      <div class="member-list">
        ${group.members.map((m, i) => `
          <div>
            <input value="${m.name}" onchange="updateMember('${group.name}', ${i}, 'name', this.value)" />
            <input value="${m.phone}" onchange="updateMember('${group.name}', ${i}, 'phone', this.value)" />
            <button onclick="removeMember('${group.name}', ${i})">Remove</button>
          </div>
        `).join('')}
      </div>
      <button onclick="addMember('${group.name}')">+ Add Member</button>
      <button onclick="showGroups()">Back</button>
    </div>
  `;
}

function renameGroup(name) {
  const newName = prompt('New group name:');
  if (!newName) return;
  const group = groups.find(g => g.name === name && g.owner === currentUser.phone);
  group.name = newName;
  saveData();
  showGroups();
}

function addMember(groupName) {
  const name = prompt('Member name:');
  const phone = prompt('Member phone:');
  if (!name || !phone) return;
  const group = groups.find(g => g.name === groupName && g.owner === currentUser.phone);
  group.members.push({ name, phone });
  saveData();
  editGroup(groupName);
}

function removeGroup(name) {
  groups = groups.filter(g => g.name !== name || g.owner !== currentUser.phone);
  saveData();
  showGroups();
}

function updateMember(groupName, index, field, value) {
  const group = groups.find(g => g.name === groupName && g.owner === currentUser.phone);
  if (!group) return;
  group.members[index][field] = value;
  saveData();
}

function removeMember(groupName, index) {
  const group = groups.find(g => g.name === groupName && g.owner === currentUser.phone);
  group.members.splice(index, 1);
  saveData();
  editGroup(groupName);
}

async function buzzAll(groupName) {
  const group = groups.find(g => g.name === groupName);
  if (!group) return;

  try {
    await fetch(`${SERVER_URL}/send-buzz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phones: group.members.map(m => m.phone) })
    });

    playBuzzSound();
    alert(`Buzz sent to: ${group.members.map(m => m.name).join(', ')}`);
  } catch (error) {
    console.error('Error sending buzz:', error);
    alert('Failed to send buzz. Please try again.');
  }
}

async function buzzSelected(groupName) {
  const group = groups.find(g => g.name === groupName);
  if (!group) return;

  const selectedIndexes = Array.from(document.querySelectorAll('.select-member:checked')).map(cb => parseInt(cb.dataset.index));
  const selectedMembers = selectedIndexes.map(i => group.members[i]);

  if (!selectedMembers.length) {
    alert('No members selected');
    return;
  }

  try {
    await fetch(`${SERVER_URL}/send-buzz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phones: selectedMembers.map(m => m.phone) })
    });

    playBuzzSound();
    alert(`Buzz sent to: ${selectedMembers.map(m => m.name).join(', ')}`);
  } catch (error) {
    console.error('Error sending buzz:', error);
    alert('Failed to send buzz. Please try again.');
  }
}

function login() {
  const phone = document.getElementById('login-phone').value.trim();
  const password = document.getElementById('login-password').value;
  const user = users.find(u => u.phone === phone && u.password === password);
  if (user) {
    currentUser = user;
    saveData();
    showGroups();
  } else {
    alert('Invalid credentials');
  }
}

function signup() {
  const name = document.getElementById('signup-name').value.trim();
  const phone = document.getElementById('signup-phone').value.trim();
  const password = document.getElementById('signup-password').value;
  const confirm = document.getElementById('signup-confirm').value;

  if (password !== confirm) {
    alert('Passwords do not match');
    return;
  }
  if (users.find(u => u.phone === phone)) {
    alert('User already exists');
    return;
  }

  const user = { name, phone, password };
  users.push(user);
  currentUser = user;
  saveData();
  showGroups();
}

function resetPassword() {
  const phone = document.getElementById('reset-phone').value.trim();
  const password = document.getElementById('reset-password').value;
  const user = users.find(u => u.phone === phone);
  if (user) {
    user.password = password;
    saveData();
    alert('Password reset successful');
    showLogin();
  } else {
    alert('User not found');
  }
}

function logout() {
  currentUser = null;
  saveData();
  showLogin();
}

// Initial load
if (currentUser) {
  showGroups();
} else {
  showLogin();
}
