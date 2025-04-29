// DOM Elements
const screens = {
    login: document.getElementById('login-screen'),
    signup: document.getElementById('signup-screen'),
    myGroups: document.getElementById('my-groups-screen'),
    createGroup: document.getElementById('create-group-screen'),
    editGroup: document.getElementById('edit-group-screen'),
    buzz: document.getElementById('buzz-screen')
};

// Sample data storage
let users = [
    { phone: '1234567890', password: 'password123', name: 'John Doe', groups: [] }
];
let groups = [];
let currentUser = null;

// Initialize the app
function init() {
    // Show login screen by default
    showScreen('login');
    
    // Setup event listeners
    setupEventListeners();
}

// Show specific screen
function showScreen(screenName) {
    // Hide all screens first
    Object.values(screens).forEach(screen => {
        screen.style.display = 'none';
    });
    
    // Show the requested screen
    if (screens[screenName]) {
        screens[screenName].style.display = 'flex';
    }
    
    // Load data if needed
    if (screenName === 'myGroups') {
        loadGroups();
    }
}

// Setup all event listeners
function setupEventListeners() {
    // Login/Signup navigation
    document.getElementById('to-signup').addEventListener('click', () => showScreen('signup'));
    document.getElementById('to-login').addEventListener('click', () => showScreen('login'));
    
    // Login button
    document.getElementById('login-btn').addEventListener('click', handleLogin);
    
    // Signup button
    document.getElementById('signup-btn').addEventListener('click', handleSignup);
    
    // Password toggle
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
    });
    
    // Groups screen buttons
    document.getElementById('create-group-btn').addEventListener('click', () => showScreen('createGroup'));
    document.getElementById('refresh-groups').addEventListener('click', loadGroups);
    document.getElementById('logout-btn').addEventListener('click', () => {
        currentUser = null;
        showScreen('login');
    });
    
    // Create group buttons
    document.getElementById('confirm-create-group').addEventListener('click', createGroup);
    document.getElementById('cancel-create-group').addEventListener('click', () => showScreen('myGroups'));
    
    // Edit group buttons
    document.getElementById('add-member-btn').addEventListener('click', addMemberToGroup);
    document.getElementById('save-group-btn').addEventListener('click', saveGroupChanges);
    document.getElementById('cancel-edit-group').addEventListener('click', () => showScreen('myGroups'));
    
    // Buzz screen buttons
    document.getElementById('send-buzz-btn').addEventListener('click', sendBuzz);
    document.getElementById('cancel-buzz').addEventListener('click', () => showScreen('myGroups'));
}

// Handle login
function handleLogin() {
    const phone = document.getElementById('login-phone').value;
    const password = document.getElementById('login-password').value;
    
    const user = users.find(u => u.phone === phone && u.password === password);
    
    if (user) {
        currentUser = user;
        showScreen('myGroups');
    } else {
        alert('Invalid phone number or password');
    }
}

// Handle signup
function handleSignup() {
    const name = document.getElementById('signup-name').value;
    const phone = document.getElementById('signup-phone').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    if (users.some(u => u.phone === phone)) {
        alert('Phone number already registered');
        return;
    }
    
    const newUser = {
        phone,
        password,
        name,
        groups: []
    };
    
    users.push(newUser);
    currentUser = newUser;
    showScreen('myGroups');
}

// Load groups for current user
function loadGroups() {
    const groupList = document.getElementById('group-list');
    groupList.innerHTML = '';
    
    const userGroups = groups.filter(g => g.members.some(m => m.phone === currentUser.phone));
    
    if (userGroups.length === 0) {
        groupList.innerHTML = '<p>No groups found. Create your first group!</p>';
        return;
    }
    
    userGroups.forEach(group => {
        const groupCard = document.createElement('div');
        groupCard.className = 'card';
        groupCard.innerHTML = `
            <h3>${group.name}</h3>
            <p>${group.members.length} members</p>
            <div class="card-actions">
                <button class="btn primary edit-group" data-id="${group.id}">Edit</button>
                <button class="btn primary buzz-group" data-id="${group.id}">Buzz</button>
            </div>
        `;
        groupList.appendChild(groupCard);
    });
    
    // Add event listeners to the new buttons
    document.querySelectorAll('.edit-group').forEach(btn => {
        btn.addEventListener('click', function() {
            const groupId = this.getAttribute('data-id');
            editGroup(groupId);
        });
    });
    
    document.querySelectorAll('.buzz-group').forEach(btn => {
        btn.addEventListener('click', function() {
            const groupId = this.getAttribute('data-id');
            prepareBuzz(groupId);
        });
    });
}

