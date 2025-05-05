// ================= SCREEN MANAGEMENT =================
const SCREENS = {
  LOGIN: 'login-screen',
  SIGNUP: 'signup-screen',
  APP: 'app-screen',
  GROUP: 'group-screen'
};

let currentUser = null;

function showScreen(screenId) {
  // Hide all screens
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  
  // Show requested screen
  const screen = document.getElementById(screenId);
  if (screen) screen.classList.add('active');
  
  // Special cases
  if (screenId === SCREENS.APP) {
    loadGroups(); // Load groups when app screen shows
  }
}

// ================= AUTHENTICATION =================
// Mock database
const users = [
  { phone: '1234567890', password: 'password123', name: 'Test User' }
];

// Login Functionality
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const phone = document.getElementById('login-phone').value;
  const password = document.getElementById('login-password').value;
  
  // Simple validation
  if (!phone || !password) {
    alert('Please enter both phone and password');
    return;
  }
  
  // Find user
  const user = users.find(u => u.phone === phone && u.password === password);
  
  if (user) {
    currentUser = user;
    showScreen(SCREENS.APP);
  } else {
    alert('Invalid credentials');
  }
});

// Signup Functionality
document.getElementById('signup-form').addEventListener('submit', (e) => {
  e.preventDefault();
  
  const name = document.getElementById('signup-name').value;
  const phone = document.getElementById('signup-phone').value;
  const password = document.getElementById('signup-password').value;
  const confirmPassword = document.getElementById('signup-confirm').value;
  
  // Validation
  if (password !== confirmPassword) {
    alert('Passwords do not match!');
    return;
  }
  
  if (users.some(u => u.phone === phone)) {
    alert('User already exists!');
    return;
  }
  
  // Add new user
  users.push({ name, phone, password });
  alert('Account created successfully!');
  showScreen(SCREENS.LOGIN);
});

// ================= NAVIGATION =================
document.getElementById('show-signup').addEventListener('click', (e) => {
  e.preventDefault();
  showScreen(SCREENS.SIGNUP);
});

document.getElementById('show-login').addEventListener('click', (e) => {
  e.preventDefault();
  showScreen(SCREENS.LOGIN);
});

document.getElementById('logout-btn').addEventListener('click', () => {
  currentUser = null;
  showScreen(SCREENS.LOGIN);
});

document.getElementById('back-btn').addEventListener('click', () => {
  showScreen(SCREENS.APP);
});

// ================= GROUP MANAGEMENT =================
let groups = [
  { id: 1, name: 'Family', members: [
    { name: 'Mom', phone: '1111111111' },
    { name: 'Dad', phone: '2222222222' }
  ]},
  { id: 2, name: 'Friends', members: [
    { name: 'Alice', phone: '3333333333' }
  ]}
];

function loadGroups() {
  const container = document.getElementById('groups-list');
  container.innerHTML = '';
  
  groups.forEach(group => {
    const groupCard = document.createElement('div');
    groupCard.className = 'group-card';
    groupCard.innerHTML = `
      <h3>${group.name}</h3>
      <p>${group.members.length} members</p>
    `;
    groupCard.addEventListener('click', () => {
      showGroupDetail(group);
    });
    container.appendChild(groupCard);
  });
}

function showGroupDetail(group) {
  document.getElementById('group-title').textContent = group.name;
  const membersList = document.getElementById('members-list');
  membersList.innerHTML = '';
  
  group.members.forEach(member => {
    const memberItem = document.createElement('div');
    memberItem.className = 'member-item';
    memberItem.innerHTML = `
      <input type="checkbox" id="member-${member.phone}">
      <label for="member-${member.phone}">
        ${member.name} (${member.phone})
      </label>
    `;
    membersList.appendChild(memberItem);
  });
  
  showScreen(SCREENS.GROUP);
}

// ================= MODAL CONTROLS =================
document.getElementById('create-group-btn').addEventListener('click', () => {
  document.getElementById('create-group-modal').style.display = 'block';
});

document.getElementById('cancel-create').addEventListener('click', () => {
  document.getElementById('create-group-modal').style.display = 'none';
});

document.getElementById('confirm-create').addEventListener('click', () => {
  const groupName = document.getElementById('new-group-name').value;
  if (groupName) {
    groups.push({
      id: groups.length + 1,
      name: groupName,
      members: []
    });
    loadGroups();
    document.getElementById('create-group-modal').style.display = 'none';
  }
});

// Initialize app
showScreen(SCREENS.LOGIN);
