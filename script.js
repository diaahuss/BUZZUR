document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginScreen = document.getElementById('login-screen');
    const signupScreen = document.getElementById('signup-screen');
    const groupsScreen = document.getElementById('groups-screen');
    const groupDetailScreen = document.getElementById('group-detail-screen');
    
    const showSignupBtn = document.getElementById('show-signup');
    const showLoginBtn = document.getElementById('show-login');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const logoutBtn = document.getElementById('logout-btn');
    const createGroupBtn = document.getElementById('create-group-btn');
    const backToGroupsBtn = document.getElementById('back-to-groups');
    const editGroupNameBtn = document.getElementById('edit-group-name');
    const addMemberBtn = document.getElementById('add-member-btn');
    const removeMembersBtn = document.getElementById('remove-members-btn');
    const buzzSelectedBtn = document.getElementById('buzz-selected-btn');
    const buzzAllBtn = document.getElementById('buzz-all-btn');
    const deleteGroupBtn = document.getElementById('delete-group-btn');
    
    // Modal elements
    const createGroupModal = document.getElementById('create-group-modal');
    const addMemberModal = document.getElementById('add-member-modal');
    const editGroupModal = document.getElementById('edit-group-modal');
    
    // Audio element
    const buzzSound = document.getElementById('buzz-sound');
    
    // State management
    let currentUser = null;
    let groups = [];
    let currentGroup = null;
    
    // Sample data for demonstration
    const sampleGroups = [
        { id: 1, name: 'Family', members: [
            { id: 1, name: 'John Doe', phone: '+1234567890' },
            { id: 2, name: 'Jane Smith', phone: '+1987654321' }
        ]},
        { id: 2, name: 'Work Team', members: [
            { id: 3, name: 'Mike Johnson', phone: '+1122334455' },
            { id: 4, name: 'Sarah Williams', phone: '+1555666777' }
        ]}
    ];
    
    // Initialize the app
    function init() {
        // Check if user is logged in (in a real app, you'd check localStorage/session)
        const loggedIn = false; // Change to true for testing
        
        if (loggedIn) {
            groups = sampleGroups;
            showScreen(groupsScreen);
            renderGroups();
        } else {
            showScreen(loginScreen);
        }
        
        setupEventListeners();
    }
    
    // Set up all event listeners
    function setupEventListeners() {
        // Navigation
        showSignupBtn.addEventListener('click', () => showScreen(signupScreen));
        showLoginBtn.addEventListener('click', () => showScreen(loginScreen));
        backToGroupsBtn.addEventListener('click', () => showScreen(groupsScreen));
        logoutBtn.addEventListener('click', handleLogout);
        
        // Forms
        loginForm.addEventListener('submit', handleLogin);
        signupForm.addEventListener('submit', handleSignup);
        
        // Group actions
        createGroupBtn.addEventListener('click', () => toggleModal(createGroupModal, true));
        document.getElementById('cancel-create-group').addEventListener('click', () => toggleModal(createGroupModal, false));
        document.getElementById('confirm-create-group').addEventListener('click', handleCreateGroup);
        
        // Member actions
        addMemberBtn.addEventListener('click', () => toggleModal(addMemberModal, true));
        document.getElementById('cancel-add-member').addEventListener('click', () => toggleModal(addMemberModal, false));
        document.getElementById('confirm-add-member').addEventListener('click', handleAddMember);
        
        // Group editing
        editGroupNameBtn.addEventListener('click', () => {
            document.getElementById('updated-group-name').value = currentGroup.name;
            toggleModal(editGroupModal, true);
        });
        document.getElementById('cancel-edit-group').addEventListener('click', () => toggleModal(editGroupModal, false));
        document.getElementById('confirm-edit-group').addEventListener('click', handleEditGroupName);
        
        // Other actions
        removeMembersBtn.addEventListener('click', handleRemoveMembers);
        buzzSelectedBtn.addEventListener('click', handleBuzzSelected);
        buzzAllBtn.addEventListener('click', handleBuzzAll);
        deleteGroupBtn.addEventListener('click', handleDeleteGroup);
        
        // Password toggle
        document.querySelectorAll('.toggle-password').forEach(icon => {
            icon.addEventListener('click', function() {
                const input = this.previousElementSibling;
                const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                input.setAttribute('type', type);
                this.classList.toggle('fa-eye-slash');
            });
        });
    }
    
    // Screen navigation
    function showScreen(screen) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        screen.classList.add('active');
    }
    
    // Modal handling
    function toggleModal(modal, show) {
        if (show) {
            modal.classList.add('active');
        } else {
            modal.classList.remove('active');
        }
    }
    
    // Render groups list
    function renderGroups() {
        const groupsList = document.getElementById('groups-list');
        groupsList.innerHTML = '';
        
        groups.forEach(group => {
            const groupCard = document.createElement('div');
            groupCard.className = 'group-card';
            groupCard.innerHTML = `
                <h3>${group.name}</h3>
                <p>${group.members.length} members</p>
            `;
            groupCard.addEventListener('click', () => showGroupDetail(group));
            groupsList.appendChild(groupCard);
        });
    }
    
    // Show group detail
    function showGroupDetail(group) {
        currentGroup = group;
        document.getElementById('group-detail-title').textContent = group.name;
        
        const membersList = document.getElementById('members-list');
        membersList.innerHTML = '';
        
        group.members.forEach(member => {
            const memberItem = document.createElement('div');
            memberItem.className = 'member-item';
            memberItem.innerHTML = `
                <div class="member-info">
                    <h3>${member.name}</h3>
                    <p>${member.phone}</p>
                </div>
                <input type="checkbox" class="member-checkbox" data-id="${member.id}">
            `;
            membersList.appendChild(memberItem);
        });
        
        showScreen(groupDetailScreen);
    }
    
    // Form handlers
    function handleLogin(e) {
        e.preventDefault();
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;
        
        // In a real app, you would validate and send to server
        console.log('Login attempt with:', phone, password);
        
        // Simulate successful login
        currentUser = { phone };
        groups = sampleGroups;
        showScreen(groupsScreen);
        renderGroups();
    }
    
    function handleSignup(e) {
        e.preventDefault();
        const fullname = document.getElementById('fullname').value;
        const phone = document.getElementById('new-phone').value;
        const password = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        
        // In a real app, you would send to server
        console.log('Signup with:', fullname, phone, password);
        
        // Simulate successful signup and auto-login
        currentUser = { phone, name: fullname };
        groups = [];
        showScreen(groupsScreen);
        renderGroups();
    }
    
    function handleLogout() {
        currentUser = null;
        groups = [];
        currentGroup = null;
        showScreen(loginScreen);
    }
    
    // Group handlers
    function handleCreateGroup() {
        const groupName = document.getElementById('new-group-name').value.trim();
        
        if (!groupName) {
            alert('Please enter a group name');
            return;
        }
        
        const newGroup = {
            id: Date.now(),
            name: groupName,
            members: []
        };
        
        groups.push(newGroup);
        renderGroups();
        toggleModal(createGroupModal, false);
        document.getElementById('new-group-name').value = '';
    }
    
    function handleEditGroupName() {
        const newName = document.getElementById('updated-group-name').value.trim();
        
        if (!newName) {
            alert('Please enter a group name');
            return;
        }
        
        currentGroup.name = newName;
        document.getElementById('group-detail-title').textContent = newName;
        
        // Update in groups array
        const groupIndex = groups.findIndex(g => g.id === currentGroup.id);
        if (groupIndex !== -1) {
            groups[groupIndex].name = newName;
        }
        
        toggleModal(editGroupModal, false);
        renderGroups();
    }
    
    function handleDeleteGroup() {
        if (confirm('Are you sure you want to delete this group?')) {
            groups = groups.filter(g => g.id !== currentGroup.id);
            showScreen(groupsScreen);
            renderGroups();
        }
    }
    
    // Member handlers
    function handleAddMember() {
        const name = document.getElementById('member-name').value.trim();
        const phone = document.getElementById('member-phone').value.trim();
        
        if (!name || !phone) {
            alert('Please fill in all fields');
            return;
        }
        
        const newMember = {
            id: Date.now(),
            name,
            phone
        };
        
        currentGroup.members.push(newMember);
        
        // Update in groups array
        const groupIndex = groups.findIndex(g => g.id === currentGroup.id);
        if (groupIndex !== -1) {
            groups[groupIndex].members = currentGroup.members;
        }
        
        showGroupDetail(currentGroup);
        toggleModal(addMemberModal, false);
        document.getElementById('member-name').value = '';
        document.getElementById('member-phone').value = '';
    }
    
    function handleRemoveMembers() {
        const checkboxes = document.querySelectorAll('.member-checkbox:checked');
        
        if (checkboxes.length === 0) {
            alert('Please select members to remove');
            return;
        }
        
        if (confirm(`Are you sure you want to remove ${checkboxes.length} member(s)?`)) {
            const idsToRemove = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));
            currentGroup.members = currentGroup.members.filter(m => !idsToRemove.includes(m.id));
            
            // Update in groups array
            const groupIndex = groups.findIndex(g => g.id === currentGroup.id);
            if (groupIndex !== -1) {
                groups[groupIndex].members = currentGroup.members;
            }
            
            showGroupDetail(currentGroup);
        }
    }
    
    // Buzz handlers
    function handleBuzzSelected() {
        const checkboxes = document.querySelectorAll('.member-checkbox:checked');
        
        if (checkboxes.length === 0) {
            alert('Please select members to buzz');
            return;
        }
        
        const idsToBuzz = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));
        const membersToBuzz = currentGroup.members.filter(m => idsToBuzz.includes(m.id));
        
        // Play buzz sound
        buzzSound.play();
        
        // In a real app, you would send buzz notifications via Twilio
        console.log('Buzzing selected members:', membersToBuzz);
        alert(`Buzzing ${membersToBuzz.length} member(s)!`);
    }
    
    function handleBuzzAll() {
        // Play buzz sound
        buzzSound.play();
        
        // In a real app, you would send buzz notifications via Twilio
        console.log('Buzzing all members:', currentGroup.members);
        alert(`Buzzing all ${currentGroup.members.length} members!`);
    }
    
    // Initialize the app
    init();
});
