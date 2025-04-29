const app = document.getElementById('app');
const banner = document.getElementById('banner');

let groups = [];
let currentGroup = null;
const socket = io();

// --- Initial Login Screen ---
function renderLogin() {
  banner.textContent = "BUZZALL";
  app.innerHTML = `
    <h2>Login</h2>
    <input type="text" placeholder="Phone Number" id="loginPhone">
    <input type="password" placeholder="Password" id="loginPass">
    <button onclick="handleLogin()">Login</button>
  `;
}

// --- My Groups Screen ---
function renderMyGroups() {
  banner.textContent = "MY GROUPS";
  app.innerHTML = `
    <h2>Welcome!</h2>
    <div class="group-buttons">
      <button onclick="renderGroupList()">List of Created Groups</button>
      <button onclick="renderCreateGroup()">Create Group</button>
    </div>
  `;
}

// --- Create Group Screen ---
function renderCreateGroup() {
  app.innerHTML = `
    <h3>Create Group</h3>
    <input type="text" placeholder="Group Name" id="newGroupName">
    <button onclick="createGroup()">Save Group</button>
    <button onclick="renderMyGroups()">Back</button>
  `;
}

function createGroup() {
  const name = document.getElementById('newGroupName').value.trim();
  if (!name) return alert("Group name required");
  groups.push({ name, members: [] });
  renderMyGroups();
}

// --- List of Groups ---
function renderGroupList() {
  if (groups.length === 0) {
    app.innerHTML = `<p>No groups yet.</p><button onclick="renderMyGroups()">Back</button>`;
    return;
  }

  app.innerHTML = `<h3>Your Groups</h3>`;
  groups.forEach((group, index) => {
    const btn = document.createElement('button');
    btn.textContent = group.name;
    btn.onclick = () => renderGroupDetail(index);
    app.appendChild(btn);
  });
  const backBtn = document.createElement('button');
  backBtn.textContent = "Back";
  backBtn.onclick = renderMyGroups;
  app.appendChild(backBtn);
}

// --- Group Detail Screen ---
function renderGroupDetail(index) {
  currentGroup = index;
  banner.textContent = "THIS GROUP";
  const group = groups[index];

  app.innerHTML = `
    <h3>${group.name}</h3>
    <button onclick="editGroupName()">Edit Name</button>
    <button onclick="addMember()">Add Member</button>
    <button onclick="removeMember()">Remove Member</button>
    <button onclick="buzzSelected()">Buzz Selected</button>
    <button onclick="buzzAll()">Buzz All</button>
    <button onclick="renderMyGroups()">Back</button>
    <div id="memberList"></div>
  `;

  renderMembers();
}

function editGroupName() {
  const newName = prompt("Enter new group name:");
  if (newName) {
    groups[currentGroup].name = newName;
    renderGroupDetail(currentGroup);
  }
}

function addMember() {
  const name = prompt("Member name:");
  const phone = prompt("Phone number:");
  if (name && phone) {
    groups[currentGroup].members.push({ name, phone });
    renderGroupDetail(currentGroup);
  }
}

function removeMember() {
  const name = prompt("Enter member name to remove:");
  if (!name) return;
  groups[currentGroup].members = groups[currentGroup].members.filter(m => m.name !== name);
  renderGroupDetail(currentGroup);
}

function renderMembers() {
  const list = document.getElementById("memberList");
  list.innerHTML = '';
  groups[currentGroup].members.forEach((member, i) => {
    const div = document.createElement('div');
    div.className = 'member';
    div.innerHTML = `
      <input type="checkbox" id="member-${i}">
      <label for="member-${i}">${member.name} (${member.phone})</label>
    `;
    list.appendChild(div);
  });
}

function buzzSelected() {
  const selected = [];
  groups[currentGroup].members.forEach((m, i) => {
    if (document.getElementById(`member-${i}`).checked) {
      selected.push(m.phone);
    }
  });
  if (selected.length === 0) return alert("No members selected");
  socket.emit('buzz', selected);
  document.getElementById('buzzSound').play();
}

function buzzAll() {
  const allPhones = groups[currentGroup].members.map(m => m.phone);
  if (allPhones.length === 0) return alert("No members in group");
  socket.emit('buzz', allPhones);
  document.getElementById('buzzSound').play();
}

function handleLogin() {
  // Simulated login
  const phone = document.getElementById('loginPhone').value;
  const pass = document.getElementById('loginPass').value;
  if (phone && pass) {
    renderMyGroups();
  } else {
    alert("Enter phone and password");
  }
}

renderLogin();
