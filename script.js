// App State
let currentUser = null;
let groups = [];

// DOM Elements
const app = document.getElementById('app');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    initializeEventListeners();
    switchScreen('login-screen');
});

// Load data from localStorage
function loadFromLocalStorage() {
    const savedUser = localStorage.getItem('currentUser');
    const savedGroups = localStorage.getItem('groups');
    
    if (savedUser) currentUser = JSON.parse(savedUser);
    if (savedGroups) groups = JSON.parse(savedGroups);
}

// Save data to localStorage
function saveToLocalStorage() {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('groups', JSON.stringify(groups));
}

// Screen Management
function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.style.display = 'none';
    });
    document.getElementById(screenId).style.display = 'block';
}

// Password Visibility Toggle
document.getElementById('toggle-password').addEventListener('click', function() {
    const passwordInput = document.getElementById('login-password');
    const icon = this.querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
});

// User Authentication
function loginUser() {
    const phone = document.getElementById('login-phone').value.trim();
    const password = document.getElementById('login-password').value.trim();
    
    if (!phone || !password) {
        alert('Please enter both phone number and password');
        return;
    }
    
    // In a real app, you would verify credentials with server
    currentUser = { phone, password };
    saveToLocalStorage();
    switchScreen('my-groups-screen');
    renderGroups();
}

function signUpUser() {
    const name = document.getElementById('signup-name').value.trim();
    const phone = document.getElementById('signup-phone').value.trim();
    const password = document.getElementById('signup-password').value.trim();
    const confirmPassword = document.getElementById('signup-confirm-password').value.trim();
    
    if (!name || !phone || !password || !confirmPassword) {
        alert('Please fill all fields');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    currentUser = { name, phone, password };
    saveToLocalStorage();
    alert('Sign up successful! Please login.');
    switchScreen('login-screen');
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    switchScreen('login-screen');
}

// Group Management
function createGroup() {
    const groupName = document.getElementById('create-group-name').value.trim();
    
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
    saveToLocalStorage();
    switchScreen('my-groups-screen');
    renderGroups();
}

function renderGroups() {
    const groupList = document.getElementById('group-list');
    groupList.innerHTML = '';
    
    if (groups.length === 0) {
        groupList.innerHTML = '<p>No groups yet. Create your first group!</p>';
        return;
    }
    
    groups.forEach(group => {
        const groupElement = document.createElement('div');
        groupElement.className = 'list-item';
        groupElement.innerHTML = `
            <h3>${group.name}</h3>
            <p>${group.members.length} members</p>
            <div class="actions">
                <button onclick="editGroup('${group.id}')">Edit</button>
                <button onclick="deleteGroup('${group.id}')">Delete</button>
                <button onclick="selectGroup('${group.id}')">Buzz</button>
            </div>
        `;
        groupList.appendChild(groupElement);
    });
}

function editGroup(groupId) {
    const group = groups.find(g => g.id === groupId);
    if (group) {
        document.getElementById('edit-group-name').value = group.name;
        document.getElementById('edit-group-id').value = group.id;
        switchScreen('edit-group-screen');
    }
}

function saveGroupEdits() {
    const groupId = document.getElementById('edit-group-id').value;
    const newName = document.getElementById('edit-group-name').value.trim();
    
    if (!newName) {
        alert('Please enter a group name');
        return;
    }
    
    const group = groups.find(g => g.id === groupId);
    if (group) {
        group.name = newName;
        saveToLocalStorage();
        switchScreen('my-groups-screen');
        renderGroups();
    }
}

function deleteGroup(groupId) {
    if (confirm('Are you sure you want to delete this group?')) {
        groups = groups.filter(g => g.id !== groupId);
        saveToLocalStorage();
        renderGroups();
    }
}

function selectGroup(groupId) {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;
    
    document.getElementById('buzz-group-id').value = groupId;
    const memberList = document.getElementById('member-list');
    memberList.innerHTML = '';
    
    if (group.members.length === 0) {
        memberList.innerHTML = '<p>No members in this group yet.</p>';
    } else {
        group.members.forEach(member => {
            const memberElement = document.createElement('div');
            memberElement.className = 'list-item';
            memberElement.innerHTML = `
                <label>
                    <input type="checkbox" value="${member.phone}">
                    ${member.name} (${member.phone})
                </label>
            `;
            memberList.appendChild(memberElement);
        });
    }
    
    switchScreen('buzz-screen');
}

function sendBuzz() {
    const groupId = document.getElementById('buzz-group-id').value;
    const group = groups.find(g => g.id === groupId);
    
    if (!group || group.members.length === 0) {
        alert('No members to buzz in this group');
        return;
    }
    
    const selectedMembers = [];
    document.querySelectorAll('#member-list input[type="checkbox"]:checked').forEach(checkbox => {
        selectedMembers.push(checkbox.value);
    });
    
    if (selectedMembers.length === 0) {
        alert('Please select at least one member');
        return;
    }
    
    // In a real app, you would send this to the server
    alert(`Buzz sent to ${selectedMembers.length} members!`);
    document.getElementById('buzz-audio').play();
}

// Event Listeners
function initializeEventListeners() {
    document.getElementById('login-btn').addEventListener('click', loginUser);
    document.getElementById('signup-btn').addEventListener('click', signUpUser);
    document.getElementById('create-group-btn').addEventListener('click', createGroup);
    document.getElementById('save-group-btn').addEventListener('click', saveGroupEdits);
    document.getElementById('send-buzz-btn').addEventListener('click', sendBuzz);
}
