// \ Show/Hide Pages
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

// \ Navigation
document.getElementById('to-signup').addEventListener('click', () => showPage('signup-page'));
document.getElementById('to-login').addEventListener('click', () => showPage('login-page'));
document.getElementById('to-forgot').addEventListener('click', () => alert('Forgot password coming soon'));

// \ Show Passwords
document.getElementById('show-passwords').addEventListener('change', function () {
  const type = this.checked ? 'text' : 'password';
  document.getElementById('signup-password').type = type;
  document.getElementById('signup-confirm').type = type;
});

// \ Handle Signup
document.getElementById('signup-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('signup-name').value.trim();
  const phone = document.getElementById('signup-phone').value.trim();
  const password = document.getElementById('signup-password').value;
  const confirm = document.getElementById('signup-confirm').value;

  if (!name || !phone || !password || !confirm) return alert('Fill all fields');
  if (password !== confirm) return alert('Passwords do not match');

  const users = JSON.parse(localStorage.getItem('users') || '{}');

  if (users[phone]) {
    alert('Account already exists');
  } else {
    users[phone] = { name, password };
    localStorage.setItem('users', JSON.stringify(users));
    alert('Account created. Please log in.');
    showPage('login-page');
  }
});

// \ Handle Login
document.getElementById('login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const phone = document.getElementById('login-phone').value.trim();
  const password = document.getElementById('login-password').value;

  const users = JSON.parse(localStorage.getItem('users') || '{}');
  const user = users[phone];

  if (user && user.password === password) {
    alert(`Welcome, ${user.name}`);
    showPage('dashboard-page');
  } else {
    alert('Invalid phone or password');
  }
});

// \ Logout
document.getElementById('logout').addEventListener('click', () => {
  showPage('login-page');
});

// \ Create Group
document.getElementById('create-group').addEventListener('click', () => {
  const groupList = document.getElementById('group-list');
  const group = document.createElement('div');
  group.className = 'group-item';
  group.textContent = 'New Group';
  const badge = document.createElement('span');
  badge.textContent = '0';
  group.appendChild(badge);
  groupList.appendChild(group);
});
