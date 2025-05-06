// App State Management
const appState = {
    currentUser: null,
    currentGroup: null,
    groups: [],
    tempData: {}
};

// DOM Elements
const elements = {
    app: document.getElementById('app'),
    buzzSound: document.getElementById('buzzSound')
};

// Mock Database
const database = {
    users: [
        {
            phone: "+1234567890",
            password: "password123",
            name: "Demo User"
        }
    ],
    groups: [
        {
            id: "group1",
            name: "Family",
            members: [
                { id: "m1", name: "Mom", phone: "+1234567891" },
                { id: "m2", name: "Dad", phone: "+1234567892" }
            ]
        }
    ]
};

// Initialize App
function init() {
    loadFromStorage();
    setupEventListeners();
    renderScreen('login');
}

// Screen Management
function renderScreen(screenName) {
    // Hide all screens first
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.remove('active');
        screen.remove();
    });

    // Create and show the requested screen
    let screen;
    switch(screenName) {
        case 'login':
            screen = renderLoginScreen();
            break;
        case 'signup':
            screen = renderSignupScreen();
            break;
        case 'groups':
            screen = renderGroupsScreen();
            break;
        case 'group-detail':
            screen = renderGroupDetailScreen();
            break;
        default:
            screen = renderLoginScreen();
    }

    // Add slight delay for transition effect
    setTimeout(() => {
        screen.classList.add('active');
    }, 10);
}

// Screen Rendering Functions
function renderLoginScreen() {
    const screen = document.createElement('div');
    screen.className = 'screen login-screen';
    screen.innerHTML = `
        <div class="banner">BUZZALL</div>
        <div class="form-container">
            <div class="input-group">
                <label for="phone">Phone Number</label>
                <input type="tel" id="phone" placeholder="+1234567890" required value="+1234567890">
            </div>
            <div class="input-group">
                <label for="password">Password</label>
                <input type="password" id="password" placeholder="••••••••" required value="password123">
                <label class="checkbox-container">
                    <input type="checkbox" id="showPassword"> Show password
                </label>
            </div>
            <button id="loginBtn" class="btn primary">Login</button>
            <div class="links">
                <a href="#" id="createAccountLink">Create Account</a>
                <a href="#" id="forgotPasswordLink">Forgot Password?</a>
            </div>
        </div>
    `;
    elements.app.appendChild(screen);
    return screen;
}

function renderSignupScreen() {
    const screen = document.createElement('div');
    screen.className = 'screen signup-screen';
    screen.innerHTML = `
        <div class="banner">SIGN UP</div>
        <div class="form-container">
            <div class="input-group">
                <label for="fullName">Full Name</label>
                <input type="text" id="fullName" placeholder="John Doe" required>
            </div>
            <div class="input-group">
                <label for="phone">Phone Number</label>
                <input type="tel" id="phone" placeholder="+1234567890" required>
            </div>
            <div class="input-group">
                <label for="password">Password</label>
                <input type="password" id="password" placeholder="••••••••" required>
            </div>
            <div class="input-group">
                <label for="confirmPassword">Confirm Password</label>
                <input type="password" id="confirmPassword" placeholder="••••••••" required>
                <label class="checkbox-container">
                    <input type="checkbox" id="showPasswords"> Show passwords
                </label>
            </div>
            <button id="signupBtn" class="btn primary">Sign Up</button>
            <div class="links">
                <a href="#" id="loginLink">Already have an account? Login</a>
            </div>
        </div>
    `;
    elements.app.appendChild(screen);
    return screen;
}

function renderGroupsScreen() {
    const screen = document.createElement('div');
    screen.className = 'screen my-groups-screen';
    screen.innerHTML = `
        <div class="banner">MY GROUPS</div>
        <div class="group-list">
            ${appState.groups.map(group => `
                <div class="group-item" data-group-id="${group.id}">
                    <div class="group-info">
                        <h3>${group.name}</h3>
                        <span class="member-count">${group.members.length} members</span>
                    </div>
                    <i class="fas fa-chevron-right"></i>
                </div>
            `).join('')}
        </div>
        <div class="action-buttons">
            <button id="createGroupBtn" class="btn primary">➕ Create Group</button>
            <button id="logoutBtn" class="btn secondary">🚪 Logout</button>
        </div>
    `;
    elements.app.appendChild(screen);
    return screen;
}

