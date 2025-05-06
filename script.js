// Function to show the respective page
function showPage(pageId) {
  document.querySelectorAll('.page').forEach((page) => {
    page.classList.remove('active');
  });
  document.getElementById(pageId).classList.add('active');
}

// Navigation Links for Login and Signup
document.getElementById('to-signup').addEventListener('click', (e) => {
  e.preventDefault();
  showPage('signup-page');
});

document.getElementById('to-login').addEventListener('click', (e) => {
  e.preventDefault();
  showPage('login-page');
});

// Login Form Submit (this can be updated to integrate with your backend)
document.getElementById('login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const phone = document.getElementById('login-phone').value;
  const password = document.getElementById('login-password').value;

  // Here you would handle the login logic (e.g., authentication with backend)
  console.log(`Logging in with phone: ${phone} and password: ${password}`);

  // After successful login, show the next page (e.g., My Groups)
  // showPage('my-groups-page'); // Uncomment when your main page is ready
});

// Signup Form Submit (this can be updated to integrate with your backend)
document.getElementById('signup-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('signup-name').value;
  const phone = document.getElementById('signup-phone').value;
  const password = document.getElementById('signup-password').value;
  const confirmPassword = document.getElementById('signup-confirm').value;

  // Here you would handle the signup logic (e.g., create account in your backend)
  console.log(`Signing up with name: ${name}, phone: ${phone}, password: ${password}`);

  // After successful signup, redirect to login page
  showPage('login-page');
});
