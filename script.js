// Global variables
let currentUser = null; // Will hold the current user object
let groups = []; // Array to store groups
const app = document.getElementById('app'); // Main app container

// Function to display the login screen
function showLogin() {
  app.innerHTML = `
    <div class="container">
      <div class="banner">Login</div>
      <input type="text" id="phone" placeholder="Phone Number" />
      <input type="password" id="password" placeholder="Password" />
      <button onclick="login()">Login</button>
      <a href="javascript:void(0);" onclick="showSignup()">Don't have an account? Sign Up</a>
    </div>
  `;
}

// Function to display the signup screen
function showSignup() {
  app.innerHTML = `
    <div class="container">
      <div class="banner">Sign Up</div>
      <input type="text" id="name" placeholder="Full Name" />
      <input type="text" id="phone" placeholder="Phone Number" />
      <input type="password" id="password" placeholder="Password" />
      <input type="password" id="confirmPassword" placeholder="Confirm Password" />
      <button onclick="signup()">Sign Up</button>
      <a href="javascript:void(0);" onclick="showLogin()">Already have an account? Login</a>
    </div>
  `;
}

// Function to handle login
function login() {
  const phone = document.getElementById('phone').value;
  const password = document.getElementById('password').value;
  
  // Simulate login (replace with actual logic or API call)
  currentUser = { phone, name: "User" }; // Replace with real user data
  
  // Display the groups screen
  showGroups();
}

// Function to handle signup
function signup() {
  const name = document.getElementById('name').value;
  const phone = document.getElementById('phone').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  // Simulate signup (replace with actual logic or API call)
  currentUser = { phone, name };

  // Display the groups screen
  showGroups();
}

// Function to show the groups page
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
        </div>
      `).join('')}
      <button onclick="createGroup()">Create New Group</button>
      <button onclick="logout()">Logout</button>
    </div>
  `;
}

// Function to create a new group
function createGroup() {
  const groupName = prompt("Enter group name:");

  if (groupName) {
    const newGroup = {
      name: groupName,
      owner: currentUser.phone,
      members: []
    };
    groups.push(newGroup);
    showGroups();
  }
}

// Function to edit a group (placeholder)
function editGroup(groupName) {
  alert(`Editing group: ${groupName}`);
  // Add your editing logic here
}

// Function to remove a group
function removeGroup(groupName) {
  groups = groups.filter(g => g.name !== groupName);
  showGroups();
}

// Function to handle buzzing all members in a group
function buzzAll(groupName) {
  const group = groups.find(g => g.name === groupName);

  if (!group) {
    alert("Group not found.");
    return;
  }

  // Send a buzz to all group members
  group.members.forEach(member => {
    buzz(member.phone);
  });

  alert("Buzz sent to all members!");
}

// Function to simulate buzzing a user (using WebSocket or similar in real app)
function buzz(phoneNumber) {
  // Simulate a buzz sound being sent
  console.log(`Buzz sent to ${phoneNumber}`);
  // Play the buzz sound
  document.getElementById('buzzSound').play();
}

// Function to logout
function logout() {
  currentUser = null;
  groups = [];
  showLogin();
}

// Initialize the app to show the login screen
showLogin();
