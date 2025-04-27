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

function editGroup(groupId) {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;
    
    getElement('edit-group-name').value = group.name;
    getElement('edit-group-id').value = group.id;
    renderMembers(group.members);
    switchScreen('edit-group-screen');
}

function renderMembers(members) {
    const container = getElement('current-members');
    if (!container) return;
    
    container.innerHTML = members.map(member => `
        <div class="member-item">
            <span>${member.name} (${member.phone})</span>
            <button class="btn small" onclick="removeMember('${member.phone}')">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

function addMember() {
    const groupId = getElement('edit-group-id').value;
    const name = getElement('new-member-name').value.trim();
    const phone = getElement('new-member-phone').value.trim();
    
    if (!name || !phone) {
        alert('Please enter both name and phone');
        return;
    }
    
    const group = groups.find(g => g.id === groupId);
    if (group) {
        // Check if member already exists
        if (group.members.some(m => m.phone === phone)) {
            alert('This member already exists in the group');
            return;
        }
        
        group.members.push({ name, phone });
        getElement('new-member-name').value = '';
        getElement('new-member-phone').value = '';
        renderMembers(group.members);
    }
}

function removeMember(phone) {
    const groupId = getElement('edit-group-id').value;
    const group = groups.find(g => g.id === groupId);
    if (group) {
        group.members = group.members.filter(m => m.phone !== phone);
        renderMembers(group.members);
    }
}

function saveGroupEdits() {
    const groupId = getElement('edit-group-id').value;
    const newName = getElement('edit-group-name').value.trim();
    
    const group = groups.find(g => g.id === groupId);
    if (group) {
        group.name = newName;
        alert('Group updated successfully!');
        switchScreen('my-groups-screen');
        renderGroups();
    }
}

function renderGroups() {
    const container = getElement('group-list');
    if (!container) return;
    
    container.innerHTML = groups.map(group => `
        <div class="group-card" data-group-id="${group.id}">
            <h3>${group.name}</h3>
            <div class="group-actions">
                <button class="btn" onclick="editGroup('${group.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
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
    renderBuzzMembers(group.members);
    switchScreen('buzz-screen');
}

function renderBuzzMembers(members) {
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
 * PASSWORD TOGGLE
 *********************/
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
 * EVENT LISTENERS
 *********************/
function initializeEventListeners() {
  // Safe event listener attachment
  function safeAddListener(id, event, handler) {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener(event, handler);
      console.log(`Added ${event} listener to #${id}`);
    } else {
      console.warn(`Element #${id} not found for event listener`);
    }
  }

  // Authentication
  safeAddListener('login-btn', 'click', loginUser);
  safeAddListener('signup-btn', 'click', signUpUser);
  safeAddListener('logout-btn', 'click', logout);
  
  // Group Management
  safeAddListener('create-group-btn', 'click', createGroup);
  safeAddListener('save-group-btn', 'click', saveGroupEdits);
  safeAddListener('send-buzz-btn', 'click', sendBuzz);
  
  // Navigation
  safeAddListener('to-signup', 'click', () => switchScreen('signup-screen'));
  safeAddListener('to-login', 'click', () => switchScreen('login-screen'));
  safeAddListener('refresh-groups', 'click', renderGroups);
  
  // Password toggle
  safeAddListener('toggle-password', 'click', togglePasswordVisibility);
}

/*********************
 * INITIALIZATION
 *********************/
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    switchScreen('login-screen');
    debugLog('App initialized');
});
