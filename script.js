// Data Store
let currentUser = null;
const users = [
    { phone: "+1234567890", password: "password123", name: "Test User" }
];
let groups = [
    { 
        id: "1", 
        name: "Family", 
        members: [
            { name: "John Doe", phone: "+1234567891" },
            { name: "Jane Doe", phone: "+1234567892" }
        ] 
    },
    { 
        id: "2", 
        name: "Friends", 
        members: [
            { name: "Alex Johnson", phone: "+1234567893" }
        ] 
    }
];

// DOM Elements
const authScreens = document.getElementById('auth-screens');
const appScreens = document.getElementById('app-screens');
const loginScreen = document.getElementById('login-screen');
const signupScreen = document.getElementById('signup-screen');
const groupsScreen = document.getElementById('groups-screen');
const groupDetailScreen = document.getElementById('group-detail-screen');

// Initialize the App
function init() {
    setupEventListeners();
    appScreens.style.display = 'none';
    
    // For testing - remove in production
    // currentUser = users[0];
    // showApp();
}

// Set up all event listeners
function setupEventListeners() {
    // Password toggles
    document.querySelectorAll('.toggle-password').forEach(icon => {
        icon.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            input.type = input.type === 'password' ? 'text' : 'password';
            this.classList.toggle('fa-eye-slash');
        });
    });
    
    // Auth navigation
    document.getElementById('show-signup').addEventListener('click', () => toggleAuthScreens());
    document.getElementById('show-login').addEventListener('click', () => toggleAuthScreens());
    document.getElementById('forgot-password').addEventListener('click', handleForgotPassword);
    
    // Auth actions
    document.getElementById('login-btn').addEventListener('click', handleLogin);
    document.getElementById('signup-btn').addEventListener('click', handleSignup);
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // Group actions
    document.getElementById('create-group-btn').addEventListener('click', handleCreateGroup);
    document.getElementById('back-to-groups').addEventListener('click', () => showScreen('groups'));
    document.getElementById('edit-group-btn').addEventListener('click', () => showEditGroupModal());
    document.getElementById('add-member-btn').addEventListener('click', () => showAddMemberModal());
    document.getElementById('delete-group-btn').addEventListener('click', handleDeleteGroup);
    document.getElementById('buzz-selected-btn').addEventListener('click', handleBuzzSelected);
    document.getElementById('buzz-all-btn').addEventListener('click', handleBuzzAll);
    
    // Modal actions
    document.getElementById('cancel-edit-group').addEventListener('click', () => hideModal('edit-group'));
    document.getElementById('save-group-name').addEventListener('click', handleSaveGroupName);
    document.getElementById('cancel-add-member').addEventListener('click', () => hideModal('add-member'));
    document.getElementById('confirm-add-member').addEventListener('click', handleAddMember);
}

// Toggle between login/signup screens
function toggleAuthScreens() {
    loginScreen.classList.toggle('active');
    signupScreen.classList.toggle('active');
}

