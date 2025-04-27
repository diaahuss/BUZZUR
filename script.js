/*********************
 * APP STATE
 *********************/
let currentUser = null;
let groups = [];
const DEBUG = true;

/*********************
 * CORE UTILITIES
 *********************/
function debugLog(...args) {
    if (DEBUG) console.log('[DEBUG]', ...args);
}

function getElement(id) {
    const el = document.getElementById(id);
    if (!el) console.warn(`Element #${id} not found`);
    return el;
}

function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.style.display = 'none';
    });
    const target = getElement(screenId);
    if (target) {
        target.style.display = 'block';
        debugLog(`Switched to screen: ${screenId}`);
    }
}

/*********************
 * AUTHENTICATION
 *********************/
function loginUser() {
    const phone = getElement('login-phone').value;
    const password = getElement('login-password').value;
    
    if (!phone || !password) {
        alert('Please enter both phone and password');
        return;
    }
    
    currentUser = { phone, password };
    debugLog('User logged in:', phone);
    switchScreen('my-groups-screen');
    renderGroups();
}

function signUpUser() {
    const name = getElement('signup-name').value.trim();
    const phone = getElement('signup-phone').value.trim();
    const password = getElement('signup-password').value;
    const confirmPassword = getElement('signup-confirm-password').value;
    
    if (!name || !phone || !password || !confirmPassword) {
        alert('Please fill all fields');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    currentUser = { name, phone, password };
    alert('Registration successful!');
    switchScreen('login-screen');
}

function logout() {
    currentUser = null;
    switchScreen('login-screen');
}

/*********************
 * GROUP MANAGEMENT
 *********************/
function showCreateGroupScreen() {
    getElement('new-group-name').value = '';
    switchScreen('create-group-screen');
}

function createGroup() {
    const groupName = getElement('new-group-name').value.trim();
    
    if (!groupName) {
        alert('Please enter a group name');
        return;
    }
    
    const newGroup = {
        id: Date.now().toString(),
        name: groupName,
        members: []
    };
    
    groups.push(newGroup);
    debugLog('Group created:', groupName);
    alert(`Group "${groupName}" created successfully!`);
    switchScreen('my-groups-screen');
    renderGroups();
}

function renderGroups() {
    const container = getElement('group-list');
    if (!container) return;
    
    container.innerHTML = groups.map(group => `
        <div class="group-card" data-group-id="${group.id}">
            <h3>${group.name}</h3>
            <div class="group-actions">
                <button class="btn" onclick="startBuzz('${group.id}')">
                    <i class="fas fa-bell"></i> Buzz
                </button>
            </div>
        </div>
    `).join('');
}

/*********************
 * BUZZ FUNCTIONALITY
 *********************/
function startBuzz(groupId) {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;
    
    getElement('current-buzz-group').value = groupId;
    renderMemberList(group.members);
    switchScreen('buzz-screen');
}

function renderMemberList(members) {
    const container = getElement('member-list');
    if (!container) return;
    
    container.innerHTML = members.map(member => `
        <div class="member-card">
            <label>
                <input type="checkbox" value="${member.phone}">
                ${member.name} (${member.phone})
            </label>
        </div>
    `).join('');
}

function sendBuzz() {
    const groupId = getElement('current-buzz-group').value;
    const group = groups.find(g => g.id === groupId);
    
    if (!group || group.members.length === 0) {
        alert('No members in this group');
        return;
    }
    
    const selected = Array.from(
        document.querySelectorAll('#member-list input:checked')
    ).map(el => el.value);
    
    if (selected.length === 0) {
        alert('Please select at least one member');
        return;
    }
    
    // Play buzz sound
    const sound = getElement('buzz-sound');
    if (sound) sound.play();
    
    alert(`Buzz sent to ${selected.length} members!`);
    debugLog('Buzz sent to:', selected);
}

/*********************
 * EVENT LISTENERS
 *********************/
function initEventListeners() {
    // Auth
    getElement('login-btn').addEventListener('click', loginUser);
    getElement('signup-btn').addEventListener('click', signUpUser);
    getElement('logout-btn').addEventListener('click', logout);
    
    // Groups
    getElement('create-group-btn').addEventListener('click', showCreateGroupScreen);
    getElement('confirm-create-group').addEventListener('click', createGroup);
    getElement('cancel-create-group').addEventListener('click', () => switchScreen('my-groups-screen'));
    
    // Buzz
    getElement('send-buzz-btn').addEventListener('click', sendBuzz);
    getElement('cancel-buzz').addEventListener('click', () => switchScreen('my-groups-screen'));
    
    // Navigation
    getElement('to-signup').addEventListener('click', () => switchScreen('signup-screen'));
    getElement('to-login').addEventListener('click', () => switchScreen('login-screen'));
    getElement('refresh-groups').addEventListener('click', renderGroups);
    
    // Password toggle
    getElement('toggle-password').addEventListener('click', togglePasswordVisibility);
}

function togglePasswordVisibility() {
    const input = getElement('login-password');
    const button = getElement('toggle-password');
    if (input && button) {
        input.type = input.type === 'password' ? 'text' : 'password';
        button.innerHTML = input.type === 'password' 
            ? '<i class="fas fa-eye"></i>' 
            : '<i class="fas fa-eye-slash"></i>';
    }
}

/*********************
 * INITIALIZATION
 *********************/
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    switchScreen('login-screen');
    debugLog('App initialized');
});
