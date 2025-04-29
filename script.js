// ==============================================
// ============== APP CONFIGURATION =============
// ==============================================

// Twilio Configuration (Replace with your actual credentials)
const TWILIO_CONFIG = {
    accountSid: 'YOUR_TWILIO_ACCOUNT_SID',
    authToken: 'YOUR_TWILIO_AUTH_TOKEN',
    phoneNumber: 'YOUR_TWILIO_PHONE_NUMBER'
};

// Socket.IO Configuration
const socket = io('https://your-socket-server.com');

// ==============================================
// ============== STATE MANAGEMENT ==============
// ==============================================

let currentUser = null;
let currentGroup = null;
let groups = [];

// ==============================================
// ============== DOM ELEMENTS ==================
// ==============================================

// Auth Screens
const authScreens = document.getElementById('auth-screens');
const appScreens = document.getElementById('app-screens');
const loginScreen = document.getElementById('login-screen');
const signupScreen = document.getElementById('signup-screen');

// Login Elements
const loginPhoneInput = document.getElementById('login-phone');
const loginPasswordInput = document.getElementById('login-password');
const loginBtn = document.getElementById('login-btn');
const togglePasswordBtn = document.getElementById('toggle-password');
const showSignupLink = document.getElementById('show-signup');
const showLoginLink = document.getElementById('show-login');

// Signup Elements
const signupNameInput = document.getElementById('signup-name');
const signupPhoneInput = document.getElementById('signup-phone');
const signupPasswordInput = document.getElementById('signup-password');
const signupConfirmInput = document.getElementById('signup-confirm');
const signupBtn = document.getElementById('signup-btn');

// Groups Screen
const groupsScreen = document.getElementById('groups-screen');
const groupsList = document.getElementById('groups-list');
const createGroupBtn = document.getElementById('create-group-btn');
const logoutBtn = document.getElementById('logout-btn');

// Create Group Screen
const createGroupScreen = document.getElementById('create-group-screen');
const groupNameInput = document.getElementById('group-name');
const saveGroupBtn = document.getElementById('save-group-btn');
const cancelCreateBtn = document.getElementById('cancel-create');

// Group Detail Screen
const groupDetailScreen = document.getElementById('group-detail-screen');
const groupDetailTitle = document.getElementById('group-detail-title');
const membersList = document.getElementById('members-list');
const newMemberNameInput = document.getElementById('new-member-name');
const newMemberPhoneInput = document.getElementById('new-member-phone');
const addMemberBtn = document.getElementById('add-member-btn');
const buzzAllBtn = document.getElementById('buzz-all-btn');
const buzzSelectedBtn = document.getElementById('buzz-selected-btn');
const backToGroupsBtn = document.getElementById('back-to-groups');

// Notification System
const notification = document.getElementById('notification');

// ==============================================
// ============== EVENT LISTENERS ===============
// ==============================================

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadUser();
    setupEventListeners();
    setupSocketIO();
});

function setupEventListeners() {
    // Auth Events
    loginBtn.addEventListener('click', handleLogin);
    signupBtn.addEventListener('click', handleSignup);
    showSignupLink.addEventListener('click', showSignup);
    showLoginLink.addEventListener('click', showLogin);
    togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
    logoutBtn.addEventListener('click', handleLogout);
    
    // Group Events
    createGroupBtn.addEventListener('click', showCreateGroup);
    saveGroupBtn.addEventListener('click', handleCreateGroup);
    cancelCreateBtn.addEventListener('click', showGroupsScreen);
    backToGroupsBtn.addEventListener('click', showGroupsScreen);
    
    // Member Events
    addMemberBtn.addEventListener('click', handleAddMember);
    buzzAllBtn.addEventListener('click', handleBuzzAll);
    buzzSelectedBtn.addEventListener('click', handleBuzzSelected);
}

function setupSocketIO() {
    socket.on('connect', () => {
        console.log('Connected to socket server');
    });
    
    socket.on('buzz-received', () => {
        showNotification('Buzz received!', 'success');
        // In a real app, you would play a buzz sound here
    });
}

// ==============================================
// ============== AUTH FUNCTIONS ================
// ==============================================