function renderGroupDetailScreen() {
    if (!appState.currentGroup) return;
    
    const group = appState.groups.find(g => g.id === appState.currentGroup);
    if (!group) return;
    
    const screen = document.createElement('div');
    screen.className = 'screen group-detail-screen';
    screen.innerHTML = `
        <div class="screen-header">
            <button class="back-button" id="backToGroups">
                <i class="fas fa-arrow-left"></i>
            </button>
            <h2 class="group-title">${group.name}</h2>
        </div>
        <div class="member-list">
            ${group.members.map(member => `
                <div class="member-item" data-member-id="${member.id}">
                    <input type="checkbox" id="member-${member.id}" class="member-checkbox">
                    <div class="member-info">
                        <div class="member-name">${member.name}</div>
                        <div class="member-phone">${member.phone}</div>
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="action-buttons">
            <button id="addMemberBtn" class="btn primary">➕ Add Member</button>
            <button id="removeMemberBtn" class="btn danger">🗑️ Remove Selected</button>
            <button id="buzzSelectedBtn" class="btn accent">🔔 Buzz Selected</button>
            <button id="buzzAllBtn" class="btn accent">🔔 Buzz All</button>
        </div>
    `;
    elements.app.appendChild(screen);
    return screen;
}

// Data Management
function loadFromStorage() {
    const user = localStorage.getItem('buzzall_user');
    const groups = localStorage.getItem('buzzall_groups');
    
    if (user) {
        appState.currentUser = JSON.parse(user);
        appState.groups = groups ? JSON.parse(groups) : database.groups;
    }
}

function saveToStorage() {
    if (appState.currentUser) {
        localStorage.setItem('buzzall_user', JSON.stringify(appState.currentUser));
        localStorage.setItem('buzzall_groups', JSON.stringify(appState.groups));
    }
}

// Event Handlers
function setupEventListeners() {
    // Password visibility toggles
    document.addEventListener('change', (e) => {
        if (e.target.id === 'showPassword') {
            const input = document.getElementById('password');
            if (input) input.type = e.target.checked ? 'text' : 'password';
        }
        
        if (e.target.id === 'showPasswords') {
            const pw1 = document.getElementById('password');
            const pw2 = document.getElementById('confirmPassword');
            if (pw1) pw1.type = e.target.checked ? 'text' : 'password';
            if (pw2) pw2.type = e.target.checked ? 'text' : 'password';
        }
    });
    
    // Navigation
    document.addEventListener('click', (e) => {
        if (e.target.id === 'createAccountLink' || e.target.id === 'loginLink') {
            e.preventDefault();
            renderScreen(e.target.id === 'createAccountLink' ? 'signup' : 'login');
        }
        
        if (e.target.id === 'backToGroups' || e.target.id === 'backBtn') {
            e.preventDefault();
            renderScreen('groups');
        }
    });
    
    // Authentication
    document.addEventListener('click', (e) => {
        if (e.target.id === 'loginBtn') {
            handleLogin();
        }
        
        if (e.target.id === 'signupBtn') {
            handleSignup();
        }
        
        if (e.target.id === 'logoutBtn') {
            handleLogout();
        }
    });
    
    // Group actions
    document.addEventListener('click', (e) => {
        if (e.target.closest('.group-item')) {
            const groupId = e.target.closest('.group-item').dataset.groupId;
            appState.currentGroup = groupId;
            renderScreen('group-detail');
        }
        
        if (e.target.id === 'createGroupBtn') {
            handleCreateGroup();
        }
        
        if (e.target.id === 'addMemberBtn') {
            handleAddMember();
        }
        
        // Buzz functionality
        if (e.target.id === 'buzzSelectedBtn') {
            handleBuzzSelected();
        }
        
        if (e.target.id === 'buzzAllBtn') {
            handleBuzzAll();
        }
        
        if (e.target.id === 'removeMemberBtn') {
            handleRemoveMembers();
        }
    });
}

// Core Functions
function handleLogin() {
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    
    const user = database.users.find(u => u.phone === phone && u.password === password);
    if (user) {
        appState.currentUser = user;
        saveToStorage();
        renderScreen('groups');
    } else {
        alert('Invalid phone number or password');
    }
}

function handleSignup() {
    const fullName = document.getElementById('fullName').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        alert("Passwords don't match");
        return;
    }
    
    database.users.push({
        phone,
        password,
        name: fullName
    });
    
    alert("Account created successfully! Please login.");
    renderScreen('login');
}

function handleLogout() {
    appState.currentUser = null;
    localStorage.removeItem('buzzall_user');
    renderScreen('login');
}

function handleCreateGroup() {
    const name = prompt('Enter group name:');
    if (name) {
        appState.groups.push({
            id: 'group' + Date.now(),
            name,
            members: []
        });
        saveToStorage();
        renderScreen('groups');
    }
}

function handleAddMember() {
    const name = prompt('Member name:');
    const phone = prompt('Member phone:');
    
    if (name && phone) {
        const group = appState.groups.find(g => g.id === appState.currentGroup);
        if (group) {
            group.members.push({
                id: 'member' + Date.now(),
                name,
                phone
            });
            saveToStorage();
            renderScreen('group-detail');
        }
    }
}

function handleBuzzSelected() {
    const selected = Array.from(document.querySelectorAll('.member-checkbox:checked'))
        .map(cb => cb.id.replace('member-', ''));
    
    if (selected.length > 0) {
        elements.buzzSound.play();
        alert(`Buzzed ${selected.length} members!`);
    } else {
        alert('Please select at least one member');
    }
}

function handleBuzzAll() {
    const group = appState.groups.find(g => g.id === appState.currentGroup);
    if (group) {
        elements.buzzSound.play();
        alert(`Buzzed all ${group.members.length} members!`);
    }
}

function handleRemoveMembers() {
    const selected = Array.from(document.querySelectorAll('.member-checkbox:checked'))
        .map(cb => cb.id.replace('member-', ''));
    
    if (selected.length > 0) {
        const group = appState.groups.find(g => g.id === appState.currentGroup);
        if (group) {
            group.members = group.members.filter(m => !selected.includes(m.id));
            saveToStorage();
            renderScreen('group-detail');
        }
    } else {
        alert('Please select members to remove');
    }
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
