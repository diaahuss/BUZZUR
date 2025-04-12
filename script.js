// Ensure socket is connected (already created in HTML)
const socket = window.socket;

// Sample structure for storing groups in localStorage
let groups = JSON.parse(localStorage.getItem('buzzur-groups')) || [];
let currentGroup = null;

const app = document.getElementById('app');

function renderDashboard() {
  app.innerHTML = `
    <h1>BUZZUR</h1>
    <div>
      <input type="text" id="group-name" placeholder="Group name" />
      <button id="create-group">Create Group</button>
    </div>
    <div id="group-list">
      ${groups.map((group, index) => `
        <div>
          <strong>${group.name}</strong>
          <button onclick="selectGroup(${index})">Select</button>
        </div>
      `).join('')}
    </div>
    <div id="selected-group"></div>
  `;

  document.getElementById('create-group').addEventListener('click', () => {
    const name = document.getElementById('group-name').value.trim();
    if (!name) return alert('Enter group name');
    const newGroup = { name, members: [] };
    groups.push(newGroup);
    localStorage.setItem('buzzur-groups', JSON.stringify(groups));
    renderDashboard();
  });
}

window.selectGroup = function (index) {
  currentGroup = groups[index];
  renderGroupUI();
};

function renderGroupUI() {
  app.innerHTML = `
    <h1>${currentGroup.name}</h1>
    <div>
      <input type="text" id="member-name" placeholder="Name" />
      <input type="text" id="member-phone" placeholder="Phone" />
      <button id="add-member">Add Member</button>
    </div>
    <ul>
      ${currentGroup.members.map(member => `
        <li>${member.name} (${member.phone})</li>
      `).join('')}
    </ul>
    <button id="buzz-group">Buzz Group</button>
    <button id="back">Back</button>
    <div id="status"></div>
  `;

  document.getElementById('add-member').addEventListener('click', () => {
    const name = document.getElementById('member-name').value.trim();
    const phone = document.getElementById('member-phone').value.trim();
    if (!name || !phone) return alert('Enter both name and phone');
    currentGroup.members.push({ name, phone });
    localStorage.setItem('buzzur-groups', JSON.stringify(groups));
    renderGroupUI();
  });

  document.getElementById('buzz-group').addEventListener('click', () => {
    if (!currentGroup || currentGroup.members.length === 0) {
      return alert('Add members to buzz');
    }

    socket.emit('buzz', {
      groupName: currentGroup.name,
      members: currentGroup.members,
    });

    document.getElementById('status').textContent = 'Buzz sent!';
  });

  document.getElementById('back').addEventListener('click', () => {
    renderDashboard();
  });
}

// 🔊 Play buzz sound when alert is received from server
socket.on('buzz', (data) => {
  const audio = document.getElementById('buzz-sound');
  audio.play();
  alert(`Buzz received from: ${data.groupName}`);
});

// Start the app
renderDashboard();
