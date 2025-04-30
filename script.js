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
        e.preventDefault();
        loginScreen.style.display = 'none';
        signupScreen.style.display = 'flex';
    }
    
    function showLogin(e) {
        e.preventDefault();
        signupScreen.style.display = 'none';
        loginScreen.style.display = 'flex';
    }
    
    function showApp() {
        loginScreen.style.display = 'none';
        signupScreen.style.display = 'none';
        appScreen.style.display = 'flex';
    }
    
    function logout() {
        appScreen.style.display = 'none';
        loginScreen.style.display = 'flex';
    }
    
    // Form handlers
    function handleLogin(e) {
        e.preventDefault();
        showApp();
    }
    
    function handleSignup(e) {
        e.preventDefault();
        showApp();
    }
    
    // Group functions
    function renderGroups() {
        groupsList.innerHTML = '';
        
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
        
        // Update title
        document.getElementById('group-title').textContent = group.name;
        
        // Clear previous content
        groupContent.innerHTML = '';
        
        // Get template and clone it
        const template = document.getElementById('group-detail-template');
        const content = template.content.cloneNode(true);
        
        // Set up members list
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
            alert('Add member functionality would go here');
        });
        
        content.getElementById('delete-group-btn').addEventListener('click', () => {
            if (confirm(`Are you sure you want to delete "${group.name}"?`)) {
                groups = groups.filter(g => g.id !== group.id);
                renderGroups();
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
        });
        
        content.getElementById('buzz-selected-btn').addEventListener('click', () => {
            const selected = membersList.querySelectorAll('.member-checkbox:checked');
            if (selected.length === 0) {
                alert('Please select at least one member to buzz');
                return;
            }
            alert(`Buzzing ${selected.length} selected members!`);
        });
        
        content.getElementById('buzz-all-btn').addEventListener('click', () => {
            alert(`Buzzing all ${group.members.length} members!`);
        });
        
        // Add the content to the page
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
