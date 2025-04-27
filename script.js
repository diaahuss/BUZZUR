// script.js

const socket = io('https://buzzur-server.onrender.com');
const app = document.getElementById('app');

function playBuzzSound() {
  const audio = new Audio('buzz.mp3');
  audio.play();
}

function showAlert(message) {
  alert(message);
}

function renderLoginScreen() {
  app.innerHTML = `
    <div class="banner">BUZZUR</div>
    <div class="form">
      <h2>Login</h2>
      <input id="login-phone" type="text" placeholder="Phone Number">
      <input id="login-password" type="password" placeholder="Password">
      <div><input type="checkbox" id="show-login-password"> Show Password</div>
      <button id="login-btn">Login</button>
      <div class="links">
        <a id="to-forgot" href="#">Forgot Password?</a>
        <a id="to-signup" href="#">Sign Up</a>
      </div>
    </div>
  `;

  document.getElementById('login-btn').onclick = login;
  document.getElementById('to-signup').onclick = renderSignupScreen;
  document.getElementById('to-forgot').onclick = renderForgotPasswordScreen;
  document.getElementById('show-login-password').onchange = togglePassword.bind(null, 'login-password');
}

function renderSignupScreen() {
  app.innerHTML = `
    <div class="banner">BUZZUR</div>
    <div class="form">
      <h2>Sign Up</h2>
      <input id="signup-name" type="text" placeholder="Name">
      <input id="signup-phone" type="text" placeholder="Phone Number">
      <input id="signup-password" type="password" placeholder="Password">
      <input id="signup-confirm" type="password" placeholder="Confirm Password">
      <div><input type="checkbox" id="show-signup-password"> Show Password</div>
      <button id="signup-btn">Sign Up</button>
      <div class="links">
        <a id="to-login" href="#">Login</a>
      </div>
    </div>
  `;

  document.getElementById('signup-btn').onclick = signup;
  document.getElementById('to-login').onclick = renderLoginScreen;
  document.getElementById('show-signup-password').onchange = togglePassword.bind(null, 'signup-password', 'signup-confirm');
}

function renderForgotPasswordScreen() {
  app.innerHTML = `
    <div class="banner">BUZZUR</div>
    <div class="form">
      <h2>Forgot Password</h2>
      <input id="forgot-phone" type="text" placeholder="Phone Number">
      <input id="forgot-password" type="password" placeholder="New Password">
      <div><input type="checkbox" id="show-forgot-password"> Show Password</div>
      <button id="reset-btn">Reset Password</button>
      <div class="links">
        <a id="to-login" href="#">Login</a>
      </div>
    </div>
  `;

  document.getElementById('reset-btn').onclick = resetPassword;
  document.getElementById('to-login').onclick = renderLoginScreen;
  document.getElementById('show-forgot-password').onchange = togglePassword.bind(null, 'forgot-password');
}

function renderDashboard() {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  if (!user) return renderLoginScreen();

  app.innerHTML = `
    <div class="banner">My Groups</div>
    <div class="groups" id="groups"></div>
    <button id="create-group-btn">Create Group</button>
    <button id="logout-btn" class="logout">Logout</button>
  `;

  document.getElementById('create-group-btn').onclick = createGroup;
  document.getElementById('logout-btn').onclick = logout;

  loadGroups();
}

function togglePassword(...ids) {
  ids.forEach(id => {
    const input = document.getElementById(id);
    if (input) input.type = input.type === 'password' ? 'text' : 'password';
  });
}

function login() {
  const phone = document.getElementById('login-phone').value;
  const password = document.getElementById('login-password').value;
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u => u.phone === phone && u.password === password);

  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    renderDashboard();
  } else {
    showAlert('Invalid login.');
  }
}

