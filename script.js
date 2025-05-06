// App State
const appState = {
    currentUser: null,
    currentGroup: null,
    groups: []
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

// Load data from localStorage
function loadFromStorage() {
    const user = localStorage.getItem('buzzall_user');
    const groups = localStorage.getItem('buzzall_groups');
    
    if (user) {
        appState.currentUser = JSON.parse(user);
        appState.groups = groups ? JSON.parse(groups) : database.groups;
    }
}

// Save data to localStorage
function saveToStorage() {
    if (appState.currentUser) {
        localStorage.setItem('buzzall_user', JSON.stringify(appState.currentUser));
        localStorage.setItem('buzzall_groups', JSON.stringify(appState.groups));
    }
}

// Render Screens
function renderScreen(screen) {
    switch (screen) {
        case 'login':
            renderLoginScreen();
            break;
        case 'signup':
            renderSignupScreen();
            break;
        case 'groups':
            renderGroupsScreen();
            break;
        case 'group-detail':
            renderGroupDetailScreen();
            break;
    }
}

// Login Screen
function renderLoginScreen() {
    elements.app.innerHTML = `
        <div class="login-screen">
            <div class="banner">BUZZALL</div>
            <div class="form-container">
                <div class="input-group">
                    <label for="phone">Phone Number</label>
                    <input type="tel" id="phone" value="+1234567890" placeholder="+1234567890" required>
                </div>
                <div class="input-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" value="password123" placeholder="••••••••" required>
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
        </div>
    `;
}

// Signup Screen
function renderSignupScreen() {
    elements.app.innerHTML = `
        <div class="signup-screen">
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
        </div>
    `;
}

// Groups Screen
function renderGroupsScreen() {
    elements.app.innerHTML = `
        <div class="groups-screen">
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
        </div>
    `;
}

// Group Detail Screen
function renderGroupDetailScreen() {
    if (!appState.currentGroup) return;
    
    const group = appState.groups.find(g => g.id === appState.currentGroup);
    if (!group) return;
    
    elements.app.innerHTML = `
        <div class="group-detail-screen">
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
        </div>
    `;

    // Add back button functionality
    document.getElementById('backToGroups').addEventListener('click', () => {
        renderGroupsScreen();
    });
}

// Modals
function showCreateGroupModal() {
    const modalHTML = `
        <div class="modal active">
            <div class="modal-content">
                <h3>Create New Group</h3>
                <div class="input-group">
                    <input type="text" id="newGroupName" placeholder="Enter group name" required>
                </div>
                <div class="modal-actions">
                    <button id="cancelCreateGroup" class="btn secondary">Cancel</button>
                    <button id="confirmCreateGroup" class="btn primary">Create</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function showAddMemberModal() {
    const modalHTML = `
        <div class="modal active">
            <div class="modal-content">
                <h3>Add New Member</h3>
                <div class="input-group">
                    <input type="text" id="newMemberName" placeholder="Member name" required>
                </div>
                <div class="input-group">
                    <input type="tel" id="newMemberPhone" placeholder="Phone number" required>
                </div>
                <div class="modal-actions">
                    <button id="cancelAddMember" class="btn secondary">Cancel</button>
                    <button id="confirmAddMember" class="btn primary">Add</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) modal.remove();
}

