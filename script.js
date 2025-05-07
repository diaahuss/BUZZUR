const appState = {
    currentUser: null,
    currentGroup: null,
    groups: [
        {
            id: '1',
            name: 'Family',
            members: [
                { id: '1', name: 'Mom', phone: '+1234567891' },
                { id: '2', name: 'Dad', phone: '+1234567892' }
            ]
        }
    ]
};

const elements = {
    app: document.getElementById('app'),
    buzzSound: document.getElementById('buzzSound')
};

function init() {
    renderLoginScreen();
    setupEventListeners();
}

function renderLoginScreen() {
    elements.app.innerHTML = `
        <div class="screen">
            <div class="banner">BUZZALL</div>
            <div class="form-container">
                <div class="input-group">
                    <label for="phone">Phone Number</label>
                    <input type="tel" id="phone" placeholder="+1234567890" required>
                </div>
                <div class="input-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" placeholder="••••••••" required>
                </div>
                <button id="loginBtn" class="btn primary">Login</button>
                <div class="links">
                    <a href="#" id="createAccountLink">Create Account</a>
                </div>
            </div>
        </div>
    `;
}

function renderGroupsScreen() {
    elements.app.innerHTML = `
        <div class="screen">
            <div class="banner">MY GROUPS</div>
            <div class="group-list">
                ${appState.groups.map(group => `
                    <div class="group-item" data-group-id="${group.id}">
                        <div class="group-info">
                            <h3>${group.name}</h3>
                            <span>${group.members.length} members</span>
                        </div>
                        <i class="fas fa-chevron-right"></i>
                    </div>
                `).join('')}
            </div>
            <div class="action-buttons">
                <button id="createGroupBtn" class="btn primary">Create Group</button>
                <button id="logoutBtn" class="btn secondary">Logout</button>
            </div>
        </div>
    `;
}

function renderGroupDetailScreen(groupId) {
    const group = appState.groups.find(g => g.id === groupId);
    if (!group) return;

    elements.app.innerHTML = `
        <div class="screen">
            <div class="screen-header">
                <button class="back-button" id="backToGroups">
                    <i class="fas fa-arrow-left"></i>
                </button>
                <h2>${group.name}</h2>
            </div>
            <div class="member-list">
                ${group.members.map(member => `
                    <div class="member-item">
                        <input type="checkbox" id="member-${member.id}" class="member-checkbox">
                        <div class="member-info">
                            <div>${member.name}</div>
                            <div>${member.phone}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="action-buttons">
                <button id="addMemberBtn" class="btn primary">Add Member</button>
                <button id="buzzAllBtn" class="btn accent">Buzz All</button>
            </div>
        </div>
    `;
}

function setupEventListeners() {
    document.addEventListener('click', (e) => {
        // Login
        if (e.target.id === 'loginBtn') {
            appState.currentUser = { name: "Test User" };
            renderGroupsScreen();
        }
        
        // Create Account
        if (e.target.id === 'createAccountLink') {
            e.preventDefault();
            alert('Signup functionality coming soon!');
        }
        
        // Logout
        if (e.target.id === 'logoutBtn') {
            appState.currentUser = null;
            renderLoginScreen();
        }
        
        // Create Group
        if (e.target.id === 'createGroupBtn') {
            const name = prompt('Enter group name:');
            if (name) {
                appState.groups.push({
                    id: Date.now().toString(),
                    name,
                    members: []
                });
                renderGroupsScreen();
            }
        }
        
        // Back to Groups
        if (e.target.closest('#backToGroups')) {
            renderGroupsScreen();
        }
        
        // View Group
        if (e.target.closest('.group-item')) {
            const groupId = e.target.closest('.group-item').dataset.groupId;
            renderGroupDetailScreen(groupId);
        }
        
        // Buzz All
        if (e.target.id === 'buzzAllBtn') {
            elements.buzzSound.play();
            alert('Buzz sent to all members!');
        }
    });
}

document.addEventListener('DOMContentLoaded', init);
