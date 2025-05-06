// \ Show/Hide Pages
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

// \ Navigation Events
document.getElementById('to-signup').addEventListener('click', () => showPage('signup-page'));
document.getElementById('to-login').addEventListener('click', () => showPage('login-page'));
document.getElementById('to-forgot').addEventListener('click', () => alert('Forgot password coming soon'));

// \ Show Password Toggle
document.getElementById('show-passwords').addEventListener('change', function () {
  const pass1 = document.getElementById('signup-password');
  const pass2 = document.getElementById('signup-confirm');
  const type = this.checked ? 'text' : 'password';
  pass1.type = type;
  pass2.type = type;
});

// \ Handle Login
document.getElementById('login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const phone = document.getElementById('login-phone').value;
  const password = document.getElementById('login-password').value;
  if (phone && password) {
    showPage('dashboard-page');
  } else {
    alert('Enter phone and password');
  }
});

// \ Handle Signup
document.getElementById('signup-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('signup-name').value;
  const phone = document.getElementById('signup-phone').value;
  const password = document.getElementById('signup-password').value;
  const confirm = document.getElementById('signup-confirm').value;
  if (!name || !phone || !password || !confirm) {
    alert('Fill all fields');
  } else if (password !== confirm) {
    alert('Passwords do not match');
  } else {
    alert('Signup success — now login');
    showPage('login-page');
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
