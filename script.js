// DOM Elements
const authScreens = document.getElementById('auth-screens');
const appScreens = document.getElementById('app-screens');
const loginScreen = document.getElementById('login-screen');
const signupScreen = document.getElementById('signup-screen');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const showSignup = document.getElementById('show-signup');
const showLogin = document.getElementById('show-login');
const logoutBtn = document.getElementById('logout-btn');
const togglePassword = document.getElementById('toggle-password');
const notification = document.getElementById('notification');

// Groups Screen
const groupsList = document.getElementById('groups-list');
const createGroupBtn = document.getElementById('create-group-btn');

// Create Group Screen
const createGroupScreen = document.getElementById('create-group-screen');
const cancelCreate = document.getElementById('cancel-create');
const saveGroupBtn = document.getElementById('save-group-btn');
const groupNameInput = document.getElementById('group-name');

// Group Detail Screen
const groupDetailScreen = document.getElementById('group-detail-screen');
const backToGroups = document.getElementById('back-to-groups');
const membersList = document.getElementById('members-list');
const addMemberBtn = document.getElementById('add-member-btn');
const buzzAllBtn = document.getElementById('buzz-all-btn');
const buzzSelectedBtn = document.getElementById('buzz-selected-btn');

// ======================
// Auth Functions
// ======================

// Toggle password visibility
togglePassword?.addEventListener('click', () => {
  const passwordInput = document.getElementById('login-password');
  const icon = togglePassword.querySelector('i');
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    icon.classList.replace('fa-eye', 'fa-eye-slash');
  } else {
    passwordInput.type = 'password';
    icon.classList.replace('fa-eye-slash', 'fa-eye');
  }
});

// Switch between login/signup screens
showSignup?.addEventListener('click', () => {
  loginScreen.classList.remove('active');
  signupScreen.classList.add('active');
});

showLogin?.addEventListener('click', () => {
  signupScreen.classList.remove('active');
  loginScreen.classList.add('active');
});

// Login
loginBtn?.addEventListener('click', async () => {
  const phone = document.getElementById('login-phone').value;
  const password = document.getElementById('login-password').value;

  if (!phone || !password) {
    showNotification('Please fill all fields', 'error');
    return;
  }

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password }),
    });

    const data = await response.json();
    if (response.ok) {
      showNotification('Login successful!', 'success');
      authScreens.style.display = 'none';
      appScreens.style.display = 'block';
      loadGroups(); // Load groups after login
    } else {
      showNotification(data.error || 'Login failed', 'error');
    }
  } catch (error) {
    showNotification('Network error', 'error');
    console.error('Login error:', error);
  }
});

// Signup
signupBtn?.addEventListener('click', async () => {
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

  try {
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, password }),
    });

    const data = await response.json();
    if (response.ok) {
      showNotification('Account created! Please login.', 'success');
      signupScreen.classList.remove('active');
      loginScreen.classList.add('active');
    } else {
      showNotification(data.error || 'Signup failed', 'error');
    }
  } catch (error) {
    showNotification('Network error', 'error');
    console.error('Signup error:', error);
  }
});

// Logout
logoutBtn?.addEventListener('click', () => {
  authScreens.style.display = 'block';
  appScreens.style.display = 'none';
  showNotification('Logged out', 'info');
});

// ======================
// Group Functions
// ======================

// Load groups from API
async function loadGroups() {
  try {
    const response = await fetch('/api/groups');
    const groups = await response.json();
    groupsList.innerHTML = groups.map(group => `
      <div class="card" data-group-id="${group.id}">
        <h3>${group.name}</h3>
        <p>${group.memberCount} members</p>
        <button class="btn secondary view-group">View</button>
      </div>
    `).join('');

    // Add event listeners to group cards
    document.querySelectorAll('.view-group').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const groupId = e.target.closest('.card').dataset.groupId;
        openGroupDetail(groupId);
      });
    });
  } catch (error) {
    console.error('Failed to load groups:', error);
  }
}

// Create group
saveGroupBtn?.addEventListener('click', async () => {
  const name = groupNameInput.value.trim();
  if (!name) {
    showNotification('Group name is required', 'error');
    return;
  }

  try {
    const response = await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    if (response.ok) {
      showNotification('Group created!', 'success');
      groupNameInput.value = '';
      createGroupScreen.classList.remove('active');
      groupsScreen.classList.add('active');
      loadGroups(); // Refresh the list
    }
  } catch (error) {
    showNotification('Failed to create group', 'error');
    console.error('Create group error:', error);
  }
});

// Navigation
createGroupBtn?.addEventListener('click', () => {
  groupsScreen.classList.remove('active');
  createGroupScreen.classList.add('active');
});

cancelCreate?.addEventListener('click', () => {
  createGroupScreen.classList.remove('active');
  groupsScreen.classList.add('active');
});

backToGroups?.addEventListener('click', () => {
  groupDetailScreen.classList.remove('active');
  groupsScreen.classList.add('active');
});

// ======================
// Helper Functions
// ======================

// Show notification
function showNotification(message, type = 'info') {
  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.style.display = 'block';
  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
}

// Initialize the app
function init() {
  // Check if user is already logged in (e.g., via localStorage)
  const isLoggedIn = localStorage.getItem('token');
  if (isLoggedIn) {
    authScreens.style.display = 'none';
    appScreens.style.display = 'block';
    loadGroups();
  }
}

init();
