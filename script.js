document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const screens = {
    login: document.getElementById('login-screen'),
    signup: document.getElementById('signup-screen'),
    app: document.getElementById('app-screen'),
    group: document.getElementById('group-screen')
  };
  
  const modalElements = {
    createGroup: document.getElementById('create-group-modal'),
    addMember: document.getElementById('add-member-modal')
  };
  
  const buttons = {
    showSignup: document.getElementById('show-signup'),
    showLogin: document.getElementById('show-login'),
    logout: document.getElementById('logout-btn'),
    createGroup: document.getElementById('create-group-btn'),
    back: document.getElementById('back-btn'),
    deleteGroup: document.getElementById('delete-group-btn'),
    addMember: document.getElementById('add-member-btn'),
    removeMembers: document.getElementById('remove-members-btn'),
    buzzSelected: document.getElementById('buzz-selected-btn'),
    buzzAll: document.getElementById('buzz-all-btn'),
    cancelCreate: document.getElementById('cancel-create'),
    confirmCreate: document.getElementById('confirm-create'),
    cancelAdd: document.getElementById('cancel-add'),
    confirmAdd: document.getElementById('confirm-add')
  };
  
  const forms = {
    login: document.getElementById('login-form'),
    signup: document.getElementById('signup-form')
  };
  
  const inputs = {
    loginPhone: document.getElementById('login-phone'),
    loginPassword: document.getElementById('login-password'),
    signupName: document.getElementById('signup-name'),
    signupPhone: document.getElementById('signup-phone'),
    signupPassword: document.getElementById('signup-password'),
    signupConfirm: document.getElementById('signup-confirm'),
    newGroupName: document.getElementById('new-group-name'),
    memberName: document.getElementById('member-name'),
    memberPhone: document.getElementById('member-phone')
  };
  
  const containers = {
    groupsList: document.getElementById('groups-list'),
    membersList: document.getElementById('members-list')
  };
  
  const groupTitle = document.getElementById('group-title');
  const buzzSound = document.getElementById('buzz-sound');
  
  // App State
  const state = {
    currentUser: null,
    groups: [],
    currentGroupId: null,
    members: []
  };
  
  // Initialize the app
  init();
  
  function init() {
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem('buzzManagerUser');
    if (savedUser) {
      state.currentUser = JSON.parse(savedUser);
      showScreen('app');
      loadGroups();
    } else {
      showScreen('login');
    }
    
    setupEventListeners();
    setupPasswordToggles();
  }
  
  function setupEventListeners() {
    // Navigation buttons
    buttons.showSignup.addEventListener('click', (e) => {
      e.preventDefault();
      showScreen('signup');
    });
    
    buttons.showLogin.addEventListener('click', (e) => {
      e.preventDefault();
      showScreen('login');
    });
    
    buttons.logout.addEventListener('click', logout);
    buttons.back.addEventListener('click', () => showScreen('app'));
    
    // Group actions
    buttons.createGroup.addEventListener('click', () => {
      inputs.newGroupName.value = '';
      showModal('createGroup');
    });
    
    buttons.deleteGroup.addEventListener('click', deleteCurrentGroup);
    
    // Member actions
    buttons.addMember.addEventListener('click', () => {
      inputs.memberName.value = '';
      inputs.memberPhone.value = '';
      showModal('addMember');
    });
    
    buttons.removeMembers.addEventListener('click', removeSelectedMembers);
    buttons.buzzSelected.addEventListener('click', buzzSelectedMembers);
    buttons.buzzAll.addEventListener('click', buzzAllMembers);
    
    // Modal actions
    buttons.cancelCreate.addEventListener('click', () => hideModal('createGroup'));
    buttons.confirmCreate.addEventListener('click', createGroup);
    buttons.cancelAdd.addEventListener('click', () => hideModal('addMember'));
    buttons.confirmAdd.addEventListener('click', addMember);
    
    // Form submissions
    forms.login.addEventListener('submit', handleLogin);
    forms.signup.addEventListener('submit', handleSignup);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (modalElements.createGroup.classList.contains('active')) {
          hideModal('createGroup');
        } else if (modalElements.addMember.classList.contains('active')) {
          hideModal('addMember');
        }
      }
    });
  }
  
  function setupPasswordToggles() {
    document.querySelectorAll('.toggle-password').forEach(icon => {
      icon.addEventListener('click', function() {
        const input = this.previousElementSibling;
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        this.classList.toggle('fa-eye-slash');
      });
    });
  }
  
  // Screen Management
  function showScreen(screenName) {
    // Hide all screens
    Object.values(screens).forEach(screen => {
      screen.classList.remove('active');
    });
    
    // Show the requested screen
    screens[screenName].classList.add('active');
    
    // Load data if needed
    if (screenName === 'app') {
      loadGroups();
    } else if (screenName === 'group' && state.currentGroupId) {
      loadMembers();
    }
  }
  
  // Modal Management
  function showModal(modalName) {
    modalElements[modalName].classList.add('active');
  }
  
  function hideModal(modalName) {
    modalElements[modalName].classList.remove('active');
  }
  
  // Authentication Functions
  function handleLogin(e) {
    e.preventDefault();
    
    const phone = inputs.loginPhone.value.trim();
    const password = inputs.loginPassword.value.trim();
    
    if (!phone || !password) {
      alert('Please enter both phone number and password');
      return;
    }
    
    // Simulate API call
    simulateApiCall(() => {
      // In a real app, you would verify credentials with your backend
      const user = {
        id: 1,
        name: 'Demo User',
        phone: phone,
        token: 'fake-jwt-token'
      };
      
      state.currentUser = user;
      localStorage.setItem('buzzManagerUser', JSON.stringify(user));
      showScreen('app');
    });
  }
  
  function handleSignup(e) {
    e.preventDefault();
    
    const name = inputs.signupName.value.trim();
    const phone = inputs.signupPhone.value.trim();
    const password = inputs.signupPassword.value.trim();
    const confirm = inputs.signupConfirm.value.trim();
    
    if (!name || !phone || !password || !confirm) {
      alert('Please fill in all fields');
      return;
    }
    
    if (password !== confirm) {
      alert('Passwords do not match');
      return;
    }
    
    // Simulate API call
    simulateApiCall(() => {
      // In a real app, you would send this data to your backend
      const user = {
        id: 2,
        name: name,
        phone: phone,
        token: 'fake-jwt-token'
      };
      
      state.currentUser = user;
      localStorage.setItem('buzzManagerUser', JSON.stringify(user));
      showScreen('app');
    });
  }
  
  function logout() {
    state.currentUser = null;
    localStorage.removeItem('buzzManagerUser');
    showScreen('login');
  }
  
  // Group Management
  function loadGroups() {
    // Simulate API call to get groups
    simulateApiCall(() => {
      // Sample groups - in a real app, these would come from your backend
      state.groups = [
        { id: 1, name: 'Family Group', ownerId: 1 },
        { id: 2, name: 'Work Team', ownerId: 1 },
        { id: 3, name: 'Friends Circle', ownerId: 1 }
      ];
      
      renderGroups();
    });
  }
  
  function renderGroups() {
    containers.groupsList.innerHTML = '';
    
    if (state.groups.length === 0) {
      containers.groupsList.innerHTML = '<p class="text-center">No groups yet. Create your first group!</p>';
      return;
    }
    
    state.groups.forEach(group => {
      const groupElement = document.createElement('div');
      groupElement.className = 'group-item';
      groupElement.innerHTML = `
        <span>${group.name}</span>
        <button class="btn icon-btn" data-group-id="${group.id}">
          <i class="fas fa-chevron-right"></i>
        </button>
      `;
      
      groupElement.querySelector('button').addEventListener('click', () => {
        viewGroup(group.id);
      });
      
      containers.groupsList.appendChild(groupElement);
    });
  }
  
  function createGroup() {
    const name = inputs.newGroupName.value.trim();
    
    if (!name) {
      alert('Please enter a group name');
      return;
    }
    
    // Simulate API call
    simulateApiCall(() => {
      const newGroup = {
        id: Date.now(), // Temporary ID
        name: name,
        ownerId: state.currentUser.id
      };
      
      state.groups.push(newGroup);
      renderGroups();
      hideModal('createGroup');
    });
  }
  
  function viewGroup(groupId) {
    const group = state.groups.find(g => g.id === groupId);
    if (!group) return;
    
    state.currentGroupId = groupId;
    groupTitle.textContent = group.name;
    showScreen('group');
  }
  
  function deleteCurrentGroup() {
    if (!state.currentGroupId) return;
    
    if (!confirm('Are you sure you want to delete this group?')) {
      return;
    }
    
    // Simulate API call
    simulateApiCall(() => {
      state.groups = state.groups.filter(g => g.id !== state.currentGroupId);
      state.currentGroupId = null;
      showScreen('app');
    });
  }
  
  // Member Management
  function loadMembers() {
    if (!state.currentGroupId) return;
    
    // Simulate API call
    simulateApiCall(() => {
      // Sample members - in a real app, these would come from your backend
      state.members = [
        { id: 1, groupId: state.currentGroupId, name: 'John Doe', phone: '+1234567890' },
        { id: 2, groupId: state.currentGroupId, name: 'Jane Smith', phone: '+1987654321' },
        { id: 3, groupId: state.currentGroupId, name: 'Bob Johnson', phone: '+1555666777' }
      ];
      
      renderMembers();
    });
  }
  
  function renderMembers() {
    containers.membersList.innerHTML = '';
    
    if (state.members.length === 0) {
      containers.membersList.innerHTML = '<p class="text-center">No members in this group yet.</p>';
      return;
    }
    
    state.members.forEach(member => {
      const memberElement = document.createElement('div');
      memberElement.className = 'member-item';
      memberElement.innerHTML = `
        <input type="checkbox" id="member-${member.id}" data-member-id="${member.id}">
        <div class="member-details">
          <span class="member-name">${member.name}</span>
          <span class="member-phone">${member.phone}</span>
        </div>
      `;
      
      containers.membersList.appendChild(memberElement);
    });
  }
  
  function addMember() {
    const name = inputs.memberName.value.trim();
    const phone = inputs.memberPhone.value.trim();
    
    if (!name || !phone) {
      alert('Please enter both name and phone number');
      return;
    }
    
    if (!state.currentGroupId) return;
    
    // Simulate API call
    simulateApiCall(() => {
      const newMember = {
        id: Date.now(), // Temporary ID
        groupId: state.currentGroupId,
        name: name,
        phone: phone
      };
      
      state.members.push(newMember);
      renderMembers();
      hideModal('addMember');
    });
  }
  
  function removeSelectedMembers() {
    const checkboxes = containers.membersList.querySelectorAll('input[type="checkbox"]:checked');
    if (checkboxes.length === 0) {
      alert('Please select at least one member to remove');
      return;
    }
    
    if (!confirm(`Are you sure you want to remove ${checkboxes.length} member(s)?`)) {
      return;
    }
    
    // Simulate API call
    simulateApiCall(() => {
      const idsToRemove = Array.from(checkboxes).map(cb => parseInt(cb.dataset.memberId));
      state.members = state.members.filter(m => !idsToRemove.includes(m.id));
      renderMembers();
    });
  }
  
  // Buzz Functions
  function buzzSelectedMembers() {
    const checkboxes = containers.membersList.querySelectorAll('input[type="checkbox"]:checked');
    if (checkboxes.length === 0) {
      alert('Please select at least one member to buzz');
      return;
    }
    
    playBuzzEffect(checkboxes.length);
  }
  
  function buzzAllMembers() {
    if (state.members.length === 0) {
      alert('No members to buzz');
      return;
    }
    
    playBuzzEffect(state.members.length);
  }
  
  function playBuzzEffect(count) {
    // Play sound
    buzzSound.currentTime = 0;
    buzzSound.play();
    
    // Add visual effect to the buzz buttons
    const buttons = [buttons.buzzSelected, buttons.buzzAll];
    buttons.forEach(btn => {
      btn.classList.add('buzz-effect');
      setTimeout(() => {
        btn.classList.remove('buzz-effect');
      }, 500);
    });
    
    // Show notification
    alert(`Buzz sent to ${count} member(s)!`);
  }
  
  // Utility Functions
  function simulateApiCall(callback) {
    // Show loading state
    const activeButtons = document.querySelectorAll('.btn:not(:disabled)');
    activeButtons.forEach(btn => {
      btn.disabled = true;
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      btn.dataset.originalContent = originalHTML;
    });
    
    // Simulate network delay
    setTimeout(() => {
      callback();
      
      // Restore buttons
      activeButtons.forEach(btn => {
        btn.disabled = false;
        if (btn.dataset.originalContent) {
          btn.innerHTML = btn.dataset.originalContent;
          delete btn.dataset.originalContent;
        }
      });
    }, 800);
  }
});
