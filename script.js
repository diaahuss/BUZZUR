// Mock database
const mockUsers = [
  { phone: "+1234567890", password: "password123", name: "Test User" }
];
const mockGroups = [];

// DOM Elements
const authScreens = document.getElementById('auth-screens');
const appScreens = document.getElementById('app-screens');
const loginScreen = document.getElementById('login-screen');
const signupScreen = document.getElementById('signup-screen');
const groupsScreen = document.getElementById('groups-screen');
const createGroupScreen = document.getElementById('create-group-screen');
const groupDetailScreen = document.getElementById('group-detail-screen');

// Buttons
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const showSignup = document.getElementById('show-signup');
const showLogin = document.getElementById('show-login');
const togglePassword = document.getElementById('toggle-password');
const logoutBtn = document.getElementById('logout-btn');
const createGroupBtn = document.getElementById('create-group-btn');
const cancelCreate = document.getElementById('cancel-create');
const saveGroupBtn = document.getElementById('save-group-btn');
const backToGroups = document.getElementById('back-to-groups');

// Initialize the app
function init() {
  // Hide app screens by default
  appScreens.style.display = 'none';
  
  // Show only groups screen initially
  groupsScreen.classList.add('active');
  createGroupScreen.classList.remove('active');
  groupDetailScreen.classList.remove('active');
  
  // Setup event listeners
  setupEventListeners();
  
  // Load mock groups (for testing)
  loadGroups();
}

// Setup all event listeners
function setupEventListeners() {
  // Auth screen toggles
  showSignup?.addEventListener('click', () => toggleAuthScreens());
  showLogin?.addEventListener('click', () => toggleAuthScreens());
  
  // Password visibility toggle
  togglePassword?.addEventListener('click', togglePasswordVisibility);
  
  // Auth actions
  loginBtn?.addEventListener('click', handleLogin);
  signupBtn?.addEventListener('click', handleSignup);
  logoutBtn?.addEventListener('click', handleLogout);
  
  // Group actions
  createGroupBtn?.addEventListener('click', () => showScreen('create-group'));
  cancelCreate?.addEventListener('click', () => showScreen('groups'));
  saveGroupBtn?.addEventListener('click', handleCreateGroup);
  backToGroups?.addEventListener('click', () => showScreen('groups'));
}

// Toggle between login/signup screens
function toggleAuthScreens() {
  loginScreen.classList.toggle('active');
  signupScreen.classList.toggle('active');
}

// Toggle password visibility
function togglePasswordVisibility() {
  const passwordInput = document.getElementById('login-password');
  const icon = togglePassword.querySelector('i');
  passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
  icon.classList.toggle('fa-eye-slash');
}

// Handle login
async function handleLogin() {
  const phone = document.getElementById('login-phone').value;
  const password = document.getElementById('login-password').value;

  if (!phone || !password) {
    showNotification('Please fill all fields', 'error');
    return;
  }

  // Mock authentication
  const user = mockUsers.find(u => u.phone === phone && u.password === password);
  
  if (user) {
    showNotification('Login successful!', 'success');
    authScreens.style.display = 'none';
    appScreens.style.display = 'block';
    showScreen('groups');
  } else {
    showNotification('Invalid phone or password', 'error');
  }
}

// Handle signup
async function handleSignup() {
  const name = document.getElementById('signup-name').value;
  const phone = document.getElementById('signup-phone').value;
  const password = document.getElementById('signup-password').value;
  const confirmPassword = document.getElementById('signup-confirm').value;

  if (!name || !phone || !password || !confirmPassword) {
    showNotification('Please fill all fields', 'error');
    return;
  }

  if (password !== confirmPassword) {
    showNotification('Passwords do not match', 'error');
    return;
  }

  if (mockUsers.some(u => u.phone === phone)) {
    showNotification('Phone already registered', 'error');
    return;
  }

  mockUsers.push({ phone, password, name });
  showNotification('Account created! Please login.', 'success');
  toggleAuthScreens();
  clearSignupForm();
}

// Handle logout
function handleLogout() {
  authScreens.style.display = 'block';
  appScreens.style.display = 'none';
  showNotification('Logged out successfully', 'success');
}

// Handle create group
function handleCreateGroup() {
  const groupName = document.getElementById('group-name').value.trim();
  
  if (!groupName) {
    showNotification('Group name is required', 'error');
    return;
  }

  mockGroups.push({
    id: Date.now().toString(),
    name: groupName,
    members: []
  });
  
  showNotification('Group created successfully!', 'success');
  document.getElementById('group-name').value = '';
  showScreen('groups');
  loadGroups();
}

// Load groups into the UI
function loadGroups() {
  const groupsList = document.getElementById('groups-list');
  groupsList.innerHTML = mockGroups.map(group => `
    <div class="card" data-group-id="${group.id}">
      <h3>${group.name}</h3>
      <p>${group.members.length} members</p>
      <button class="btn secondary view-group-btn">View</button>
    </div>
  `).join('');

  // Add event listeners to view buttons
  document.querySelectorAll('.view-group-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const groupId = e.target.closest('.card').dataset.groupId;
      showGroupDetail(groupId);
    });
  });
}

// Show group detail
function showGroupDetail(groupId) {
  const group = mockGroups.find(g => g.id === groupId);
  if (!group) return;

  document.getElementById('group-detail-title').textContent = group.name;
  const membersList = document.getElementById('members-list');
  membersList.innerHTML = group.members.map(member => `
    <div class="card">
      <h3>${member.name}</h3>
      <p>${member.phone}</p>
    </div>
  `).join('');

  showScreen('group-detail');
}

// Show specific screen
function showScreen(screenName) {
  groupsScreen.classList.remove('active');
  createGroupScreen.classList.remove('active');
  groupDetailScreen.classList.remove('active');

  switch (screenName) {
    case 'groups':
      groupsScreen.classList.add('active');
      break;
    case 'create-group':
      createGroupScreen.classList.add('active');
      break;
    case 'group-detail':
      groupDetailScreen.classList.add('active');
      break;
  }
}

// Clear signup form
function clearSignupForm() {
  document.getElementById('signup-name').value = '';
  document.getElementById('signup-phone').value = '';
  document.getElementById('signup-password').value = '';
  document.getElementById('signup-confirm').value = '';
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.style.display = 'block';
  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
