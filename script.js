const socket = io('https://buzzur-server.onrender.com'); // WebSocket connection

const app = document.getElementById('app');

let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let users = JSON.parse(localStorage.getItem('users')) || [];
let groups = JSON.parse(localStorage.getItem('groups')) || [];

function saveData() {
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('groups', JSON.stringify(groups));
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

function renderApp() {
  app.innerHTML = '';

  const banner = document.createElement('div');
  banner.className = 'banner';
  banner.textContent = 'BUZZUR';
  app.appendChild(banner);

  if (!currentUser) {
    renderAuthForms();
  } else {
    renderGroups();
  }
}

function renderAuthForms() {
  const loginForm = document.createElement('form');
  loginForm.innerHTML = `
    <h2>Login</h2>
    <input type="text" placeholder="Phone" required />
    <input type="password" placeholder="Password" required />
    <button type="submit">Login</button>
  `;

  loginForm.onsubmit = (e) => {
    e.preventDefault();
    const phone = loginForm[0].value;
    const password = loginForm[1].value;

    const user = users.find(u => u.phone === phone && u.password === password);
    if (user) {
      currentUser = user;
      saveData();
      renderApp();
    } else {
      alert('Invalid phone or password.');
    }
  };

  const signupForm = document.createElement('form');
  signupForm.innerHTML = `
    <h2>Sign Up</h2>
    <input type="text" placeholder="Name" required />
    <input type="text" placeholder="Phone" required />
    <input type="password" placeholder="Password" required />
    <button type="submit">Sign Up</button>
  `;

  signupForm.onsubmit = (e) => {
    e.preventDefault();
    const name = signupForm[0].value;
    const phone = signupForm[1].value;
    const password = signupForm[2].value;

    if (users.find(u => u.phone === phone)) {
      alert('Phone already registered.');
      return;
    }

    const newUser = { name, phone, password };
    users.push(newUser);
    currentUser = newUser;
    saveData();
    renderApp();
  };

  app.appendChild(loginForm);
  app.appendChild(signupForm);
}

function renderGroups() {
  const groupForm = document.createElement('form');
  groupForm.innerHTML = `
    <h2>Create Group</h2>
    <input type="text" placeholder="Group Name" required />
    <button type="submit">Create</button>
  `;

  groupForm.onsubmit = (e) => {
    e.preventDefault();
    const name = groupForm[0].value;
    const group = {
      id: Date.now(),
      name,
      creator: currentUser.phone,
      members: []
    };
    groups.push(group);
    saveData();
    renderApp();
  };

  app.appendChild(groupForm);

  const myGroups = groups.filter(g => g.creator === currentUser.phone);
  myGroups.forEach(group => {
    const div = document.createElement('div');
    div.className = 'group';
    div.innerHTML = `
      <h3>${group.name}</h3>
      <button onclick="buzzGroup(${group.id})">Buzz All</button>
      <button onclick="editGroupName(${group.id})">Edit Name</button>
      <button onclick="removeGroup(${group.id})">Delete Group</button>
      <form onsubmit="addMember(event, ${group.id})">
        <input type="text" placeholder="Member Name" required />
        <input type="text" placeholder="Member Phone" required />
        <button type="submit">Add Member</button>
      </form>
      <div>${group.members.map((m, i) => `
        <div class="member">
          ${m.name} (${m.phone})
          <button onclick="removeMember(${group.id}, ${i})">Remove</button>
        </div>
      `).join('')}</div>
    `;
    app.appendChild(div);
  });

  const logoutBtn = document.createElement('div');
  logoutBtn.className = 'logout-button';
  logoutBtn.innerHTML = `<button onclick="logout()">Logout</button>`;
  app.appendChild(logoutBtn);
}

function logout() {
  currentUser = null;
  saveData();
  renderApp();
}

function editGroupName(id) {
  const group = groups.find(g => g.id === id);
  const newName = prompt('Enter new group name:', group.name);
  if (newName) {
    group.name = newName;
    saveData();
    renderApp();
  }
}

function removeGroup(id) {
  groups = groups.filter(g => g.id !== id);
  saveData();
  renderApp();
}

function addMember(e, groupId) {
  e.preventDefault();
  const name = e.target[0].value;
  const phone = e.target[1].value;
  const group = groups.find(g => g.id === groupId);
  group.members.push({ name, phone });
  saveData();
  renderApp();
}

function removeMember(groupId, memberIndex) {
  const group = groups.find(g => g.id === groupId);
  group.members.splice(memberIndex, 1);
  saveData();
  renderApp();
}

function buzzGroup(groupId) {
  const group = groups.find(g => g.id === groupId);
  if (!group || group.members.length === 0) {
    alert('Group has no members!');
    return;
  }

  socket.emit('buzz'); // Emit via WebSocket
  console.log(`Buzz sent to group: ${group.name}`);
  alert(`Buzz sent to all members in "${group.name}"`);
}

// WebSocket listener
socket.on('buzz', () => {
  alert('🔔 BUZZ ALERT!');
});

renderApp();