function handleLogin() {
    const phone = loginPhoneInput.value.trim();
    const password = loginPasswordInput.value.trim();
    
    if (!phone || !password) {
        showNotification('Please enter phone and password', 'error');
        return;
    }
    
    // In a real app, this would be an API call
    const users = JSON.parse(localStorage.getItem('users') || {};
    const user = users[phone];
    
    if (user && user.password === password) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        loadUserGroups();
        showApp();
        showNotification('Login successful', 'success');
    } else {
        showNotification('Invalid phone or password', 'error');
    }
}

function handleSignup() {
    const name = signupNameInput.value.trim();
    const phone = signupPhoneInput.value.trim();
    const password = signupPasswordInput.value.trim();
    const confirm = signupConfirmInput.value.trim();
    
    if (!name || !phone || !password || !confirm) {
        showNotification('Please fill all fields', 'error');
        return;
    }
    
    if (password !== confirm) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    // In a real app, this would be an API call
    const users = JSON.parse(localStorage.getItem('users') || {});
    
    if (users[phone]) {
        showNotification('Phone number already registered', 'error');
        return;
    }
    
    users[phone] = {
        name,
        phone,
        password,
        groups: []
    };
    
    localStorage.setItem('users', JSON.stringify(users));
    showNotification('Account created successfully', 'success');
    showLogin();
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showAuth();
    showNotification('Logged out successfully', 'success');
}

// ==============================================
// ============== GROUP FUNCTIONS ===============
// ==============================================

function loadUserGroups() {
    if (!currentUser) return;
    
    // In a real app, this would load from a database
    groups = currentUser.groups || [];
    renderGroupsList();
}

function handleCreateGroup() {
    const name = groupNameInput.value.trim();
    
    if (!name) {
        showNotification('Please enter a group name', 'error');
        return;
    }
    
    const newGroup = {
        id: Date.now().toString(),
        name,
        members: [],
        createdAt: new Date().toISOString()
    };
    
    currentUser.groups.push(newGroup);
    saveUserData();
    loadUserGroups();
    showGroupsScreen();
    showNotification('Group created successfully', 'success');
}

function handleAddMember() {
    if (!currentGroup) return;
    
    const name = newMemberNameInput.value.trim();
    const phone = newMemberPhoneInput.value.trim();
    
    if (!name || !phone) {
        showNotification('Please enter name and phone', 'error');
        return;
    }
    
    // Simple phone validation
    if (!phone.match(/^\+?[0-9]{10,15}$/)) {
        showNotification('Please enter a valid phone number', 'error');
        return;
    }
    
    currentGroup.members.push({
        id: Date.now().toString(),
        name,
        phone,
        selected: false
    });
    
    saveUserData();
    renderMembersList();
    newMemberNameInput.value = '';
    newMemberPhoneInput.value = '';
    showNotification('Member added successfully', 'success');
}

// ==============================================
// ============== BUZZ FUNCTIONS ================
// ==============================================

function handleBuzzAll() {
    if (!currentGroup || currentGroup.members.length === 0) {
        showNotification('No members to buzz', 'error');
        return;
    }
    
    // In a real app, this would use Twilio API
    currentGroup.members.forEach(member => {
        sendBuzz(member.phone);
    });
    
    showNotification(`Buzz sent to ${currentGroup.members.length} members`, 'success');
}

function handleBuzzSelected() {
    if (!currentGroup) return;
    
    const selectedMembers = currentGroup.members.filter(m => m.selected);
    
    if (selectedMembers.length === 0) {
        showNotification('No members selected', 'error');
        return;
    }
    
    selectedMembers.forEach(member => {
        sendBuzz(member.phone);
    });
    
    showNotification(`Buzz sent to ${selectedMembers.length} members`, 'success');
}

async function sendBuzz(phoneNumber) {
    try {
        // In a real app, you would use Twilio API here
        console.log(`Sending buzz to ${phoneNumber}`);
        
        // Example Twilio API call (commented out)
        /*
        const response = await fetch('https://api.twilio.com/2010-04-01/Accounts/${TWILIO_CONFIG.accountSid}/Messages.json', {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + btoa(`${TWILIO_CONFIG.accountSid}:${TWILIO_CONFIG.authToken}`),
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                To: phoneNumber,
                From: TWILIO_CONFIG.phoneNumber,
                Body: 'BUZZ! You received a buzz notification!'
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to send buzz');
        }
        */
        
        // For demo purposes, we'll use Socket.IO
        socket.emit('send-buzz', { to: phoneNumber });
    } catch (error) {
        console.error('Error sending buzz:', error);
        showNotification('Failed to send buzz', 'error');
    }
}