// Alert System
function showAlert(message, isSuccess = false) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert ${isSuccess ? 'success' : 'error'}`;
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

// Event Listeners
function setupEventListeners() {
    // Password visibility toggles
    document.addEventListener('change', (e) => {
        if (e.target.id === 'showPassword') {
            const input = document.getElementById('password');
            input.type = e.target.checked ? 'text' : 'password';
        }
        
        if (e.target.id === 'showPasswords') {
            const pw1 = document.getElementById('password');
            const pw2 = document.getElementById('confirmPassword');
            if (pw1 && pw2) {
                pw1.type = pw2.type = e.target.checked ? 'text' : 'password';
            }
        }
    });
    
    // Navigation
    document.addEventListener('click', (e) => {
        if (e.target.id === 'createAccountLink' || e.target.id === 'loginLink') {
            e.preventDefault();
            renderScreen(e.target.id === 'createAccountLink' ? 'signup' : 'login');
        }
        
        if (e.target.id === 'backBtn') {
            renderScreen('groups');
        }
    });
    
    // Authentication
    document.addEventListener('click', (e) => {
        if (e.target.id === 'loginBtn') {
            const phone = document.getElementById('phone').value;
            const password = document.getElementById('password').value;
            
            const user = database.users.find(u => u.phone === phone && u.password === password);
            if (user) {
                appState.currentUser = user;
                saveToStorage();
                renderScreen('groups');
            } else {
                showAlert('Invalid phone number or password');
            }
        }
        
        if (e.target.id === 'signupBtn') {
            const fullName = document.getElementById('fullName').value;
            const phone = document.getElementById('phone').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password !== confirmPassword) {
                showAlert("Passwords don't match");
                return;
            }
            
            database.users.push({
                phone,
                password,
                name: fullName
            });
            
            showAlert("Account created successfully! Please login.", true);
            renderScreen('login');
        }
        
        if (e.target.id === 'logoutBtn') {
            appState.currentUser = null;
            localStorage.removeItem('buzzall_user');
            renderScreen('login');
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
            showCreateGroupModal();
        }
        
        if (e.target.id === 'addMemberBtn') {
            showAddMemberModal();
        }
        
        if (e.target.id === 'confirmCreateGroup') {
            const name = document.getElementById('newGroupName').value.trim();
            if (name) {
                appState.groups.push({
                    id: 'group' + Date.now(),
                    name,
                    members: []
                });
                saveToStorage();
                closeModal();
                renderScreen('groups');
                showAlert(`Group "${name}" created!`, true);
            }
        }
        
        if (e.target.id === 'confirmAddMember') {
            const name = document.getElementById('newMemberName').value.trim();
            const phone = document.getElementById('newMemberPhone').value.trim();
            
            if (name && phone) {
                const group = appState.groups.find(g => g.id === appState.currentGroup);
                if (group) {
                    group.members.push({
                        id: 'member' + Date.now(),
                        name,
                        phone
                    });
                    saveToStorage();
                    closeModal();
                    renderScreen('group-detail');
                    showAlert(`Added ${name} to group!`, true);
                }
            }
        }
        
        if (e.target.id === 'cancelCreateGroup' || e.target.id === 'cancelAddMember') {
            closeModal();
        }
        
        // Buzz functionality
        if (e.target.id === 'buzzSelectedBtn') {
            const selected = Array.from(document.querySelectorAll('.member-checkbox:checked'))
                .map(cb => cb.id.replace('member-', ''));
            
            if (selected.length > 0) {
                elements.buzzSound.play();
                showAlert(`Buzzed ${selected.length} members!`, true);
            } else {
                showAlert('Please select at least one member');
            }
        }
        
        if (e.target.id === 'buzzAllBtn') {
            const group = appState.groups.find(g => g.id === appState.currentGroup);
            if (group) {
                elements.buzzSound.play();
                showAlert(`Buzzed all ${group.members.length} members!`, true);
            }
        }
        
        // Remove members
        if (e.target.id === 'removeMemberBtn') {
            const selected = Array.from(document.querySelectorAll('.member-checkbox:checked'))
                .map(cb => cb.id.replace('member-', ''));
            
            if (selected.length > 0) {
                const group = appState.groups.find(g => g.id === appState.currentGroup);
                if (group) {
                    group.members = group.members.filter(m => !selected.includes(m.id));
                    saveToStorage();
                    renderScreen('group-detail');
                    showAlert(`Removed ${selected.length} members`, true);
                }
            } else {
                showAlert('Please select members to remove');
            }
        }
    });
}

// Start the app
init();
