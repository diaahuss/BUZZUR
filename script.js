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
    }
];

// DOM Elements
const authScreens = document.getElementById('auth-screens');
const appScreens = document.getElementById('app-screens');
const loginScreen = document.getElementById('login-screen');
const signupScreen = document.getElementById('signup-screen');
const groupsScreen = document.getElementById('groups-screen');
const groupDetailScreen = document.getElementById('group-detail-screen');

// Buttons
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const showSignup = document.getElementById('show-signup');
const showLogin = document.getElementById('show-login');
const logoutBtn = document.getElementById('logout-btn');
const createGroupBtn = document.getElementById('create-group-btn');
const backToGroups = document.getElementById('back-to-groups');
const editGroupBtn = document.getElementById('edit-group-btn');
const addMemberBtn = document.getElementById('add-member-btn');
const removeMembersBtn = document.getElementById('remove-members-btn');
const buzzSelectedBtn = document.getElementById('buzz-selected-btn');
const buzzAllBtn = document.getElementById('buzz-all-btn');
const deleteGroupBtn = document.getElementById('delete-group-btn');

// Modals
const editGroupModal = document.getElementById('edit-group-modal');
const addMemberModal = document.getElementById('add-member-modal');

// Current Group Tracking
let currentGroupId = null;

// Initialize the App
function init() {
    // Set up event listeners
    setupEventListeners();
    
    // Hide app screens by default
    appScreens.style.display = 'none';
    
    // Check if user is already logged in (for development)
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
    showSignup.addEventListener('click', () => toggleAuthScreens());
    showLogin.addEventListener('click', () => toggleAuthScreens());
    
    // Auth actions
    loginBtn.addEventListener('click', handleLogin);
    signupBtn.addEventListener('click', handleSignup);
    logoutBtn.addEventListener('click', handleLogout);
    
    // Group actions
    createGroupBtn.addEventListener('click', handleCreateGroup);
    backToGroups.addEventListener('click', () => showScreen('groups'));
    editGroupBtn.addEventListener('click', () => editGroupModal.classList.add('active'));
    addMemberBtn.addEventListener('click', () => addMemberModal.classList.add('active'));
    removeMembersBtn.addEventListener('click', handleRemoveMembers);
    buzzSelectedBtn.addEventListener('click', handleBuzzSelected);
    buzzAllBtn.addEventListener('click', handleBuzzAll);
    deleteGroupBtn.addEventListener('click', handleDeleteGroup);
    
    // Modal actions
    document.getElementById('cancel-edit-group').addEventListener('click', () => editGroupModal.classList.remove('active'));
    document.getElementById('save-group-name').addEventListener('click', handleSaveGroupName);
    document.getElementById('cancel-add-member').addEventListener('click', () => addMemberModal.classList.remove('active'));
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
    appScreens.style.display = 'block';
    showScreen('groups');
    loadGroups();
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
        <div class="card" data-group-id="${group.id}">
            <h3>${group.name}</h3>
            <p>${group.members.length} members</p>
            <button class="btn secondary view-group-btn">View</button>
        </div>
    `).join('');
    
    // Add event listeners to view buttons
    document.querySelectorAll('.view-group-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            currentGroupId = this.closest('.card').dataset.groupId;
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
        <div class="card member-item">
            <input type="checkbox" class="member-checkbox" data-phone="${member.phone}">
            <div>
                <h3>${member.name}</h3>
                <p>${member.phone}</p>
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
        editGroupModal.classList.remove('active');
        document.getElementById('edit-group-name').value = '';
        loadGroups(); // Update name in groups list
    }
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
        // Check if member already exists
        if (group.members.some(m => m.phone === phone)) {
            showNotification('Member already exists in this group', 'error');
            return;
        }
        
        group.members.push({ name, phone });
        showNotification('Member added successfully', 'success');
        addMemberModal.classList.remove('active');
        document.getElementById('new-member-name').value = '';
        document.getElementById('new-member-phone').value = '';
        loadGroupDetail();
    }
}

// Handle remove selected members
function handleRemoveMembers() {
    const checkboxes = document.querySelectorAll('.member-checkbox:checked');
    if (checkboxes.length === 0) {
        showNotification('Please select members to remove', 'error');
        return;
    }
    
    const group = groups.find(g => g.id === currentGroupId);
    if (group) {
        const phonesToRemove = Array.from(checkboxes).map(cb => cb.dataset.phone);
        group.members = group.members.filter(m => !phonesToRemove.includes(m.phone));
        showNotification(`${phonesToRemove.length} members removed`, 'success');
        loadGroupDetail();
    }
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

// Handle delete group
function handleDeleteGroup() {
    if (!confirm('Are you sure you want to delete this group?')) return;
    
    groups = groups.filter(g => g.id !== currentGroupId);
    showNotification('Group deleted', 'success');
    showScreen('groups');
}

// Clear signup form
function clearSignupForm() {
    document.getElementById('signup-name').value = '';
    document.getElementById('signup-phone').value = '';
    document.getElementById('signup-password').value = '';
    document.getElementById('signup-confirm').value = '';
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Initialize the app
document.addEventListener('DOMContentLoaded', init);
