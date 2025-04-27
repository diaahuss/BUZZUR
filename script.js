const app = document.getElementById('app');
const socket = io(); // Make sure your server is ready for socket.io

const API_URL = 'https://buzzur-server.onrender.com'; // Your deployed backend URL

function renderBanner() {
  const banner = document.createElement('div');
  banner.className = 'banner';
  banner.textContent = 'BUZZUR';
  return banner;
}

function renderLoginScreen() {
  app.innerHTML = '';
  const container = document.createElement('div');
  container.className = 'container';

  const banner = renderBanner();

  const phoneInput = document.createElement('input');
  phoneInput.type = 'text';
  phoneInput.placeholder = 'Phone Number';
  phoneInput.id = 'phone';

  const passwordInput = document.createElement('input');
  passwordInput.type = 'password';
  passwordInput.placeholder = 'Password';
  passwordInput.id = 'password';

  const showPasswordCheckbox = document.createElement('input');
  showPasswordCheckbox.type = 'checkbox';
  showPasswordCheckbox.id = 'showPassword';
  showPasswordCheckbox.style.marginTop = '10px';

  const showPasswordLabel = document.createElement('label');
  showPasswordLabel.htmlFor = 'showPassword';
  showPasswordLabel.textContent = ' Show Password';

  showPasswordCheckbox.addEventListener('change', () => {
    passwordInput.type = showPasswordCheckbox.checked ? 'text' : 'password';
  });

  const loginButton = document.createElement('button');
  loginButton.textContent = 'Login';
  loginButton.onclick = handleLogin;

  const linkRow = document.createElement('div');
  linkRow.className = 'link-row';
  linkRow.innerHTML = `
    <a href="#" id="signupLink">Sign Up</a> |
    <a href="#" id="forgotLink">Forgot Password</a>
  `;

  container.appendChild(banner);
  container.appendChild(phoneInput);
  container.appendChild(passwordInput);
  container.appendChild(showPasswordCheckbox);
  container.appendChild(showPasswordLabel);
  container.appendChild(loginButton);
  container.appendChild(linkRow);

  app.appendChild(container);

  document.getElementById('signupLink').onclick = renderSignupScreen;
  document.getElementById('forgotLink').onclick = renderForgotPasswordScreen;
}

function renderSignupScreen() {
  app.innerHTML = '';
  const container = document.createElement('div');
  container.className = 'container';

  const banner = renderBanner();

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.placeholder = 'Full Name';
  nameInput.id = 'name';

  const phoneInput = document.createElement('input');
  phoneInput.type = 'text';
  phoneInput.placeholder = 'Phone Number';
  phoneInput.id = 'phone';

  const passwordInput = document.createElement('input');
  passwordInput.type = 'password';
  passwordInput.placeholder = 'Password';
  passwordInput.id = 'password';

  const confirmPasswordInput = document.createElement('input');
  confirmPasswordInput.type = 'password';
  confirmPasswordInput.placeholder = 'Confirm Password';
  confirmPasswordInput.id = 'confirmPassword';

  const showPasswordCheckbox = document.createElement('input');
  showPasswordCheckbox.type = 'checkbox';
  showPasswordCheckbox.id = 'showPassword';
  showPasswordCheckbox.style.marginTop = '10px';

  const showPasswordLabel = document.createElement('label');
  showPasswordLabel.htmlFor = 'showPassword';
  showPasswordLabel.textContent = ' Show Password';

  showPasswordCheckbox.addEventListener('change', () => {
    passwordInput.type = showPasswordCheckbox.checked ? 'text' : 'password';
    confirmPasswordInput.type = showPasswordCheckbox.checked ? 'text' : 'password';
  });

  const signupButton = document.createElement('button');
  signupButton.textContent = 'Sign Up';
  signupButton.onclick = handleSignup;

  const linkRow = document.createElement('div');
  linkRow.className = 'link-row';
  linkRow.innerHTML = `
    <a href="#" id="loginLink">Back to Login</a>
  `;

  container.appendChild(banner);
  container.appendChild(nameInput);
  container.appendChild(phoneInput);
  container.appendChild(passwordInput);
  container.appendChild(confirmPasswordInput);
  container.appendChild(showPasswordCheckbox);
  container.appendChild(showPasswordLabel);
  container.appendChild(signupButton);
  container.appendChild(linkRow);

  app.appendChild(container);

  document.getElementById('loginLink').onclick = renderLoginScreen;
}

function renderForgotPasswordScreen() {
  app.innerHTML = '';
  const container = document.createElement('div');
  container.className = 'container';

  const banner = renderBanner();

  const phoneInput = document.createElement('input');
  phoneInput.type = 'text';
  phoneInput.placeholder = 'Enter your phone number';
  phoneInput.id = 'phone';

  const resetButton = document.createElement('button');
  resetButton.textContent = 'Reset Password';
  resetButton.onclick = handleResetPassword;

  const linkRow = document.createElement('div');
  linkRow.className = 'link-row';
  linkRow.innerHTML = `
    <a href="#" id="loginLink">Back to Login</a>
  `;

  container.appendChild(banner);
  container.appendChild(phoneInput);
  container.appendChild(resetButton);
  container.appendChild(linkRow);

  app.appendChild(container);

  document.getElementById('loginLink').onclick = renderLoginScreen;
}

async function handleLogin() {
  const phone = document.getElementById('phone').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!phone || !password) {
    alert('Please fill in all fields.');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password })
    });

    const data = await response.json();
    if (response.ok) {
      alert('Login successful!');
      renderDashboard();
    } else {
      alert(data.error || 'Login failed.');
    }
  } catch (error) {
    console.error(error);
    alert('Network error during login.');
  }
}

async function handleSignup() {
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const password = document.getElementById('password').value.trim();
  const confirmPassword = document.getElementById('confirmPassword').value.trim();

  if (!name || !phone || !password || !confirmPassword) {
    alert('Please fill in all fields.');
    return;
  }

  if (password !== confirmPassword) {
    alert('Passwords do not match.');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, password })
    });

    const data = await response.json();
    if (response.ok) {
      alert('Signup successful! Please login.');
      renderLoginScreen();
    } else {
      alert(data.error || 'Signup failed.');
    }
  } catch (error) {
    console.error(error);
    alert('Network error during signup.');
  }
}

async function handleResetPassword() {
  const phone = document.getElementById('phone').value.trim();

  if (!phone) {
    alert('Please enter your phone number.');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });

    const data = await response.json();
    if (response.ok) {
      alert('Password reset link sent!');
      renderLoginScreen();
    } else {
      alert(data.error || 'Reset failed.');
    }
  } catch (error) {
    console.error(error);
    alert('Network error during reset.');
  }
}

function renderDashboard() {
  app.innerHTML = '';
  const container = document.createElement('div');
  container.className = 'container';

  const banner = renderBanner();
  const welcome = document.createElement('h2');
  welcome.textContent = 'Welcome to BUZZUR!';

  container.appendChild(banner);
  container.appendChild(welcome);
  app.appendChild(container);
}

// Start with login screen
renderLoginScreen();
