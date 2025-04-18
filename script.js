// Ensure the app container is present
const app = document.getElementById('app');
if (!app) {
  console.error("App container not found.");
}

// Initialize Socket.IO client with proper URL
const socket = io('https://your-app-name.onrender.com'); // Replace with your actual Render app URL

// Retrieve groups and users from localStorage or initialize as empty arrays
let groups = JSON.parse(localStorage.getItem('groups') || '[]');
let users = JSON.parse(localStorage.getItem('users') || '[]');

// Function to update the UI with the current user's information
function updateCurrentUser() {
  if (currentUser) {
    app.innerHTML = `<h2>Welcome, ${currentUser.name}</h2>`;
  } else {
    app.innerHTML = `<h2>Welcome, Guest</h2>`;
  }
}

// Listen for 'buzzed' events from the server
socket.on('buzzed', (data) => {
  console.log('Buzz received:', data);
  // Handle the 'buzzed' event (e.g., update UI, notify user)
});

// Emit a 'buzz' event to the server
function buzzAll(groupId) {
  const group = groups.find(g => g.id === groupId);
  if (group && group.members.length) {
    socket.emit('buzz', { groupId, members: group.members });
  }
}

// Example usage: Set current user and update UI
let currentUser = users[0]; // Assuming the first user is the current user
updateCurrentUser();
