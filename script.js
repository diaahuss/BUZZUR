// App State Management
let currentUser = null;
let groups = [];
const socket = io('https://buzzur-server.onrender.com');

// DOM Elements
const app = document.getElementById('app');
const buzzSound = document.getElementById('buzz-sound');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadUser();
    renderScreen('login');
    setupSocketListeners();
});

// Socket.IO Setup
function setupSocketListeners() {
    socket.on('receive-buzz', () => {
        playBuzzSound();
        showNotification('Buzz Received!');
    });
}

// Authentication Functions
function handleLogin() {
    const phone = document.getElementById('login-phone').value.trim();
    const password = document.getElementById('login-password').value;

    // In a real app, this would be an API call
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[phone] && users[phone].password === password) {
        currentUser = users[phone];
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        renderScreen('my-groups');
    } else {
        showError('Invalid phone or password');
    }
}

function handleSignup() {
    const name = document.getElementById('signup-name').value.trim();
    const phone = document.getElementById('signup-phone').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;

    if (password !== confirmPassword) {
        return showError('Passwords do not match');
    }

    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[phone]) {
        return showError('Phone number already registered');
    }

    users[phone] = { name, phone, password, groups: [] };
    localStorage.setItem('users', JSON.stringify(users));
    showSuccess('Account created successfully!');
    renderScreen('login');
}

// Group Management
function createGroup() {
    const groupName = document.getElementById('new-group-name').value.trim();
    if (!groupName) return showError('Group name is required');

    const newGroup = {
        id: Date.now().toString(),
        name: groupName,
        members: [],
        createdAt: new Date().toISOString()
    };

    currentUser.groups.push(newGroup);
    saveUser();
    renderScreen('my-groups');
}

function addMemberToGroup(groupId) {
    const name = document.getElementById('new-member-name').value.trim();
    const phone = document.getElementById('new-member-phone').value.trim();

    if (!name || !phone) return showError('Name and phone are required');

    const group = currentUser.groups.find(g => g.id === groupId);
    if (group) {
        group.members.push({ name, phone });
        saveUser();
        renderScreen('edit-group', groupId);
    }
}

// Buzz Functionality
function sendBuzz(groupId) {
    const group = currentUser.groups.find(g => g.id === groupId);
    if (!group) return;

    group.members.forEach(member => {
        socket.emit('buzz', { to: member.phone });
    });
    playBuzzSound();
}

// UI Rendering
function renderScreen(screenName, data = null) {
    app.innerHTML = '';
    
    switch (screenName) {
        case 'login':
            app.innerHTML = getLoginScreen();
            break;
        case 'signup':
            app.innerHTML = getSignupScreen();
            break;
        case 'my-groups':
            app.innerHTML = getGroupsScreen();
            break;
        case 'create-group':
            app.innerHTML = getCreateGroupScreen();
            break;
        case 'edit-group':
            app.innerHTML = getEditGroupScreen(data);
            break;
        case 'buzz':
            app.innerHTML = getBuzzScreen(data);
            break;
    }

    // Add active class to the rendered screen
    const screen = document.createElement('div');
    screen.className = 'screen active';
    screen.innerHTML = app.innerHTML;
    app.innerHTML = '';
    app.appendChild(screen);
}

// Helper Functions
function playBuzzSound() {
    buzzSound.currentTime = 0;
    buzzSound.play().catch(e => console.error('Audio error:', e));
}

function showError(message) {
    alert(`Error: ${message}`); // Replace with better UI in production
}

function showSuccess(message) {
    alert(`Success: ${message}`); // Replace with better UI in production
}

function saveUser() {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (currentUser) {
        users[currentUser.phone] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
}

function loadUser() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
        currentUser = JSON.parse(userData);
    }
}

// Screen Templates (would be in separate files in a larger app)
function getLoginScreen() {
    return `
        <div class="screen-header">
            <h1><i class="fas fa-sign-in-alt"></i> Login</h1>
        </div>
        <div class="form-group">
            <input type="tel" id="login-phone" placeholder="Phone Number" required>
        </div>
        <div class="form-group password-container">
            <input type="password" id="login-password" placeholder="Password" required>
            <button class="btn-icon" onclick="togglePassword('login-password')">
                <i class="fas fa-eye"></i>
            </button>
        </div>
        <button class="btn-primary" onclick="handleLogin()">Login</button>
        <p class="text-center mt-20">
            Don't have an account? <a href="#" onclick="renderScreen('signup')">Sign up</a>
        </p>
    `;
}

// Additional screen templates would follow the same pattern...

// Make functions available globally
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.renderScreen = renderScreen;
window.togglePassword = function(id) {
    const input = document.getElementById(id);
    input.type = input.type === 'password' ? 'text' : 'password';
};
