// Connect to the server using Socket.IO
const socket = io();  // Make sure this is your server's connection

// Play the buzz sound when a buzz is received
socket.on('buzzReceived', (message) => {
  // Play the sound
  document.getElementById('buzzSound').play();

  // Optionally show an alert with the buzz message
  alert(message);
});

// Function to handle the buzz-all action
function buzzAll(groupName) {
  const message = `Buzzing all members of ${groupName}`;
  socket.emit('buzzAll', { groupName, message });
  console.log(`Buzz sent to all members of ${groupName}`);

  // Optionally play the buzz sound immediately
  document.getElementById('buzzSound').play();
}

// Function to handle the buzz-selected action
function buzzSelected(groupName) {
  const selectedMembers = getSelectedMembers();  // Assuming you have a way to get selected members
  const message = `Buzzing selected members of ${groupName}`;

  socket.emit('buzzSelected', { groupName, selectedMembers, message });
  console.log(`Buzz sent to selected members of ${groupName}`);

  // Optionally play the buzz sound immediately
  document.getElementById('buzzSound').play();
}

// Function to get selected members (you'll need to define this based on your UI)
function getSelectedMembers() {
  // Placeholder logic, replace with actual UI selection logic
  return ['member1', 'member2'];  // Example, update with actual selected members
}

// Function to handle creating a group
function createGroup() {
  // Your create group logic here
}

// Function to handle logging out
function logout() {
  // Your logout logic here
  console.log('User logged out');
}

// Show groups function to render the list of groups for the user
function showGroups() {
  const userGroups = groups.filter(g => g.owner === currentUser.phone);
  app.innerHTML = `
    <div class="container">
      <div class="banner">My Groups</div>
      ${userGroups.map(g => `
        <div class="group-section">
          <b>${g.name}</b><br>
          <button onclick="editGroup('${g.name}')">Edit</button>
          <button onclick="removeGroup('${g.name}')">Remove</button>
          <button onclick="buzzAll('${g.name}')">Buzz All</button>
          <button onclick="buzzSelected('${g.name}')">Buzz Selected</button>
        </div>
      `).join('')}
      <button onclick="createGroup()">Create New Group</button>
      <button onclick="logout()">Logout</button>
    </div>
  `;
}

// Add any other necessary functions like editGroup, removeGroup, etc.