// ==============================================
// ============== UI FUNCTIONS ==================
// ==============================================

function showAuth() {
    authScreens.style.display = 'block';
    appScreens.style.display = 'none';
    showLogin();
}

function showApp() {
    authScreens.style.display = 'none';
    appScreens.style.display = 'block';
    showGroupsScreen();
}

function showLogin() {
    loginScreen.classList.add('active');
    signupScreen.classList.remove('active');
    loginPhoneInput.focus();
}

function showSignup() {
    signupScreen.classList.add('active');
    loginScreen.classList.remove('active');
    signupNameInput.focus();
}

function showGroupsScreen() {
    groupsScreen.classList.add('active');
    createGroupScreen.classList.remove('active');
    groupDetailScreen.classList.remove('active');
    loadUserGroups();
}

function showCreateGroup() {
    groupsScreen.classList.remove('active');
    createGroupScreen.classList.add('active');
    groupDetailScreen.classList.remove('active');
    groupNameInput.value = '';
    groupNameInput.focus();
}

function showGroupDetail(groupId) {
    currentGroup = groups.find(g => g.id === groupId);
    if (!currentGroup) return;
    
    groupsScreen.classList.remove('active');
    createGroupScreen.classList.remove('active');
    groupDetailScreen.classList.add('active');
    
    groupDetailTitle.innerHTML = `<i class="fas fa-users"></i> ${currentGroup.name}`;
    renderMembersList();
}

function renderGroupsList() {
    if (!groups || groups.length === 0) {
        groupsList.innerHTML = '<p class="empty-message">No groups yet. Create your first group!</p>';
        return;
    }
    
    groupsList.innerHTML = groups.map(group => `
        <div class="group-card" onclick="showGroupDetail('${group.id}')">
            <div>
                <h3>${group.name}</h3>
                <p>${group.members.length} members</p>
            </div>
            <i class="fas fa-chevron-right"></i>
        </div>
    `).join('');
}

function renderMembersList() {
    if (!currentGroup || !currentGroup.members) {
        membersList.innerHTML = '<p class="empty-message">No members yet. Add your first member!</p>';
        buzzSelectedBtn.disabled = true;
        return;
    }
    
    membersList.innerHTML = currentGroup.members.map(member => `
        <div class="member-card ${member.selected ? 'selected' : ''}" 
             onclick="toggleMemberSelection('${member.id}')">
            <div>
                <h3>${member.name}</h3>
                <p>${member.phone}</p>
            </div>
            <i class="fas ${member.selected ? 'fa-check-circle' : 'fa-circle'}"></i>
        </div>
    `).join('');
    
    // Enable/disable buzz selected button based on selections
    const hasSelected = currentGroup.members.some(m => m.selected);
    buzzSelectedBtn.disabled = !hasSelected;
}

function toggleMemberSelection(memberId) {
    if (!currentGroup) return;
    
    const member = currentGroup.members.find(m => m.id === memberId);
    if (member) {
        member.selected = !member.selected;
        saveUserData();
        renderMembersList();
    }
}

function togglePasswordVisibility() {
    const isPassword = loginPasswordInput.type === 'password';
    loginPasswordInput.type = isPassword ? 'text' : 'password';
    togglePasswordBtn.innerHTML = isPassword ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
}

function showNotification(message, type = '') {
    notification.textContent = message;
    notification.className = 'notification show';
    if (type) notification.classList.add(type);
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// ==============================================
// ============== UTILITY FUNCTIONS =============
// ==============================================

function loadUser() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
        currentUser = JSON.parse(userData);
        loadUserGroups();
        showApp();
    }
}

function saveUserData() {
    if (currentUser) {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
}

// ==============================================
// ============== GLOBAL FUNCTIONS ==============
// ==============================================

// Make functions available globally for HTML event handlers
window.showGroupDetail = showGroupDetail;
window.toggleMemberSelection = toggleMemberSelection;