function signup() {
  const name = document.getElementById('signup-name').value;
  const phone = document.getElementById('signup-phone').value;
  const password = document.getElementById('signup-password').value;
  const confirm = document.getElementById('signup-confirm').value;

  if (password !== confirm) {
    return showAlert('Passwords do not match.');
  }

  let users = JSON.parse(localStorage.getItem('users') || '[]');
  if (users.find(u => u.phone === phone)) {
    return showAlert('Phone already registered.');
  }

  const newUser = { name, phone, password, groups: [] };
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  showAlert('Signup successful!');
  renderLoginScreen();
}

function resetPassword() {
  const phone = document.getElementById('forgot-phone').value;
  const password = document.getElementById('forgot-password').value;
  let users = JSON.parse(localStorage.getItem('users') || '[]');

  const user = users.find(u => u.phone === phone);
  if (!user) return showAlert('Phone not found.');

  user.password = password;
  localStorage.setItem('users', JSON.stringify(users));
  showAlert('Password reset.');
  renderLoginScreen();
}

function logout() {
  localStorage.removeItem('currentUser');
  renderLoginScreen();
}

function loadGroups() {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  const groupsDiv = document.getElementById('groups');
  groupsDiv.innerHTML = '';

  user.groups.forEach((group, index) => {
    const div = document.createElement('div');
    div.className = 'group';
    div.innerHTML = `
      <input value="${group.name}" onchange="renameGroup(${index}, this.value)">
      <button onclick="deleteGroup(${index})">Remove Group</button>
      <button onclick="buzzGroup(${index})">Buzz All</button>
      <div id="members-${index}"></div>
      <button onclick="addMember(${index})">Add Member</button>
    `;
    groupsDiv.appendChild(div);
    renderMembers(group.members, index);
  });

  localStorage.setItem('currentUser', JSON.stringify(user));
}

function createGroup() {
  const name = prompt('Group name:');
  if (!name) return;

  const user = JSON.parse(localStorage.getItem('currentUser'));
  user.groups.push({ name, members: [] });
  localStorage.setItem('currentUser', JSON.stringify(user));
  loadGroups();
}

function renameGroup(index, newName) {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  user.groups[index].name = newName;
  localStorage.setItem('currentUser', JSON.stringify(user));
}

function deleteGroup(index) {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  user.groups.splice(index, 1);
  localStorage.setItem('currentUser', JSON.stringify(user));
  loadGroups();
}

function addMember(groupIndex) {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  user.groups[groupIndex].members.push({ name: '', phone: '' });
  localStorage.setItem('currentUser', JSON.stringify(user));
  loadGroups();
}

function renderMembers(members, groupIndex) {
  const membersDiv = document.getElementById(`members-${groupIndex}`);
  membersDiv.innerHTML = '';

  members.forEach((member, i) => {
    const div = document.createElement('div');
    div.className = 'member';
    div.innerHTML = `
      <input value="${member.name}" placeholder="Name" onchange="editMemberName(${groupIndex}, ${i}, this.value)">
      <input value="${member.phone}" placeholder="Phone" onchange="editMemberPhone(${groupIndex}, ${i}, this.value)">
      <button onclick="removeMember(${groupIndex}, ${i})">Remove</button>
    `;
    membersDiv.appendChild(div);
  });
}

function editMemberName(groupIndex, memberIndex, value) {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  user.groups[groupIndex].members[memberIndex].name = value;
  localStorage.setItem('currentUser', JSON.stringify(user));
}

function editMemberPhone(groupIndex, memberIndex, value) {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  user.groups[groupIndex].members[memberIndex].phone = value;
  localStorage.setItem('currentUser', JSON.stringify(user));
}

function removeMember(groupIndex, memberIndex) {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  user.groups[groupIndex].members.splice(memberIndex, 1);
  localStorage.setItem('currentUser', JSON.stringify(user));
  loadGroups();
}

function buzzGroup(groupIndex) {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  const group = user.groups[groupIndex];

  socket.emit('buzz', {
    groupName: group.name,
    members: group.members
  });

  showAlert('Buzz sent!');
  playBuzzSound();
}

socket.on('buzz', () => {
  playBuzzSound();
});

// Start with login screen
renderLoginScreen();
