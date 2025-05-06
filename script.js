// ======================
// BUZZALL - Complete Working Version
// ======================

// App State
const appState = {
  currentUser: null,
  currentGroup: null,
  groups: [],
  tempData: {}
};

// DOM Elements
const elements = {
  app: document.getElementById('app'),
  buzzSound: document.getElementById('buzzSound')
};

// Mock Database
const mockUsers = [
  {
    phone: "+1234567890",
    password: "password123",
    fullName: "Demo User",
    groups: [
      {
        id: 'group1',
        name: 'Family',
        members: [
          { id: 'm1', name: 'Mom', phone: '+1234567891' },
          { id: 'm2', name: 'Dad', phone: '+1234567892' }
        ]
      }
    ]
  }
];

// ======================
// CORE FUNCTIONALITY
// ======================

function createGroup(groupName) {
  const newGroup = {
    id: 'group' + Date.now(),
    name: groupName,
    members: []
  };
  
  appState.groups.push(newGroup);
  saveToLocalStorage();
  renderGroupsScreen();
}

function addMemberToGroup(groupId, memberName, memberPhone) {
  const group = appState.groups.find(g => g.id === groupId);
  if (!group) return;
  
  group.members.push({
    id: 'member' + Date.now(),
    name: memberName,
    phone: memberPhone
  });
  
  saveToLocalStorage();
  renderGroupDetailScreen(groupId);
}

function buzzMembers(memberIds) {
  elements.buzzSound.play();
  
  // In a real app, this would send via Socket.IO/Twilio
  console.log("BUZZING MEMBERS:", memberIds);
  showAlert(`Buzz sent to ${memberIds.length} members!`, true);
}

function buzzAllMembers(groupId) {
  const group = appState.groups.find(g => g.id === groupId);
  if (!group) return;
  
  elements.buzzSound.play();
  
  // In a real app, this would send to all group members
  console.log("BUZZING ENTIRE GROUP:", group.name);
  showAlert(`Buzz sent to all ${group.members.length} members!`, true);
}

// ======================
// UI RENDERING
// ======================

function renderCreateGroupModal() {
  const modalHTML = `
    <div class="modal active">
      <div class="modal-content">
        <h3>Create New Group</h3>
        <div class="input-group">
          <input type="text" id="newGroupName" placeholder="Group Name" required>
        </div>
        <div class="modal-actions">
          <button id="cancelCreateGroup" class="btn secondary">Cancel</button>
          <button id="confirmCreateGroup" class="btn primary">Create</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  document.getElementById('confirmCreateGroup').addEventListener('click', () => {
    const groupName = document.getElementById('newGroupName').value.trim();
    if (groupName) {
      createGroup(groupName);
      closeModal();
    }
  });
  
  document.getElementById('cancelCreateGroup').addEventListener('click', closeModal);
}

function renderAddMemberModal() {
  const modalHTML = `
    <div class="modal active">
      <div class="modal-content">
        <h3>Add New Member</h3>
        <div class="input-group">
          <input type="text" id="newMemberName" placeholder="Member Name" required>
        </div>
        <div class="input-group">
          <input type="tel" id="newMemberPhone" placeholder="Phone Number" required>
        </div>
        <div class="modal-actions">
          <button id="cancelAddMember" class="btn secondary">Cancel</button>
          <button id="confirmAddMember" class="btn primary">Add Member</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  document.getElementById('confirmAddMember').addEventListener('click', () => {
    const name = document.getElementById('newMemberName').value.trim();
    const phone = document.getElementById('newMemberPhone').value.trim();
    
    if (name && phone) {
      addMemberToGroup(appState.currentGroup.id, name, phone);
      closeModal();
    }
  });
  
  document.getElementById('cancelAddMember').addEventListener('click', closeModal);
}

function closeModal() {
  const modal = document.querySelector('.modal');
  if (modal) modal.remove();
}

// ======================
// EVENT HANDLERS
// ======================

function handleCreateGroup() {
  renderCreateGroupModal();
}

function handleAddMember() {
  renderAddMemberModal();
}

function handleBuzzSelected() {
  const checkboxes = document.querySelectorAll('.member-checkbox:checked');
  if (checkboxes.length === 0) {
    showAlert("Please select at least one member");
    return;
  }
  
  const memberIds = Array.from(checkboxes).map(cb => cb.id.replace('member-', ''));
  buzzMembers(memberIds);
}

function handleBuzzAll() {
  buzzAllMembers(appState.currentGroup.id);
}

function handleRemoveMembers() {
  const checkboxes = document.querySelectorAll('.member-checkbox:checked');
  if (checkboxes.length === 0) {
    showAlert("Please select members to remove");
    return;
  }
  
  const memberIds = Array.from(checkboxes).map(cb => cb.id.replace('member-', ''));
  appState.currentGroup.members = appState.currentGroup.members.filter(
    m => !memberIds.includes(m.id)
  );
  
  saveToLocalStorage();
  renderGroupDetailScreen(appState.currentGroup.id);
  showAlert(`${memberIds.length} members removed`, true);
}

// ======================
// UTILITY FUNCTIONS
// ======================

function saveToLocalStorage() {
  if (appState.currentUser) {
    localStorage.setItem('buzzall_groups', JSON.stringify(appState.groups));
  }
}

function showAlert(message, isSuccess = false) {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert ${isSuccess ? 'success' : 'error'}`;
  alertDiv.textContent = message;
  document.body.appendChild(alertDiv);

  setTimeout(() => {
    alertDiv.remove();
  }, 3000);
}

// ======================
// INITIALIZATION
// ======================

document.addEventListener('DOMContentLoaded', () => {
  // Load saved state
  const savedUser = localStorage.getItem('buzzall_user');
  const savedGroups = localStorage.getItem('buzzall_groups');
  
  if (savedUser) {
    appState.currentUser = JSON.parse(savedUser);
    appState.groups = savedGroups ? JSON.parse(savedGroups) : [];
    renderGroupsScreen();
  } else {
    renderLoginScreen();
  }
  
  // Setup global event listeners
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      closeModal();
    }
    
    if (e.target.id === 'addMemberBtn') {
      e.preventDefault();
      handleAddMember();
    }
    
    if (e.target.id === 'buzzSelectedBtn') {
      e.preventDefault();
      handleBuzzSelected();
    }
    
    if (e.target.id === 'buzzAllBtn') {
      e.preventDefault();
      handleBuzzAll();
    }
    
    if (e.target.id === 'removeMemberBtn') {
      e.preventDefault();
      handleRemoveMembers();
    }
    
    if (e.target.id === 'createGroupBtn') {
      e.preventDefault();
      handleCreateGroup();
    }
  });
});
