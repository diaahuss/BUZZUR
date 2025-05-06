function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

// Navigation
document.getElementById('go-to-signup').addEventListener('click', () => showPage('signup-page'));
document.getElementById('go-to-login').addEventListener('click', () => showPage('login-page'));
document.getElementById('go-to-login2').addEventListener('click', () => showPage('login-page'));
document.getElementById('go-to-forgot').addEventListener('click', () => showPage('forgot-page'));

// Show password toggles
document.getElementById('login-show-password').addEventListener('change', function () {
  document.getElementById('login-password').type = this.checked ? 'text' : 'password';
});
document.getElementById('signup-show-password').addEventListener('change', function () {
  document.getElementById('signup-password').type = this.checked ? 'text' : 'password';
  document.getElementById('signup-confirm-password').type = this.checked ? 'text' : 'password';
});

// Mock login/signup functionality
document.getElementById('login-button').addEventListener('click', () => {
  const phone = document.getElementById('login-phone').value;
  const password = document.getElementById('login-password').value;

  // Fake validation for now
  if (phone === '123' && password === '123') {
    alert('Login successful!');
    // Redirect or load next screen here
  } else {
    alert('Wrong phone or password.');
  }
});

document.getElementById('signup-button').addEventListener('click', () => {
  const name = document.getElementById('signup-name').value;
  const phone = document.getElementById('signup-phone').value;
  const pw1 = document.getElementById('signup-password').value;
  const pw2 = document.getElementById('signup-confirm-password').value;

  if (!name || !phone || !pw1 || !pw2) return alert('Fill all fields');
  if (pw1 !== pw2) return alert('Passwords do not match');

  alert('Signup successful!');
  showPage('login-page');
});

document.getElementById('reset-button').addEventListener('click', () => {
  const phone = document.getElementById('reset-phone').value;
  alert(`Reset link sent to ${phone}`);
  showPage('login-page');
});

// Show login page on load
showPage('login-page');
