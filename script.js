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

  group.members.forEach(member => {
    if (member.phone) {
      socket.emit('buzz', { to: member.phone });
    }
  });

  playBuzzSound();
}

// Listen for buzz
socket.on('receive-buzz', () => {
  playBuzzSound();
});

// Initialize app
renderLoginScreen();
