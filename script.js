// Data for groups
let groups = [];

// Function to create a new group
function createGroup() {
  const groupName = document.getElementById('groupName').value;
  if (!groupName) {
    alert('Please enter a group name');
    return;
  }
  
  // Create new group with name and empty members
  const newGroup = {
    name: groupName,
    members: []
  };
  
  groups.push(newGroup);
  renderGroups();
}

// Function to add a member to the selected group
function addMemberToGroup() {
  const groupName = document.getElementById('groupName').value;
  const memberName = document.getElementById('memberName').value;
  const memberPhone = document.getElementById('memberPhone').value;
  
  if (!memberName || !memberPhone) {
    alert('Please enter both member name and phone number');
    return;
  }

  const group = groups.find(g => g.name === groupName);
  if (!group) {
    alert('Group not found');
    return;
  }

  // Add the new member to the group
  group.members.push({ name: memberName, phone: memberPhone });
  renderGroups();
}

// Function to render groups on the page
function renderGroups() {
  const groupListElement = document.getElementById('groupList');
  groupListElement.innerHTML = ''; // Clear the list before re-rendering
  
  groups.forEach(group => {
    const groupItem = document.createElement('li');
    groupItem.innerHTML = `${group.name} - Members: ${group.members.map(m => m.name).join(', ')}`;
    groupListElement.appendChild(groupItem);
  });
}

// Function to buzz all members in the selected group
function buzzGroup() {
  const groupName = document.getElementById('groupName').value;
  
  const group = groups.find(g => g.name === groupName);
  if (!group) {
    alert('Group not found');
    return;
  }

  // Loop through each member and alert them (replace with sound functionality later)
  group.members.forEach(member => {
    alert(`Buzz sent to ${member.name} at phone number ${member.phone}`);
    // Placeholder for actual buzzing functionality
  });
}

// Function to log out the user (reset app state for now)
function logout() {
  groups = [];
  renderGroups();
  alert('Logged out successfully');
}
