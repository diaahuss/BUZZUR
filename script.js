// Global variables
const socket = io();

// DOM Elements
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const forgotPasswordForm = document.getElementById('forgot-password-form');
const groupsContainer = document.getElementById('groups-container');
const logoutButton = document.getElementById('logout-btn');
const buzzButton = document.getElementById('buzz-btn');
const createGroupButton = document.getElementById('create-group-btn');

// Group and Member Data
let groups = [];
let currentUser = {};

// Utility Functions
function renderLoginForm() {
  loginForm.style.display = 'block';
  signupForm.style.display = 'none';
  forgotPasswordForm.style.display = 'none';
}

function renderSignupForm() {
  loginForm.style.display = 'none';
  signupForm.style.display = 'block';
  forgotPasswordForm.style.display = 'none';
}

function renderForgotPasswordForm() {
  loginForm.style.display = 'none';
  signupForm.style.display = 'none';
  forgotPasswordForm.style.display = 'block';
}

function renderGroups() {
  groupsContainer.innerHTML = ''; // Clear previous groups
  groups.forEach((group) => {
    const groupCard = document.createElement('div');
    groupCard.className = 'group-card';
    groupCard.innerHTML = `
      <h3>${group.name}</h3>
      <div class="member-inputs">
        ${group.members.map((member) => `
          <input type="text" placeholder="Name" value="${member.name}" readonly />
          <input type="text" placeholder="Phone" value="${member.phone}" readonly />
        `).join('')}
      </div>
      <div class="actions">
        <button class="edit-group-btn" data-group-id="${group.id}">Edit Group</button>
        <button class="remove-group-btn" data-group-id="${group.id}">Remove Group</button>
        <button class="buzz-selected-btn" data-group-id="${group.id}">Buzz Selected</button>
        <button class="add-member-btn" data-group-id="${group.id}">Add Member</button>
      </div>
    `;
    groupsContainer.appendChild(groupCard);
  });
}

function updateGroup(groupId, newGroupData) {
  const groupIndex = groups.findIndex((g) => g.id === groupId);
  if (groupIndex > -1) {
    groups[groupIndex] = { ...groups[groupIndex], ...newGroupData };
    renderGroups();
  }
}

// Event Listeners
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const phoneNumber = document.getElementById('login-phone').value;
  const password = document.getElementById('login-password').value;
  
  // Validate login (this should be handled via server)
  if (phoneNumber === 'test' && password === 'password') {
    currentUser = { phoneNumber };
    renderGroups();
    alert('Login Successful!');
  } else {
    alert('Invalid login credentials');
  }
});

signupForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('signup-name').value;
  const phoneNumber = document.getElementById('signup-phone').value;
  const password = document.getElementById('signup-password').value;
  const confirmPassword = document.getElementById('signup-confirm-password').value;

  if (password === confirmPassword) {
    currentUser = { name, phoneNumber };
    alert('Signup Successful!');
    renderLoginForm();
  } else {
    alert('Passwords do not match!');
  }
});

forgotPasswordForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('forgot-email').value;
  alert('Password reset link sent to ' + email);
  renderLoginForm();
});

createGroupButton.addEventListener('click', () => {
  const groupName = prompt('Enter the group name');
  if (groupName) {
    const newGroup = {
      id: Date.now(),
      name: groupName,
      members: [],
    };
    groups.push(newGroup);
    renderGroups();
  }
});

groupsContainer.addEventListener('click', (e) => {
  const groupId = e.target.getAttribute('data-group-id');
  
  if (e.target.classList.contains('edit-group-btn')) {
    const newGroupName = prompt('Enter new group name');
    if (newGroupName) {
      updateGroup(groupId, { name: newGroupName });
    }
  }
  
  if (e.target.classList.contains('remove-group-btn')) {
    groups = groups.filter((group) => group.id !== parseInt(groupId));
    renderGroups();
  }
  
  if (e.target.classList.contains('buzz-selected-btn')) {
    socket.emit('buzz', { groupId, message: 'Buzzed selected members!' });
  }

  if (e.target.classList.contains('add-member-btn')) {
    const memberName = prompt('Enter member name');
    const memberPhone = prompt('Enter member phone');
    if (memberName && memberPhone) {
      const groupIndex = groups.findIndex((g) => g.id === parseInt(groupId));
      groups[groupIndex].members.push({ name: memberName, phone: memberPhone });
      renderGroups();
    }
  }
});

socket.on('buzzed', (data) => {
  alert(`Buzz sent to group ${data.groupId}: ${data.message}`);
});

// Render the Login Form initially
renderLoginForm();