// Create a new group
function createGroup() {
    const groupName = document.getElementById('new-group-name').value;
    
    if (!groupName) {
        alert('Please enter a group name');
        return;
    }
    
    const newGroup = {
        id: Date.now().toString(),
        name: groupName,
        members: [
            { name: currentUser.name, phone: currentUser.phone }
        ]
    };
    
    groups.push(newGroup);
    showScreen('myGroups');
}

// Edit an existing group
function editGroup(groupId) {
    const group = groups.find(g => g.id === groupId);
    
    if (!group) {
        alert('Group not found');
        return;
    }
    
    document.getElementById('edit-group-name').value = group.name;
    document.getElementById('edit-group-id').value = group.id;
    
    const memberList = document.getElementById('current-members');
    memberList.innerHTML = '';
    
    group.members.forEach(member => {
        const memberItem = document.createElement('div');
        memberItem.className = 'member-item';
        memberItem.innerHTML = `
            <span>${member.name} (${member.phone})</span>
            <button class="btn icon remove-member" data-phone="${member.phone}">
                <i class="fas fa-times"></i>
            </button>
        `;
        memberList.appendChild(memberItem);
    });
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-member').forEach(btn => {
        btn.addEventListener('click', function() {
            const phone = this.getAttribute('data-phone');
            if (phone === currentUser.phone) {
                alert('You cannot remove yourself from the group');
                return;
            }
            removeMember(groupId, phone);
        });
    });
    
    showScreen('editGroup');
}

// Add member to group
function addMemberToGroup() {
    const groupId = document.getElementById('edit-group-id').value;
    const name = document.getElementById('new-member-name').value;
    const phone = document.getElementById('new-member-phone').value;
    
    if (!name || !phone) {
        alert('Please enter both name and phone number');
        return;
    }
    
    const group = groups.find(g => g.id === groupId);
    
    if (group.members.some(m => m.phone === phone)) {
        alert('This member is already in the group');
        return;
    }
    
    group.members.push({ name, phone });
    editGroup(groupId);
}

// Remove member from group
function removeMember(groupId, phone) {
    const group = groups.find(g => g.id === groupId);
    group.members = group.members.filter(m => m.phone !== phone);
    editGroup(groupId);
}

// Save group changes
function saveGroupChanges() {
    const groupId = document.getElementById('edit-group-id').value;
    const newName = document.getElementById('edit-group-name').value;
    
    const group = groups.find(g => g.id === groupId);
    group.name = newName;
    
    showScreen('myGroups');
}

// Prepare buzz screen
function prepareBuzz(groupId) {
    const group = groups.find(g => g.id === groupId);
    
    if (!group) {
        alert('Group not found');
        return;
    }
    
    document.getElementById('current-buzz-group').value = groupId;
    
    const memberList = document.getElementById('member-list');
    memberList.innerHTML = '';
    
    group.members.forEach(member => {
        if (member.phone === currentUser.phone) return; // Skip self
        
        const memberCard = document.createElement('div');
        memberCard.className = 'card';
        memberCard.innerHTML = `
            <label>
                <input type="checkbox" class="member-checkbox" data-phone="${member.phone}">
                ${member.name} (${member.phone})
            </label>
        `;
        memberList.appendChild(memberCard);
    });
    
    showScreen('buzz');
}

// Send buzz to selected members
function sendBuzz() {
    const groupId = document.getElementById('current-buzz-group').value;
    const checkboxes = document.querySelectorAll('.member-checkbox:checked');
    
    if (checkboxes.length === 0) {
        alert('Please select at least one member to buzz');
        return;
    }
    
    const membersToBuzz = Array.from(checkboxes).map(cb => cb.getAttribute('data-phone'));
    
    // Play buzz sound
    const buzzSound = document.getElementById('buzz-sound');
    buzzSound.play().catch(e => console.log('Audio play failed:', e));
    
    alert(`Buzz sent to ${membersToBuzz.length} members!`);
    showScreen('myGroups');
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
