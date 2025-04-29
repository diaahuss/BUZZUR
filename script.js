// Simple mock database
const users = [
  { phone: "+1234567890", password: "password123", name: "Test User" }
];

// DOM Elements
const authScreens = document.getElementById('auth-screens');
const loginScreen = document.getElementById('login-screen');
const signupScreen = document.getElementById('signup-screen');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const showSignup = document.getElementById('show-signup');
const showLogin = document.getElementById('show-login');
const togglePassword = document.getElementById('toggle-password');

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

// Simple notification function
function showAlert(message, isSuccess = true) {
  const alert = document.createElement('div');
  alert.className = `alert ${isSuccess ? 'success' : 'error'}`;
  alert.textContent = message;
  document.body.appendChild(alert);
  
  setTimeout(() => {
    alert.remove();
  }, 3000);
}

// Login function
loginBtn?.addEventListener('click', () => {
  const phone = document.getElementById('login-phone').value;
  const password = document.getElementById('login-password').value;

  if (!phone || !password) {
    showAlert('Please fill in all fields', false);
    return;
  }

  // Mock authentication
  const user = users.find(u => u.phone === phone && u.password === password);
  
  if (user) {
    showAlert('Login successful!', true);
    // Here you would typically redirect to the app
    // authScreens.style.display = 'none';
    // appScreens.style.display = 'block';
  } else {
    showAlert('Invalid phone number or password', false);
  }
});

// Signup function
signupBtn?.addEventListener('click', () => {
  const name = document.getElementById('signup-name').value;
  const phone = document.getElementById('signup-phone').value;
  const password = document.getElementById('signup-password').value;
  const confirmPassword = document.getElementById('signup-confirm').value;

  if (!name || !phone || !password || !confirmPassword) {
    showAlert('Please fill in all fields', false);
    return;
  }

  if (password !== confirmPassword) {
    showAlert('Passwords do not match', false);
    return;
  }

  // Check if user already exists
  if (users.some(u => u.phone === phone)) {
    showAlert('Phone number already registered', false);
    return;
  }

  // Add new user (in a real app, this would go to your backend)
  users.push({ phone, password, name });
  showAlert('Account created successfully!', true);
  
  // Switch back to login screen
  signupScreen.classList.remove('active');
  loginScreen.classList.add('active');
  
  // Clear form
  document.getElementById('signup-name').value = '';
  document.getElementById('signup-phone').value = '';
  document.getElementById('signup-password').value = '';
  document.getElementById('signup-confirm').value = '';
});

// Add some basic styling for alerts
const style = document.createElement('style');
style.textContent = `
  .alert {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 24px;
    border-radius: 4px;
    color: white;
    font-weight: bold;
    z-index: 1000;
    animation: fadeIn 0.3s;
  }
  .success { background-color: #4CAF50; }
  .error { background-color: #F44336; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
`;
document.head.appendChild(style);
