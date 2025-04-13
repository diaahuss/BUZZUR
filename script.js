const socket = io();
const app = document.getElementById('app');
let currentUser = null;
let groups = JSON.parse(localStorage.getItem('buzzerGroups') || '[]');
let users = JSON.parse(localStorage.getItem('buzzerUsers') || '[]');

// All your login/signup/group management code (same as CodePen version)
... // we'll paste the full version in a follow-up if needed

function buzzAll(groupName) {
  const group = groups.find(g => g.name === groupName);
  if (!group) return;
  const buzzedNames = group.members.map(m => m.name).join(', ');
  alert(`Buzz sent to all: ${buzzedNames}`);
  socket.emit('buzz', { members: group.members });
  document.getElementById('buzzSound').play();
}

function buzzSelected(groupName) {
  const group = groups.find(g => g.name === groupName);
  if (!group) return;
  const selected = Array.from(document.querySelectorAll('.select-member:checked'))
    .map(cb => group.members[cb.dataset.index]);
  if (selected.length) {
    const names = selected.map(m => m.name).join(', ');
    alert(`Buzz sent to selected: ${names}`);
    socket.emit('buzz', { members: selected });
    document.getElementById('buzzSound').play();
  } else {
    alert('No members selected');
  }
}

socket.on('buzz', () => {
  document.getElementById('buzzSound').play();
});

showLogin();