// Handle login
function handleLogin() {
    const phone = document.getElementById('login-phone').value;
    const password = document.getElementById('login-password').value;
    
    if (!phone || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    const user = users.find(u => u.phone === phone && u.password === password);
    
    if (user) {
        currentUser = user;
        showNotification('Login successful!', 'success');
        showApp();
    } else {
        showNotification('Invalid phone or password', 'error');
    }
}

// Handle signup
function handleSignup() {
    const name = document.getElementById('signup-name').value;
    const phone = document.getElementById('signup-phone').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm').value;
    
    if (!name || !phone || !password || !confirmPassword) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    if (users.some(u => u.phone === phone)) {
        showNotification('Phone number already registered', 'error');
        return;
    }
    
    users.push({ phone, password, name });
    showNotification('Account created! Please login.', 'success');
    toggleAuthScreens();
    clearSignupForm();
}

// Handle forgot password
function handleForgotPassword() {
    showNotification('Password reset link sent (simulated)', 'info');
}

// Handle logout
function handleLogout() {
    currentUser = null;
    authScreens.style.display = 'block';
    appScreens.style.display = 'none';
    loginScreen.classList.add('active');
    signupScreen.classList.remove('active');
    showNotification('Logged out successfully', 'success');
}

// Show app screens
function showApp() {
    authScreens.style.display = 'none';
    appScreens.style.display = 'flex';
    showScreen('groups');
}

// Show specific screen
function showScreen(screenName) {
    groupsScreen.classList.remove('active');
    groupDetailScreen.classList.remove('active');
    
    switch (screenName) {
        case 'groups':
            groupsScreen.classList.add('active');
            loadGroups();
            break;
        case 'group-detail':
            groupDetailScreen.classList.add('active');
            loadGroupDetail();
            break;
    }
}

// Load groups list
function loadGroups() {
    const groupsList = document.getElementById('groups-list');
    groupsList.innerHTML = groups.map(group => `
        <div class="group-card" data-group-id="${group.id}">
            <div class="group-name">${group.name}</div>
            <div class="member-count">${group.members.length}</div>
        </div>
    `).join('');
    
    // Add event listeners to group cards
    document.querySelectorAll('.group-card').forEach(card => {
        card.addEventListener('click', function() {
            currentGroupId = this.dataset.groupId;
            showScreen('group-detail');
        });
    });
}

// Load group detail
function loadGroupDetail() {
    const group = groups.find(g => g.id === currentGroupId);
    if (!group) return;
    
    document.getElementById('group-detail-title').textContent = group.name;
    const membersList = document.getElementById('members-list');
    
    membersList.innerHTML = group.members.map(member => `
        <div class="member-card">
            <input type="checkbox" class="member-checkbox" data-phone="${member.phone}">
            <div class="member-info">
                <div class="member-name">${member.name}</div>
                <div class="member-phone">${member.phone}</div>
            </div>
        </div>
    `).join('');
}

// Handle create group
function handleCreateGroup() {
    const groupName = prompt("Enter group name:");
    if (!groupName) return;
    
    const newGroup = {
        id: Date.now().toString(),
        name: groupName,
        members: []
    };
    
    groups.push(newGroup);
    showNotification('Group created successfully!', 'success');
    loadGroups();
}

// Show edit group modal
function showEditGroupModal() {
    const group = groups.find(g => g.id === currentGroupId);
    if (group) {
        document.getElementById('edit-group-name').value = group.name;
        showModal('edit-group');
    }
}

// Handle save group name
function handleSaveGroupName() {
    const newName = document.getElementById('edit-group-name').value;
    if (!newName) {
        showNotification('Group name cannot be empty', 'error');
        return;
    }
    
    const group = groups.find(g => g.id === currentGroupId);
    if (group) {
        group.name = newName;
        document.getElementById('group-detail-title').textContent = newName;
        showNotification('Group name updated', 'success');
        hideModal('edit-group');
        loadGroups(); // Update name in groups list
    }
}

// Show add member modal
function showAddMemberModal() {
    document.getElementById('new-member-name').value = '';
    document.getElementById('new-member-phone').value = '';
    showModal('add-member');
}

// Handle add member
function handleAddMember() {
    const name = document.getElementById('new-member-name').value;
    const phone = document.getElementById('new-member-phone').value;
    
    if (!name || !phone) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    const group = groups.find(g => g.id === currentGroupId);
    if (group) {
        if (group.members.some(m => m.phone === phone)) {
            showNotification('Member already exists in this group', 'error');
            return;
        }
        
        group.members.push({ name, phone });
        showNotification('Member added successfully', 'success');
        hideModal('add-member');
        loadGroupDetail();
    }
}

// Handle delete group
function handleDeleteGroup() {
    if (!confirm('Are you sure you want to delete this group?')) return;
    
    groups = groups.filter(g => g.id !== currentGroupId);
    showNotification('Group deleted', 'success');
    showScreen('groups');
}

// Handle buzz selected members
function handleBuzzSelected() {
    const checkboxes = document.querySelectorAll('.member-checkbox:checked');
    if (checkboxes.length === 0) {
        showNotification('Please select members to buzz', 'error');
        return;
    }
    
    const phones = Array.from(checkboxes).map(cb => cb.dataset.phone);
    showNotification(`Buzzing ${phones.length} members`, 'success');
    // In a real app, this would call your backend/Twilio API
}

// Handle buzz all members
function handleBuzzAll() {
    const group = groups.find(g => g.id === currentGroupId);
    if (group && group.members.length > 0) {
        showNotification(`Buzzing all ${group.members.length} members`, 'success');
        // In a real app, this would call your backend/Twilio API
    } else {
        showNotification('No members to buzz', 'error');
    }
}

// Show modal
function showModal(modalId) {
    document.getElementById(`${modalId}-modal`).classList.add('active');
}

// Hide modal
function hideModal(modalId
