document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginScreen = document.getElementById('login-screen');
    const signupScreen = document.getElementById('signup-screen');
    const appScreen = document.getElementById('app-screen');
    
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const showSignupBtn = document.getElementById('show-signup');
    const showLoginBtn = document.getElementById('show-login');
    const logoutBtn = document.getElementById('logout-btn');
    
    const groupsList = document.getElementById('groups-list');
    const createGroupBtn = document.getElementById('create-group-btn');
    const groupContent = document.getElementById('group-content');
    
    const createGroupModal = document.getElementById('create-group-modal');
    const newGroupNameInput = document.getElementById('new-group-name');
    const cancelCreateGroup = document.getElementById('cancel-create-group');
    const confirmCreateGroup = document.getElementById('confirm-create-group');
    
    const addMemberModal = document.getElementById('add-member-modal');
    const cancelAddMember = document.getElementById('cancel-add-member');
    const confirmAddMember = document.getElementById('confirm-add-member');
    
    const buzzSound = document.getElementById('buzz-sound');
    
    // Sample Data
    let groups = [
        {
            id: 1,
            name: 'Family',
            members: [
                { id: 1, name: 'John Doe', phone: '+1234567890' },
                { id: 2, name: 'Jane Smith', phone: '+1987654321' }
            ]
        },
        {
            id: 2,
            name: 'Work Team',
            members: [
                { id: 3, name: 'Mike Johnson', phone: '+1122334455' },
                { id: 4, name: 'Sarah Williams', phone: '+1555666777' }
            ]
        }
    ];
    
    let currentGroup = null;
    
    // Initialize the app
    function init() {
        setupEventListeners();
        renderGroups();
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Navigation
        showSignupBtn.addEventListener('click', showSignup);
        showLoginBtn.addEventListener('click', showLogin);
        logoutBtn.addEventListener('click', logout);
        
        // Forms
        loginForm.addEventListener('submit', handleLogin);
        signupForm.addEventListener('submit', handleSignup);
        
        // Groups
        createGroupBtn.addEventListener('click', () => toggleModal(createGroupModal, true));
        cancelCreateGroup.addEventListener('click', () => toggleModal(createGroupModal, false));
        confirmCreateGroup.addEventListener('click', createGroup);
        
        // Members
        cancelAddMember.addEventListener('click', () => toggleModal(addMemberModal, false));
        confirmAddMember.addEventListener('click', addMember);
        
        // Password toggles
        document.querySelectorAll('.toggle-password').forEach(icon => {
            icon.addEventListener('click', function() {
                const input = this.previousElementSibling;
                const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                input.setAttribute('type', type);
                this.classList.toggle('fa-eye-slash');
            });
        });
    }
    
    // Navigation functions
    function showSignup(e) {
        if (e) e.preventDefault();
        loginScreen.classList.remove('active');
        signupScreen.classList.add('active');
    }
    
    function showLogin(e) {
        if (e) e.preventDefault();
        signupScreen.classList.remove('active');
        loginScreen.classList.add('active');
    }
    
    function showApp() {
        loginScreen.classList.remove('active');
        signupScreen.classList.remove('active');
        appScreen.style.display = 'flex';
        renderGroups();
    }
    
    function logout() {
        appScreen.style.display = 'none';
        loginScreen.classList.add('active');
    }
    
    // Form handlers
    function handleLogin(e) {
        e.preventDefault();
        const phone = document.getElementById('login-phone').value;
        const password = document.getElementById('login-password').value;
        
        // Basic validation
        if (!phone || !password) {
            alert('Please enter both phone and password');
            return;
        }
        
        // In a real app, you would verify credentials with your server
        showApp();
    }
    
    function handleSignup(e) {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const phone = document.getElementById('signup-phone').value;
        const password = document.getElementById('signup-password').value;
        const confirm = document.getElementById('signup-confirm').value;
        
        // Validation
        if (!name || !phone || !password || !confirm) {
            alert('Please fill all fields');
            return;
        }
        
        if (password !== confirm) {
            alert('Passwords do not match');
            return;
        }
        
        // In a real app, you would register the user with your server
        showApp();
    }
    
    // Group functions
    function renderGroups() {
        groupsList.innerHTML = '';
        
        if (groups.length === 0) {
            groupsList.innerHTML = '<p class="no-groups">No groups yet. Create your first group!</p>';
            return;
        }
        
        groups.forEach(group => {
            const groupItem = document.createElement('div');
            groupItem.className = 'group-item';
            groupItem.innerHTML = `
                ${group.name}
                <span class="member-count">${group.members.length}</span>
            `;
            
            groupItem.addEventListener('click', () => showGroupDetail(group));
            groupsList.appendChild(groupItem);
        });
    }
    
    function showGroupDetail(group) {
        currentGroup = group;
        document.getElementById('group-title').textContent = group.name;
        
        groupContent.innerHTML = '';
        const template = document.getElementById('group-detail-template');
        const content = template.content.cloneNode(true);
        
        const membersList = content.getElementById('members-list');
        group.members.forEach(member => {
            const memberItem = document.createElement('div');
            memberItem.className = 'member-item';
            memberItem.innerHTML = `
                <div class="member-info">
                    <h4>${member.name}</h4>
                    <p>${member.phone}</p>
                </div>
                <input type="checkbox" class="member-checkbox" data-id="${member.id}">
            `;
            membersList.appendChild(memberItem);
        });
        
        // Add event listeners to buttons in the template
        content.getElementById('add-member-btn').addEventListener('click', () => {
            toggleModal(addMemberModal, true);
        });
        
        content.getElementById('delete-group-btn').addEventListener('click', deleteGroup);
        content.getElementById('buzz-selected-btn').addEventListener('click', buzzSelected);
        content.getElementById('buzz-all-btn').addEventListener('click', buzzAll);
        
        groupContent.appendChild(content);
    }
    
    function createGroup() {
        const name = newGroupNameInput.value.trim();
        if (!name) {
            alert('Please enter a group name');
            return;
        }
        
        const newGroup = {
            id: Date.now(),
            name,
            members: []
        };
        
        groups.push(newGroup);
        renderGroups();
        toggleModal(createGroupModal, false);
        newGroupNameInput.value = '';
    }
    
    function addMember() {
        const name = document.getElementById('member-name').value.trim();
        const phone = document.getElementById('member-phone').value.trim();
        
        if (!name || !phone) {
            alert('Please fill all fields');
            return;
        }
        
        const newMember = {
            id: Date.now(),
            name,
            phone
        };
        
        currentGroup.members.push(newMember);
        showGroupDetail(currentGroup);
        toggleModal(addMemberModal, false);
        
        // Clear inputs
        document.getElementById('member-name').value = '';
        document.getElementById('member-phone').value = '';
    }
    
    function deleteGroup() {
        if (confirm(`Are you sure you want to delete "${currentGroup.name}"?`)) {
            groups = groups.filter(g => g.id !== currentGroup.id);
            renderGroups();
            
            // Show empty state
            groupContent.innerHTML = '';
            document.getElementById('group-title').textContent = 'Select a Group';
            
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <i class="fas fa-users"></i>
                <p>Select a group from the sidebar or create a new one</p>
            `;
            groupContent.appendChild(emptyState);
        }
    }
    
    function buzzSelected() {
        const selected = document.querySelectorAll('.member-checkbox:checked');
        if (selected.length === 0) {
            alert('Please select at least one member to buzz');
            return;
        }
        
        // Play buzz sound
        buzzSound.play();
        
        // In a real app, you would send Twilio notifications here
        const selectedMembers = Array.from(selected).map(checkbox => {
            const memberId = parseInt(checkbox.dataset.id);
            return currentGroup.members.find(m => m.id === memberId);
        });
        
        alert(`Buzzing ${selected.length} selected members!`);
        console.log('Selected members to buzz:', selectedMembers);
    }
    
    function buzzAll() {
        // Play buzz sound
        buzzSound.play();
        
        // In a real app, you would send Twilio notifications here
        alert(`Buzzing all ${currentGroup.members.length} members!`);
        console.log('Buzzing all members:', currentGroup.members);
    }
    
    // Utility functions
    function toggleModal(modal, show) {
        if (show) {
            modal.classList.add('active');
        } else {
            modal.classList.remove('active');
        }
    }
    
    // Initialize the app
    init();
});
