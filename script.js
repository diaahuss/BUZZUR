/*********************
 * APP STATE & CONFIG
 *********************/
let currentUser = null;
let groups = [];
const DEBUG_MODE = true;

/*********************
 * CORE UTILITIES
 *********************/
function logDebug(...messages) {
    if (DEBUG_MODE) console.log('[DEBUG]', ...messages);
}

function safeQuerySelector(selector) {
    const element = document.querySelector(selector);
    if (!element) console.warn(`Element not found: ${selector}`);
    return element;
}

function addSafeListener(elementId, eventType, handler) {
    const element = document.getElementById(elementId);
    if (element) {
        element.addEventListener(eventType, handler);
        logDebug(`Added ${eventType} listener to #${elementId}`);
    } else {
        console.warn(`Cannot add listener - element #${elementId} not found`);
    }
}

/*********************
 * SCREEN MANAGEMENT
 *********************/
function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.style.display = 'none';
    });
    
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.style.display = 'block';
        logDebug(`Switched to screen: ${screenId}`);
    } else {
        console.error(`Screen not found: ${screenId}`);
    }
}

/*********************
 * EVENT MANAGEMENT
 *********************/
function initializeEventListeners() {
    // Authentication
    addSafeListener('login-btn', 'click', loginUser);
    addSafeListener('signup-btn', 'click', signUpUser);
    addSafeListener('logout-btn', 'click', logout);
    
    // Group Management
    addSafeListener('create-group-btn', 'click', createGroup);
    addSafeListener('save-group-btn', 'click', saveGroupEdits);
    addSafeListener('send-buzz-btn', 'click', sendBuzz);
    
    // Navigation
    addSafeListener('to-signup', 'click', () => switchScreen('signup-screen'));
    addSafeListener('to-login', 'click', () => switchScreen('login-screen'));
    addSafeListener('to-groups', 'click', () => {
        switchScreen('my-groups-screen');
        renderGroups();
    });
    
    // Password Toggle
    addSafeListener('toggle-password', 'click', togglePasswordVisibility);
}

/*********************
 * AUTH FUNCTIONS
 *********************/
function loginUser() {
    try {
        const phone = safeQuerySelector('#login-phone')?.value;
        const password = safeQuerySelector('#login-password')?.value;
        
        if (!phone || !password) {
            alert('Please enter both phone and password');
            return;
        }
        
        currentUser = { phone, password };
        logDebug('User logged in:', phone);
        switchScreen('my-groups-screen');
        renderGroups();
    } catch (error) {
        console.error('Login failed:', error);
        alert('Login error - please try again');
    }
}

function signUpUser() {
    try {
        const name = safeQuerySelector('#signup-name')?.value.trim();
        const phone = safeQuerySelector('#signup-phone')?.value.trim();
        const password = safeQuerySelector('#signup-password')?.value;
        const confirmPassword = safeQuerySelector('#signup-confirm-password')?.value;
        
        if (!name || !phone || !password || !confirmPassword) {
            alert('Please fill all fields');
            return;
        }
        
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        currentUser = { name, phone, password };
        logDebug('New user signed up:', phone);
        alert('Registration successful!');
        switchScreen('login-screen');
    } catch (error) {
        console.error('Signup failed:', error);
        alert('Registration error - please try again');
    }
}

function logout() {
    currentUser = null;
    switchScreen('login-screen');
    logDebug('User logged out');
}

/*********************
 * GROUP FUNCTIONS
 *********************/
function createGroup() {
    try {
        const groupName = safeQuerySelector('#create-group-name')?.value.trim();
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
        logDebug('Group created:', groupName);
        switchScreen('my-groups-screen');
        renderGroups();
    } catch (error) {
        console.error('Group creation failed:', error);
        alert('Error creating group');
    }
}

function saveGroupEdits() {
    try {
        const groupId = safeQuerySelector('#edit-group-id')?.value;
        const newName = safeQuerySelector('#edit-group-name')?.value.trim();
        
        if (!groupId || !newName) {
            alert('Please provide valid group information');
            return;
        }
        
        const group = groups.find(g => g.id === groupId);
        if (group) {
            group.name = newName;
            logDebug('Group updated:', newName);
            switchScreen('my-groups-screen');
            renderGroups();
        } else {
            alert('Group not found');
        }
    } catch (error) {
        console.error('Failed to save group edits:', error);
        alert('Error saving group changes');
    }
}

function editGroup(groupId) {
    const group = groups.find(g => g.id === groupId);
    if (group) {
        document.getElementById('edit-group-name').value = group.name;
        document.getElementById('edit-group-id').value = group.id;
        switchScreen('edit-group-screen');
        logDebug('Editing group:', group.name);
    }
}

function deleteGroup(groupId) {
    if (confirm('Are you sure you want to delete this group?')) {
        groups = groups.filter(g => g.id !== groupId);
        renderGroups();
        logDebug('Group deleted:', groupId);
    }
}

function selectGroup(groupId) {
    const group = groups.find(g => g.id === groupId);
    if (group) {
        document.getElementById('buzz-group-id').value = groupId;
        renderMemberList(group.members);
        switchScreen('buzz-screen');
        logDebug('Selected group:', group.name);
    }
}

function renderGroups() {
    const groupList = safeQuerySelector('#group-list');
    if (!groupList) return;
    
    groupList.innerHTML = groups.map(group => `
        <div class="group-card">
            <h3>${group.name}</h3>
            <button onclick="editGroup('${group.id}')">Edit</button>
            <button onclick="deleteGroup('${group.id}')">Delete</button>
            <button onclick="selectGroup('${group.id}')">Buzz</button>
        </div>
    `).join('');
}

function renderMemberList(members) {
    const memberList = safeQuerySelector('#member-list');
    if (memberList) {
        memberList.innerHTML = members.map(member => `
            <div class="member">
                <label>
                    <input type="checkbox" value="${member.phone}">
                    ${member.name} (${member.phone})
                </label>
            </div>
        `).join('');
    }
}

/*********************
 * BUZZ FUNCTIONALITY
 *********************/
function sendBuzz() {
    try {
        const groupId = safeQuerySelector('#buzz-group-id')?.value;
        const group = groups.find(g => g.id === groupId);
        
        if (!group || group.members.length === 0) {
            alert('No members in this group');
            return;
        }
        
        const selectedMembers = Array.from(
            document.querySelectorAll('#member-list input[type="checkbox"]:checked')
        ).map(checkbox => checkbox.value);
        
        if (selectedMembers.length === 0) {
            alert('Please select at least one member');
            return;
        }
        
        const buzzAudio = safeQuerySelector('#buzz-audio');
        if (buzzAudio) {
            buzzAudio.play();
            logDebug('Buzz sound played');
        }
        
        alert(`Buzz sent to ${selectedMembers.length} members!`);
        logDebug('Buzz recipients:', selectedMembers);
    } catch (error) {
        console.error('Buzz failed:', error);
        alert('Error sending buzz');
    }
}

/*********************
 * UI HELPERS
 *********************/
function togglePasswordVisibility() {
    const passwordInput = safeQuerySelector('#login-password');
    const toggleButton = safeQuerySelector('#toggle-password');
    
    if (passwordInput && toggleButton) {
        passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
        toggleButton.innerHTML = passwordInput.type === 'password' 
            ? '<i class="fas fa-eye"></i>' 
            : '<i class="fas fa-eye-slash"></i>';
    }
}

/*********************
 * INITIALIZATION
 *********************/
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    switchScreen('login-screen');
    logDebug('App initialized');
});
