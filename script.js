const app = document.getElementById('app');
const socket = io();

// Load stored users and groups
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

function saveUsers() {
  localStorage.setItem('users', JSON.stringify(users));
}

function saveCurrentUser() {
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

function playBuzzSound() {
  const buzzSound = document.getElementById('buzz-sound');
  if (buzzSound) buzzSound.play();
}

socket.on('buzz', playBuzzSound);

function renderScreen(content) {
  app.innerHTML = content;
}

function renderLogin() {
  renderScreen(`
    <h2>Login</h2>
    <input type="text" placeholder="Phone Number" id="login-phone">
    <input type="password" placeholder="Password" id="login-password">
    <label><input type="checkbox" id="login-show-password"> Show Password</label>
    <button id="login-btn">Login</button>
    <div class="links">
      <span id="forgot-link">Forgot Password?</span>
      <span id="signup-link" class="right-link">Sign Up</span>
    </div>
  `);

  document.getElementById('login-show-password').onchange = e => {
    document.getElementById('login-password').type = e.target.checked ? 'text' : 'password';
  };

  document.getElementById('signup-link').onclick = renderSignup;
  document.getElementById('forgot-link').onclick = renderForgot;
  document.getElementById('login-btn').onclick = () => {
    const phone = document.getElementById('login-phone').value.trim();
    const password = document.getElementById('login-password').value;
    const user = users.find(u => u.phone === phone && u.password === password);
    if (user) {
      currentUser = user;
      saveCurrentUser();
      renderDashboard();
    } else {
      alert('Invalid login');
    }
  };
}

function renderSignup() {
  renderScreen(`
    <h2>Sign Up</h2>
    <input type="text" placeholder="Name" id="signup-name">
    <input type="text" placeholder="Phone Number" id="signup-phone">
    <input type="password" placeholder="Password" id="signup-password">
    <input type="password" placeholder="Confirm Password" id="signup-confirm">
    <label><input type="checkbox" id="signup-show-password"> Show Password</label>
    <button id="signup-btn">Sign Up</button>
    <div class="links">
      <span id="login-link">Back to Login</span>
    </div>
  `);

  document.getElementById('signup-show-password').onchange = e => {
    document.getElementById('signup-password').type =
    document.getElementById('signup-confirm').type = e.target.checked ? 'text' : 'password';
  };

  document.getElementById('login-link').onclick = renderLogin;
  document.getElementById('signup-btn').onclick = () => {
    const name = document.getElementById('signup-name').value.trim();
    const phone = document.getElementById('signup-phone').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;

    if (!name || !phone || !password || !confirm) return alert('Fill all fields');
    if (password !== confirm) return alert('Passwords do not match');
    if (users.find(u => u.phone === phone)) return alert('User already exists');

    const newUser = { name, phone, password, groups: [] };
    users.push(newUser);
    saveUsers();
    alert('Signup successful! You can now log in.');
    renderLogin();
  };
}

function renderForgot() {
  renderScreen(`
    <h2>Reset Password</h2>
    <input type="text" placeholder="Phone Number" id="reset-phone">
    <input type="password" placeholder="New Password" id="reset-password">
    <label><input type="checkbox" id="reset-show-password"> Show Password</label>
    <button id="reset-btn">Reset</button>
    <div class="links">
      <span id="login-link">Back to Login</span>
    </div>
  `);

  document.getElementById('reset-show-password').onchange = e => {
    document.getElementById('reset-password').type = e.target.checked ? 'text' : 'password';
  };

  document.getElementById('login-link').onclick = renderLogin;
  document.getElementById('reset-btn').onclick = () => {
    const phone = document.getElementById('reset-phone').value.trim();
    const password = document.getElementById('reset-password').value;
    const user = users.find(u => u.phone === phone);
    if (!user) return alert('User not found');
    user.password = password;
    saveUsers();
    alert('Password updated.');
    renderLogin();
  };
}

function renderDashboard() {
  const user = currentUser;
  renderScreen(`
    <h2>My Groups</h2>
    <div id="groups-container"></div>
    <button id="create-group-btn">+ Create Group</button>
    <button id="logout-btn" style="background-color: red; margin-top: 20px;">Logout</button>
  `);

  const container = document.getElementById('groups-container');
  user.groups.forEach((group, gi) => {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'group';
    groupDiv.innerHTML = `
      <input value="${group.name}" placeholder="Group Name" data-gi="${gi}" class="group-name">
      <button onclick="removeGroup(${gi})">Delete Group</button>
      <div class="members">
        ${group.members.map((m, mi) => `
          <div class="member">
            <input value="${m.name}" placeholder="Member Name" data-gi="${gi}" data-mi="${mi}" class="member-name">
            <input value="${m.phone}" placeholder="Phone" data-gi="${gi}" data-mi="${mi}" class="member-phone">
            <button onclick="removeMember(${gi}, ${mi})">Remove</button>
            <input type="checkbox" class="buzz-check" data-gi="${gi}" data-mi="${mi}">
          </div>
        `).join('')}
      </div>
      <button onclick="addMember(${gi})">+ Add Member</button>
      <button onclick="buzzSelected(${gi})">Buzz Selected</button>
      <button onclick="buzzAll(${gi})">Buzz All</button>
    `;
    container.appendChild(groupDiv);
  });

  document.getElementById('create-group-btn').onclick = () => {
    user.groups.push({ name: 'New Group', members: [] });
    saveUsers();
    renderDashboard();
  };

  document.getElementById('logout-btn').onclick = () => {
    currentUser = null;
    saveCurrentUser();
    renderLogin();
  };

  // Event delegation for editing
  container.querySelectorAll('.group-name').forEach(input => {
    input.onchange = e => {
      const gi = +e.target.dataset.gi;
      user.groups[gi].name = e.target.value;
      saveUsers();
    };
  });

  container.querySelectorAll('.member-name').forEach(input => {
    input.onchange = e => {
      const gi = +e.target.dataset.gi;
      const mi = +e.target.dataset.mi;
      user.groups[gi].members[mi].name = e.target.value;
      saveUsers();
    };
  });

  container.querySelectorAll('.member-phone').forEach(input => {
    input.onchange = e => {
      const gi = +e.target.dataset.gi;
      const mi = +e.target.dataset.mi;
      user.groups[gi].members[mi].phone = e.target.value;
      saveUsers();
    };
  });
}

// Group/member actions
function removeGroup(index) {
  currentUser.groups.splice(index, 1);
  saveUsers();
  renderDashboard();
}

function addMember(gi) {
  currentUser.groups[gi].members.push({ name: '', phone: '' });
  saveUsers();
  renderDashboard();
}

function removeMember(gi, mi) {
  currentUser.groups[gi].members.splice(mi, 1);
  saveUsers();
  renderDashboard();
}

function buzzSelected(gi) {
  const group = currentUser.groups[gi];
  const checks = document.querySelectorAll(`.buzz-check[data-gi="${gi}"]`);
  const phones = Array.from(checks).filter(c => c.checked).map(c => group.members[+c.dataset.mi].phone);
  if (phones.length) {
    socket.emit('buzz', phones);
  } else {
    alert('No members selected');
  }
}

function buzzAll(gi) {
  const phones = currentUser.groups[gi].members.map(m => m.phone);
  socket.emit('buzz', phones);
}

// Initialize
if (currentUser) renderDashboard();
else renderLogin();
