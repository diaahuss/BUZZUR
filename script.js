let socket = io('https://buzzur-server.onrender.com'); // Replace with your server URL

// Wait for the DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  if (typeof renderApp === 'function') {
    renderApp();
  }
});

// Render the app UI (login, signup, etc.)
function renderApp() {
  const appContainer = document.getElementById('app');
  
  // Check for an authenticated user
  const user = localStorage.getItem('user');
  if (user) {
    // If user is authenticated, show the My Groups page
    appContainer.innerHTML = `
      <h1>Welcome to BUZZUR</h1>
      <button onclick="createGroup()">Create a Group</button>
      <button onclick="logout()">Logout</button>
    `;
  } else {
    // If not authenticated, show the login page
    appContainer.innerHTML = `
      <h1>Login</h1>
      <form id="loginForm">
        <input type="text" id="loginUsername" placeholder="Username" required />
        <input type="password" id="loginPassword" placeholder="Password" required />
        <button type="submit">Login</button>
      </form>
      <p>Don't have an account? <a href="#" onclick="showSignupForm()">Sign up</a></p>
    `;

    document.getElementById('loginForm').addEventListener('submit', login);
  }
}

// Show the signup form
function showSignupForm() {
  const appContainer = document.getElementById('app');
  appContainer.innerHTML = `
    <h1>Sign Up</h1>
    <form id="signupForm">
      <input type="text" id="signupUsername" placeholder="Username" required />
      <input type="password" id="signupPassword" placeholder="Password" required />
      <input type="number" id="signupPhone" placeholder="Phone Number" required />
      <button type="submit">Sign Up</button>
    </form>
  `;

  document.getElementById('signupForm').addEventListener('submit', signup);
}

// Handle login
async function login(event) {
  event.preventDefault();
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  const response = await fetch('https://buzzur-server.onrender.com/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await response.json();
  if (data.success) {
    localStorage.setItem('user', JSON.stringify(data.user));
    renderApp();
  } else {
    alert('Invalid login credentials.');
  }
}

// Handle signup
async function signup(event) {
  event.preventDefault();
  const username = document.getElementById('signupUsername').value;
  const password = document.getElementById('signupPassword').value;
  const phone = document.getElementById('signupPhone').value;

  const response = await fetch('https://buzzur-server.onrender.com/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, phone })
  });

  const data = await response.json();
  if (data.success) {
    alert('Signup successful. Please log in.');
    renderApp();
  } else {
    alert('Error: ' + data.message);
  }
}

// Logout function
function logout() {
  localStorage.removeItem('user');
  renderApp();
}

// Create group functionality
function createGroup() {
  const groupName = prompt('Enter group name');
  if (groupName) {
    fetch('https://buzzur-server.onrender.com/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: groupName, userId: JSON.parse(localStorage.getItem('user')).id })
    })
    .then(response => response.json())
    .then(data => {
      alert('Group created!');
    });
  }
}

// Handle buzz alerts
function sendBuzz() {
  socket.emit('buzz');
  alert('Buzz sent!');
}

// Socket listener for buzz
socket.on('buzz', () => {
  alert('Buzz received!');
});
