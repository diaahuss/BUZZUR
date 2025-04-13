const socket = window.socket;

let groups = JSON.parse(localStorage.getItem('buzzur-groups')) || [];
let currentGroup = null;
const app = document.getElementById('app');

// Render Main Dashboard
function renderDashboard() {
  app.innerHTML = `
    <h1>BUZZUR</h1>
    <input type="text" id="group-name" placeholder="Group name" />
    <button id="create-group">Create Group</button>
    <div id="group-list" class="controls"></div>
  `;

  document.getElementById('create-group').addEventListener('click', () => {
    const name = document.getElementById('group-name').value.trim();
    if (!name) return alert('Enter group name');
    const newGroup = { name, members: [] };
    groups.push(newGroup);
    saveGroups();
    renderDashboard();
  });

  const groupListDiv = document.getElementById('group-list');
  groups.forEach((group, index) => {
    const div = document.createElement('div');
    div.className = 'group-card';
    div.innerHTML = `
      <h3>${group.name}</h3>
      <button>Select</button>
    `;
    div.querySelector('button').addEventListener('click', () => {
      currentGroup = groups[index];
      renderGroupUI();
    });
    groupListDiv.appendChild(div);
  });
}

// Render Group View
function renderGroupUI() {
  app.innerHTML = `
    <h1>${currentGroup.name}</h1>
    <input type="text" id="member-name" placeholder="Member name" />
    <input type="tel" id="member-phone" placeholder="Phone number" />
    <button id="add-member">Add Member</button>
    <ul id="member-list"></ul>
    <div class="controls">
      <button id="buzz-group">Buzz Group</button>
      <button id="back">Back</button>
    </div>
    <div id="status"></div>
  `;

  updateMemberList();

  document.getElementById('add-member').addEventListener('click', () => {
    const name = document.getElementById('member-name').value.trim();
    const phone = document.getElementById('member-phone').value.trim();
    if (!name || !phone) return alert('Enter both name and phone');
    currentGroup.members.push({ name, phone });
    saveGroups();
    updateMemberList();
  });

  document.getElementById('buzz-group').addEventListener('click', () => {
    if (!currentGroup || currentGroup.members.length === 0) {
      return alert('Add members to buzz');
    }

    socket.emit('buzz', {
      groupName: currentGroup.name,
      members: currentGroup.members,
    });

    document.getElementById('status').textContent = '✅ Buzz sent!';
  });

  document.getElementById('back').addEventListener('click', renderDashboard);
}

// Update Member List
function updateMemberList() {
  const list = document.getElementById('member-list');
  list.innerHTML = '';
  currentGroup.members.forEach(member => {
    const li = document.createElement('li');
    li.textContent = `${member.name} (${member.phone})`;
    list.appendChild(li);
  });
}

// Save to localStorage
function saveGroups() {
  localStorage.setItem('buzzur-groups', JSON.stringify(groups));
}

// Handle incoming buzz
socket.on('buzz', (data) => {
  const audio = document.getElementById('buzz-sound');
  audio.play();
  alert(`Buzz received from: ${data.groupName}`);
});

// Initial Load
renderDashboard();
