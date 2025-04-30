// Mock database
const users = [
  { phone: "+1234567890", password: "password123", name: "Test User" }
];

// DOM Elements
const authScreens = document.getElementById('auth-screens');
const appScreens = document.getElementById('app-screens');
const loginScreen = document.getElementById('login-screen');
const signupScreen = document.getElementById('signup-screen');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const showSignup = document.getElementById('show-signup');
const showLogin = document.getElementById('show-login');
const togglePassword = document.getElementById('toggle-password');
const logoutBtn = document.getElementById('logout-btn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Make sure app screens are hidden initially
  appScreens.style.display = 'none';
  
  // Setup logout button if it exists
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      appScreens.style.display = 'none';
      authScreens.style.display = 'block';
      loginScreen.classList.add('active');
      signupScreen.classList.remove('active');
      showNotification('Logged out successfully', 'success');
    });
  }
});

// Toggle password visibility
togglePassword?.addEventListener('click', () => {
  const passwordInput = document.getElementById('login-password');
  const icon = togglePassword.querySelector('i');
  passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
  icon.classList.toggle('fa-eye-slash');
});

// Switch between login/signup
showSignup?.addEventListener('click', () => {
  loginScreen.classList.remove('active');
  signupScreen.classList.add('active');
});

showLogin?.addEventListener('click', () => {
  signupScreen.classList.remove('active');
  loginScreen.classList.add('active');
});

// Notification function
function showNotification(message, type = 'info') {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.style.display = 'block';
  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
}

// Login function
loginBtn?.addEventListener('click', () => {
  const phone = document.getElementById('login-phone').value;
  const password = document.getElementById('login-password').value;

  if (!phone || !password) {
    showNotification('Please fill all fields', 'error');
    return;
  }

  // Mock authentication
  const user = users.find(u => u.phone === phone && u.password === password);
  
  if (user) {
    showNotification('Login successful!', 'success');
    
    // Hide auth screens and show app screens
    authScreens.style.display = 'none';
    appScreens.style.display = 'block';
    
    // Show the groups screen by default
    document.getElementById('groups-screen').classList.add('active');
    document.getElementById('create-group-screen').classList.remove('active');
    document.getElementById('group-detail-screen').classList.remove('active');
    
  } else {
    showNotification('Invalid phone or password', 'error');
  }
});

// Signup function
signupBtn?.addEventListener('click', () => {
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

  if (users.some(u => u.phone === phone)) {
    showNotification('Phone already registered', 'error');
    return;
  }

  // Add to mock database
  users.push({ phone, password, name });
  showNotification('Account created! Please login.', 'success');
  
  // Switch back to login screen
  signupScreen.classList.remove('active');
  loginScreen.classList.add('active');
  
  // Clear form
  document.getElementById('signup-name').value = '';
  document.getElementById('signup-phone').value = '';
  document.getElementById('signup-password').value = '';
  document.getElementById('signup-confirm').value = '';
});

// Add basic styling for notifications if not in your CSS
const style = document.createElement('style');
style.textContent = `
  .notification {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 24px;
    border-radius: 4px;
    color: white;
    font-weight: bold;
    z-index: 1000;
    display: none;
  }
  .notification.success { background-color: #4CAF50; }
  .notification.error { background-color: #F44336; }
  .notification.info { background-color: #2196F3; }
`;
document.head.appendChild(style);
