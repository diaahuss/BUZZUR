// App State
const state = {
    user: null,
    groups: [],
    currentGroup: null
};

// DOM Elements
const el = {
    app: document.getElementById('app'),
    buzzSound: document.getElementById('buzzSound')
};

// Mock Database
const db = {
    users: [
        { phone: "+1234567890", password: "password123", name: "Test User" }
    ],
    groups: [
        {
            id: '1',
            name: 'Sample Group',
            members: [
                { id: '1', name: 'John', phone: '+1111111111' },
                { id: '2', name: 'Jane', phone: '+1222222222' }
            ]
        }
    ]
};

// Initialize App
function init() {
    loadSession();
    setupEventListeners();
    renderScreen('login');
}

// Load session from localStorage
function loadSession() {
    const savedUser = localStorage.getItem('buzzall_user');
    if (savedUser) {
        state.user = JSON.parse(savedUser);
        state.groups = JSON.parse(localStorage.getItem('buzzall_groups')) || db.groups;
    }
}

// Save session to localStorage
function saveSession() {
    if (state.user) {
        localStorage.setItem('buzzall_user', JSON.stringify(state.user));
        localStorage.setItem('buzzall_groups', JSON.stringify(state.groups));
    }
}

// Render Screens
function renderScreen(screen) {
    switch (screen) {
        case 'login':
            renderLogin();
            break;
        case 'signup':
            renderSignup();
            break;
        case 'groups':
            renderGroups();
            break;
        case 'group-detail':
            renderGroupDetail();
            break;
    }
}

// Login Screen
function renderLogin() {
    el.app.innerHTML = `
        <div class="login-screen">
            <div class="banner">BUZZALL</div>
            <div class="form">
                <div class="input-group">
                    <label>Phone Number</label>
                    <input type="tel" id="login-phone" placeholder="+1234567890" required>
                </div>
                <div class="input-group">
                    <label>Password</label>
                    <input type="password" id="login-password" placeholder="••••••••" required>
                    <label class="checkbox">
                        <input type="checkbox" id="login-show-pw"> Show password
                    </label>
                </div>
                <button id="login-btn" class="btn primary">Login</button>
                <div class="links">
                    <a href="#" id="show-signup">Create Account</a>
                </div>
            </div>
        </div>
    `;
}

// Signup Screen
function renderSignup() {
    el.app.innerHTML = `
        <div class="signup-screen">
            <div class="banner">SIGN UP</div>
            <div class="form">
                <div class="input-group">
                    <label>Full Name</label>
                    <input type="text" id="signup-name" placeholder="John Doe" required>
                </div>
                <div class="input-group">
                    <label>Phone Number</label>
                    <input type="tel" id="signup-phone" placeholder="+1234567890" required>
                </div>
                <div class="input-group">
                    <label>Password</label>
                    <input type="password" id="signup-password" placeholder="••••••••" required>
                </div>
                <div class="input-group">
                    <label>Confirm Password</label>
                    <input type="password" id="signup-confirm" placeholder="••••••••" required>
                    <label class="checkbox">
                        <input type="checkbox" id="signup-show-pw"> Show passwords
                    </label>
                </div>
                <button id="signup-btn" class="btn primary">Sign Up</button>
                <div class="links">
                    <a href="#" id="show-login">Already have an account?</a>
                </div>
            </div>
        </div>
    `;
}

// Groups Screen
function renderGroups() {
    el.app.innerHTML = `
        <div class="groups-screen">
            <div class="banner">MY GROUPS</div>
            <div class="group-list">
                ${state.groups.map(group => `
                    <div class="group" data-id="${group.id}">
                        <h3>${group.name}</h3>
                        <span>${group.members.length} members</span>
                        <i class="fas fa-chevron-right"></i>
                    </div>
                `).join('')}
            </div>
            <div class="actions">
                <button id="create-group" class="btn primary">➕ Create Group</button>
                <button id="logout" class="btn">Logout</button>
            </div>
        </div>
    `;
}

