const socket = io();
const app = document.getElementById('app');
let currentUser = null;
let userGroups = [];

// Utility
function createEl(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => el[k] = v);
  children.forEach(child => el.append(child));
  return el;
}

// Views
function renderLogin() {
  app.innerHTML = '';
  const phoneInput = createEl('input', { placeholder: 'Phone Number' });
  const passwordInput = createEl('input', { placeholder: 'Password', type: 'password' });
  const showPwd = createEl('input', { type: 'checkbox' });
  const loginBtn = createEl('button', { textContent: 'Login' });
  const toSignup = createEl('a', { href: '#', textContent: 'Sign Up' });
  const toForgot = createEl('a', { href: '#', textContent: 'Forgot Password?' });

  showPwd.addEventListener('change', () => {
    passwordInput.type = showPwd.checked ? 'text' : 'password';
  });

  loginBtn.addEventListener('click', async () => {
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phoneInput.value, password: passwordInput.value })
    });
    const data = await res.json();
    if (data.success) {
      currentUser = data.user;
      loadDashboard();
    } else {
      alert('Login failed');
    }
  });

  toSignup.addEventListener('click', renderSignup);

  app.append(
    phoneInput,
    passwordInput,
    createEl('label', {}, showPwd, ' Show Password'),
    loginBtn,
    createEl('div', {}, toForgot, ' | ', toSignup)
  );
}

function renderSignup() {
  app.innerHTML = '';
  const nameInput = createEl('input', { placeholder: 'Name' });
  const phoneInput = createEl('input', { placeholder: 'Phone Number' });
  const passwordInput = createEl('input', { placeholder: 'Password', type: 'password' });
  const confirmInput = createEl('input', { placeholder: 'Confirm Password', type: 'password' });
  const showPwd = createEl('input', { type: 'checkbox' });
  const signupBtn = createEl('button', { textContent: 'Sign Up' });
  const toLogin = createEl('a', { href: '#', textContent: 'Back to Login' });

  showPwd.addEventListener('change', () => {
    passwordInput.type = confirmInput.type = showPwd.checked ? 'text' : 'password';
  });

  signupBtn.addEventListener('click', async () => {
    if (passwordInput.value !== confirmInput.value) {
      alert('Passwords do not match');
      return;
    }

    const res = await fetch('/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: nameInput.value,
        phone: phoneInput.value,
        password: passwordInput.value
      })
    });
    const data = await res.json();
    if (data.success) {
      currentUser = data.user;
      loadDashboard();
    } else {
      alert(data.message || 'Signup failed');
    }
  });

  toLogin.addEventListener('click', renderLogin);

  app.append(
    nameInput,
    phoneInput,
    passwordInput,
    confirmInput,
    createEl('label', {}, showPwd, ' Show Password'),
    signupBtn,
    toLogin
  );
}

async function loadDashboard() {
  app.innerHTML = '';

  const title = createEl('h2', { textContent: 'My Groups' });
  const groupList = createEl('div');
  const newGroupInput = createEl('input', { placeholder: 'New Group Name' });
  const addGroupBtn = createEl('button', { textContent: 'Create Group' });
  const buzzAllBtn = createEl('button', { textContent: 'Buzz All', className: 'buzz' });
  const logoutBtn = createEl('button', { textContent: 'Logout', className: 'logout' });

  addGroupBtn.addEventListener('click', async () => {
    const res = await fetch('/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newGroupInput.value, userId: currentUser.id })
    });
    const data = await res.json();
    if (data.success) {
      userGroups.push(data.group);
      renderGroups(groupList);
      newGroupInput.value = '';
    }
  });

  buzzAllBtn.addEventListener('click', () => {
    socket.emit('buzz');
  });

  logoutBtn.addEventListener('click', () => {
    currentUser = null;
    userGroups = [];
    renderLogin();
  });

  app.append(title, groupList, newGroupInput, addGroupBtn, buzzAllBtn, logoutBtn);
}

function renderGroups(container) {
  container.innerHTML = '';
  userGroups.forEach(group => {
    const groupDiv = createEl('div', { className: 'group-section' },
      createEl('strong', { textContent: group.name }),
      createEl('button', {
        textContent: 'Buzz Group',
        className: 'buzz',
        onclick: () => socket.emit('buzz')
      })
    );
    container.append(groupDiv);
  });
}

// Buzz sound
socket.on('buzz', () => {
  const sound = document.getElementById('buzzSound');
  if (sound) {
    sound.currentTime = 0;
    sound.play();
  }
});

// Init
renderLogin();
