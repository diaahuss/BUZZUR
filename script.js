// Connect to server
const socket = io('https://buzzur-server.onrender.com');

const app = document.getElementById('app');

function renderLoginScreen() {
  app.innerHTML = `
    <div class="banner">BUZZUR</div>
    <div class="form">
      <h2>Login</h2>
      <input type="text" id="phone" placeholder="Phone Number" />
      <input type="password" id="password" placeholder="Password" />
      <label><input type="checkbox" id="showPassword"> Show Password</label>
      <button onclick="login()">Login</button>
      <p><a href="#" onclick="renderSignupScreen()">Sign Up</a> | <a href="#" onclick="renderForgotPasswordScreen()">Forgot Password</a></p>
    </div>
  `;
  document.getElementById('showPassword').addEventListener('change', togglePassword);
}

function renderSignupScreen() {
  app.innerHTML = `
    <div class="banner">BUZZUR</div>
    <div class="form">
      <h2>Sign Up</h2>
      <input type="text" id="name" placeholder="Name" />
      <input type="text" id="phone" placeholder="Phone Number" />
      <input type="password" id="password" placeholder="Password" />
      <label><input type="checkbox" id="showPassword"> Show Password</label>
      <button onclick="signup()">Sign Up</button>
      <p><a href="#" onclick="renderLoginScreen()">Back to Login</a></p>
    </div>
  `;
  document.getElementById('showPassword').addEventListener('change', togglePassword);
}

function renderForgotPasswordScreen() {
  app.innerHTML = `
    <div class="banner">BUZZUR</div>
    <div class="form">
      <h2>Forgot Password</h2>
      <input type="text" id="phone" placeholder="Phone Number" />
      <button onclick="resetPassword()">Reset Password</button>
      <p><a href="#" onclick="renderLoginScreen()">Back to Login</a></p>
    </div>
  `;
}

function renderGroupsScreen() {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  app.innerHTML = `
    <div class="banner">My Groups</div>
    <div class="groups">
      ${user.groups.map((g, i) => `<button onclick="openGroup(${i})">${g.name}</button>`).join('')}
    </div>
    <div class="form">
      <input type="text" id="newGroupName" placeholder="New Group Name" />
      <button onclick="createGroup()">Create Group</button>
      <button onclick="logout()" style="background: red;">Logout</button>
    </div>
  `;
}

function renderGroupDetailsScreen(groupIndex) {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  const group = user.groups[groupIndex];

  app.innerHTML = `
    <div class="banner">${group.name}</div>
    <div class="form">
      <input type="text" id="editGroupName" value="${group.name}" />
      <button onclick="saveGroupName(${groupIndex})">Save Name</button>
      <h3>Members</h3>
      <div class="members">
        ${group.members.map((m, j) => `
          <div>
            <input type="text" value="${m.name}" onchange="editMemberName(${groupIndex}, ${j}, this.value)" />
            <input type="text" value="${m.phone}" onchange="editMemberPhone(${groupIndex}, ${j}, this.value)" />
            <button onclick="removeMember(${groupIndex}, ${j})">Remove</button>
          </div>
        `).join('')}
      </div>
      <input type="text" id="newMemberName" placeholder="Member Name" />
      <input type="text" id="newMemberPhone" placeholder="Member Phone" />
      <button onclick="addMember(${groupIndex})">Add Member</button>
      <hr>
      <button onclick="buzzGroup(${groupIndex})">Buzz All</button>
      <button onclick="deleteGroup(${groupIndex})" style="background: red;">Delete Group</button>
      <button onclick="renderGroupsScreen()" style="background: gray;">Back</button>
    </div>
  `;
}

// Auth Functions
function signup() {
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const password = document.getElementById('password').value;

  if (!name || !phone || !password) return alert('Please fill all fields');

  const user = { name, phone, password, groups: [] };
  localStorage.setItem(`user_${phone}`, JSON.stringify(user));
  alert('Sign Up Successful!');
  renderLoginScreen();
}

function login() {
  const phone = document.getElementById('phone').value.trim();
  const password = document.getElementById('password').value;

  const user = JSON.parse(localStorage.getItem(`user_${phone}`));
  if (!user || user.password !== password) return alert('Invalid credentials');

  localStorage.setItem('currentUser', JSON.stringify(user));
  renderGroupsScreen();
}

function resetPassword() {
  const phone = document.getElementById('phone').value.trim();
  const user = JSON.parse(localStorage.getItem(`user_${phone}`));
  if (!user) return alert('User not found');

  user.password = '1234';
  localStorage.setItem(`user_${phone}`, JSON.stringify(user));
  alert('Password reset to 1234');
  renderLoginScreen();
}

function logout() {
  localStorage.removeItem('currentUser');
  renderLoginScreen();
}

// Group Functions
function createGroup() {
  const groupName = document.getElementById('newGroupName').value.trim();
  if (!groupName) return alert('Enter group name');

  const user = JSON.parse(localStorage.getItem('currentUser'));
  user.groups.push({ name: groupName, members: [] });
  localStorage.setItem('currentUser', JSON.stringify(user));
  renderGroupsScreen();
}

function openGroup(index) {
  renderGroupDetailsScreen(index);
}

function saveGroupName(groupIndex) {
  const newName = document.getElementById('editGroupName').value.trim();
  const user = JSON.parse(localStorage.getItem('currentUser'));
  user.groups[groupIndex].name = newName;
  localStorage.setItem('currentUser', JSON.stringify(user));
  renderGroupDetailsScreen(groupIndex);
}

function deleteGroup(index) {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  user.groups.splice(index, 1);
  localStorage.setItem('currentUser', JSON.stringify(user));
  renderGroupsScreen();
}

function addMember(groupIndex) {
  const name = document.getElementById('newMemberName').value.trim();
  const phone = document.getElementById('newMemberPhone').value.trim();
  if (!name || !phone) return alert('Enter name and phone');

  const user = JSON.parse(localStorage.getItem('currentUser'));
  user.groups[groupIndex].members.push({ name, phone });
  localStorage.setItem('currentUser', JSON.stringify(user));
  renderGroupDetailsScreen(groupIndex);
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
  renderGroupDetailsScreen(groupIndex);
}

function buzzGroup(groupIndex) {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  const group = user.groups[groupIndex];

  group.members.forEach(member => {
    if (member.phone) {
      socket.emit('buzz', { to: member.phone });
    }
  });
  playBuzzSound();
}

function togglePassword() {
  const passwordInput = document.getElementById('password');
  passwordInput.type = document.getElementById('showPassword').checked ? 'text' : 'password';
}

function playBuzzSound() {
  const audio = new Audio('buzz.mp3');
  audio.play();
}

// Receive Buzz	socket.on('receive-buzz', playBuzzSound);

// Initialize
renderLoginScreen();