// Group Detail Screen
function renderGroupDetail() {
    if (!state.currentGroup) return;
    
    const group = state.groups.find(g => g.id === state.currentGroup);
    
    el.app.innerHTML = `
        <div class="group-screen">
            <div class="header">
                <button id="back-to-groups" class="btn icon"><i class="fas fa-arrow-left"></i></button>
                <h2>${group.name}</h2>
            </div>
            <div class="member-list">
                ${group.members.map(member => `
                    <div class="member">
                        <input type="checkbox" id="member-${member.id}">
                        <div class="info">
                            <strong>${member.name}</strong>
                            <span>${member.phone}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="actions">
                <button id="add-member" class="btn primary">➕ Add Member</button>
                <button id="buzz-selected" class="btn accent">🔔 Buzz Selected</button>
                <button id="buzz-all" class="btn accent">🔔 Buzz All</button>
            </div>
        </div>
    `;
}

// Event Listeners
function setupEventListeners() {
    // Password visibility toggles
    document.addEventListener('change', e => {
        if (e.target.id === 'login-show-pw') {
            const input = document.getElementById('login-password');
            input.type = e.target.checked ? 'text' : 'password';
        }
        if (e.target.id === 'signup-show-pw') {
            const pw = document.getElementById('signup-password');
            const confirm = document.getElementById('signup-confirm');
            pw.type = confirm.type = e.target.checked ? 'text' : 'password';
        }
    });
    
    // Navigation
    document.addEventListener('click', e => {
        if (e.target.id === 'show-signup' || e.target.id === 'show-login') {
            e.preventDefault();
            renderScreen(e.target.id === 'show-signup' ? 'signup' : 'login');
        }
        
        if (e.target.id === 'back-to-groups') {
            renderScreen('groups');
        }
        
        if (e.target.closest('.group')) {
            state.currentGroup = e.target.closest('.group').dataset.id;
            renderScreen('group-detail');
        }
    });
    
    // Auth actions
    document.addEventListener('click', e => {
        if (e.target.id === 'login-btn') {
            const phone = document.getElementById('login-phone').value;
            const password = document.getElementById('login-password').value;
            
            const user = db.users.find(u => u.phone === phone && u.password === password);
            if (user) {
                state.user = user;
                saveSession();
                renderScreen('groups');
            } else {
                alert('Invalid credentials');
            }
        }
        
        if (e.target.id === 'signup-btn') {
            const name = document.getElementById('signup-name').value;
            const phone = document.getElementById('signup-phone').value;
            const password = document.getElementById('signup-password').value;
            const confirm = document.getElementById('signup-confirm').value;
            
            if (password !== confirm) {
                alert("Passwords don't match");
                return;
            }
            
            db.users.push({ phone, password, name });
            alert('Account created! Please login');
            renderScreen('login');
        }
        
        if (e.target.id === 'logout') {
            state.user = null;
            localStorage.removeItem('buzzall_user');
            renderScreen('login');
        }
    });
    
    // Group actions
    document.addEventListener('click', e => {
        if (e.target.id === 'create-group') {
            const name = prompt('Enter group name:');
            if (name) {
                state.groups.push({
                    id: Date.now().toString(),
                    name,
                    members: []
                });
                saveSession();
                renderScreen('groups');
            }
        }
        
        if (e.target.id === 'add-member') {
            const name = prompt('Member name:');
            const phone = prompt('Member phone:');
            if (name && phone) {
                const group = state.groups.find(g => g.id === state.currentGroup);
                if (group) {
                    group.members.push({
                        id: Date.now().toString(),
                        name,
                        phone
                    });
                    saveSession();
                    renderScreen('group-detail');
                }
            }
        }
        
        if (e.target.id === 'buzz-selected') {
            el.buzzSound.play();
            alert('Buzz sent to selected members!');
        }
        
        if (e.target.id === 'buzz-all') {
            el.buzzSound.play();
            alert('Buzz sent to all members!');
        }
    });
}

// Start the app
init();
