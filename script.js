// ======================
// Mock API Responses
// ======================
const mockUsers = [
  { phone: "+1234567890", password: "password123", name: "Test User" }
];

// Simulate API delay (ms)
const simulateAPI = () => new Promise(resolve => setTimeout(resolve, 1000));

// Mock login
async function mockLogin(phone, password) {
  await simulateAPI();
  const user = mockUsers.find(u => u.phone === phone && u.password === password);
  return user ? { success: true } : { error: "Invalid phone or password" };
}

// Mock signup
async function mockSignup(name, phone, password) {
  await simulateAPI();
  const exists = mockUsers.some(u => u.phone === phone);
  if (exists) return { error: "Phone already registered" };
  mockUsers.push({ phone, password, name });
  return { success: true };
}

// ======================
// DOM Elements & Event Listeners 
// (Same as your HTML structure)
// ======================
const authScreens = document.getElementById('auth-screens');
const appScreens = document.getElementById('app-screens');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const logoutBtn = document.getElementById('logout-btn');
const togglePassword = document.getElementById('toggle-password');

// Toggle password visibility
togglePassword?.addEventListener('click', () => {
  const passwordInput = document.getElementById('login-password');
  const icon = togglePassword.querySelector('i');
  passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
  icon.classList.toggle('fa-eye-slash');
});

// Login (Mock)
loginBtn?.addEventListener('click', async () => {
  const phone = document.getElementById('login-phone').value;
  const password = document.getElementById('login-password').value;

  if (!phone || !password) {
    showNotification('Please fill all fields', 'error');
    return;
  }

  const response = await mockLogin(phone, password);
  if (response.success) {
    showNotification('Login successful!', 'success');
    authScreens.style.display = 'none';
    appScreens.style.display = 'block';
  } else {
    showNotification(response.error || 'Login failed', 'error');
  }
});

// Signup (Mock)
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

  const response = await mockSignup(name, phone, password);
  if (response.success) {
    showNotification('Account created! Redirecting to login...', 'success');
    setTimeout(() => {
      document.getElementById('signup-screen').classList.remove('active');
      document.getElementById('login-screen').classList.add('active');
    }, 1500);
  } else {
    showNotification(response.error || 'Signup failed', 'error');
  }
});

// Logout
logoutBtn?.addEventListener('click', () => {
  authScreens.style.display = 'block';
  appScreens.style.display = 'none';
  showNotification('Logged out', 'info');
});

// ======================
// Helper Functions
// ======================
function showNotification(message, type = 'info') {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.style.display = 'block';
  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
}

// Initialize (check if "logged in" on page load)
function init() {
  // Example: If you want to simulate being logged in during development
  // localStorage.setItem('mockLoggedIn', 'true');
  const isLoggedIn = localStorage.getItem('mockLoggedIn');
  if (isLoggedIn) {
    authScreens.style.display = 'none';
    appScreens.style.display = 'block';
  }
}

init();
