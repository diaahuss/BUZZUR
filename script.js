// \ View Switching Logic
function showPage(id) {
  const pages = document.querySelectorAll('.page');
  pages.forEach(p => p.hidden = true);
  document.getElementById(id).hidden = false;
}

// \ Initial Load
document.addEventListener('DOMContentLoaded', () => {
  const currentUser = localStorage.getItem('currentUser');
  showPage(currentUser ? 'groups-page' : 'login-page');
});

// \ Show Password Toggle
document.querySelectorAll('.toggle-password').forEach(checkbox => {
  checkbox.addEventListener('change', () => {
    const targetId = checkbox.dataset.target;
    const input = document.getElementById(targetId);
    input.type = checkbox.checked ? 'text' : 'password';
  });
});

// \ Navigation Links
document.getElementById('to-signup').addEventListener('click', () => showPage('signup-page'));
document.getElementById('to-login').addEventListener('click', () => showPage('login-page'));

// \ Sign Up
document.getElementById('signup-button').addEventListener('click', () => {
  const name = document.getElementById('signup-name').value.trim();
  const phone = document.getElementById('signup-phone').value.trim();
  const password = document.getElementById('signup-password').value;
  const confirm = document.getElementById('signup-confirm').value;

  if (!name || !phone || !password || !confirm) return alert('All fields required');
  if (password !== confirm) return alert('Passwords do not match');

  const users = JSON.parse(localStorage.getItem('users') || '[]');
  if (users.find(u => u.phone === phone)) return alert('Phone already registered');

  users.push({ name, phone, password });
  localStorage.setItem('users', JSON.stringify(users));
  alert('Sign up successful! Please log in.');
  showPage('login-page');
});

// \ Login
document.getElementById('login-button').addEventListener('click', () => {
  const phone = document.getElementById('login-phone').value.trim();
  const password = document.getElementById('login-password').value;

  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u => u.phone === phone && u.password === password);
  if (!user) return alert('Invalid credentials');

  localStorage.setItem('currentUser', phone);
  showPage('groups-page');
  loadGroups();
});

// \ Logout
document.getElementById('logout-button').addEventListener('click', () => {
  localStorage.removeItem('currentUser');
  showPage('login-page');
});

// \ Load Groups for Logged In User
function loadGroups() {
  const phone = localStorage.getItem('currentUser');
  const allGroups = JSON.parse(localStorage.getItem('groups') || '{}');
  const groups = allGroups[phone] || [];

  const list = document.getElementById('group-list');
  list.innerHTML = '';

  groups.forEach((group, i) => {
    const div = document.createElement('div');
    div.className = 'group-item';
    div.innerHTML = `<span>${group.name}</span><span>${group.members.length}</span>`;
    div.onclick = () => openGroup(i);
    list.appendChild(div);
  });
}

// \ Placeholder for Group View
function openGroup(index) {
  console.log('Open group:', index);
  // to be implemented next...
}
