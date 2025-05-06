// Page switcher
function showPage(id) {
  document.querySelectorAll('.page').forEach((p) => {
    p.classList.remove('active');
  });
  document.getElementById(id).classList.add('active');
}

// Navigation
document.getElementById('to-signup').addEventListener('click', (e) => {
  e.preventDefault();
  showPage('signup-page');
});

document.getElementById('to-login').addEventListener('click', (e) => {
  e.preventDefault();
  showPage('login-page');
});

// Form submit handlers
document.getElementById('login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const phone = document.getElementById('login-phone').value;
  const password = document.getElementById('login-password').value;
  alert(`Logging in with ${phone}`);
  // TODO: Connect to backend
});

document.getElementById('signup-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('signup-name').value;
  const phone = document.getElementById('signup-phone').value;
  const password = document.getElementById('signup-password').value;
  const confirm = document.getElementById('signup-confirm').value;

  if (password !== confirm) {
    alert("Passwords don't match");
    return;
  }

  alert(`Signing up: ${name}, ${phone}`);
  showPage('login-page');
});
