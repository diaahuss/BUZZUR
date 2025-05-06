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

// Initialize App
function init() {
    renderLoginScreen();
    setupEventListeners();
}

// Screen Rendering
function renderLoginScreen() {
    elements.app.innerHTML = `
        <div class="screen login-screen">
            <div class="banner">BUZZALL</div>
            <div class="form-container">
                <div class="input-group">
                    <label for="phone">Phone Number</label>
                    <input type="tel" id="phone" placeholder="+1234567890" required>
                </div>
                <div class="input-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" placeholder="••••••••" required>
                    <label class="checkbox-container">
                        <input type="checkbox" id="showPassword"> Show password
                    </label>
                </div>
                <button id="loginBtn" class="btn primary">Login</button>
                <div class="links">
                    <a href="#" id="createAccountLink">Create Account</a>
                </div>
            </div>
        </div>
    `;
    // Clear inputs when rendering login screen
    document.getElementById('phone').value = '';
    document.getElementById('password').value = '';
}

function renderGroupsScreen() {
    elements.app.innerHTML = `
        <div class="screen groups-screen">
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

function renderGroupDetailScreen(groupId) {
    const group = appState.groups.find(g => g.id === groupId);
    if (!group) return;
    
    elements.app.innerHTML = `
        <div class="screen group-detail-screen">
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
}

// Event Handlers
function setupEventListeners() {
    document.addEventListener('click', (e) => {
        // Back button
        if (e.target.closest('#backToGroups')) {
            renderGroupsScreen();
        }
        
        // Group click
        if (e.target.closest('.group-item')) {
            const groupId = e.target.closest('.group-item').dataset.groupId;
            renderGroupDetailScreen(groupId);
        }
        
        // Login
        if (e.target.id === 'loginBtn') {
            const phone = document.getElementById('phone').value;
            const password = document.getElementById('password').value;
            
            if (phone && password) {
                appState.currentUser = { phone };
                renderGroupsScreen();
            }
        }
        
        // Create Account
        if (e.target.id === 'createAccountLink') {
            e.preventDefault();
            renderSignupScreen();
        }
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', init);
