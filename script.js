document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginScreen = document.getElementById('login-screen');
    const signupScreen = document.getElementById('signup-screen');
    const appScreen = document.getElementById('app-screen');
    const groupScreen = document.getElementById('group-screen');
    
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const showSignupBtn = document.getElementById('show-signup');
    const showLoginBtn = document.getElementById('show-login');
    const logoutBtn = document.getElementById('logout-btn');
    const backBtn = document.getElementById('back-btn');
    
    const groupsList = document.getElementById('groups-list');
    const createGroupBtn = document.getElementById('create-group-btn');
    const groupTitle = document.getElementById('group-title');
    const membersList = document.getElementById('members-list');
    const addMemberBtn = document.getElementById('add-member-btn');
    const removeMembersBtn = document.getElementById('remove-members-btn');
    const deleteGroupBtn = document.getElementById('delete-group-btn');
    const buzzSelectedBtn = document.getElementById('buzz-selected-btn');
    const buzzAllBtn = document.getElementById('buzz-all-btn');
    
    const createGroupModal = document.getElementById('create-group-modal');
    const newGroupName = document.getElementById('new-group-name');
    const cancelCreate = document.getElementById('cancel-create');
    const confirmCreate = document.getElementById('confirm-create');
    
    const addMemberModal = document.getElementById('add-member-modal');
    const memberName = document.getElementById('member-name');
    const memberPhone = document.getElementById('member-phone');
    const cancelAdd = document.getElementById('cancel-add');
    const confirmAdd = document.getElementById('confirm-add');
    
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
    let authToken = null; // For API authentication
    
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
        backBtn.addEventListener('click', goBack);
        
        // Forms
        loginForm.addEventListener('submit', handleLogin);
        signupForm.addEventListener('submit', handleSignup);
        
        // Groups
        createGroupBtn.addEventListener('click', () => toggleModal(createGroupModal, true));
        cancelCreate.addEventListener('click', () => toggleModal(createGroupModal, false));
        confirmCreate.addEventListener('click', createGroup);
        deleteGroupBtn.addEventListener('click', deleteGroup);
        
        // Members
        addMemberBtn.addEventListener('click', () => toggleModal(addMemberModal, true));
        cancelAdd.addEventListener('click', () => toggleModal(addMemberModal, false));
        confirmAdd.addEventListener('click', addMember);
        removeMembersBtn.addEventListener('click', removeMembers);
        
        // Buzz
        buzzSelectedBtn.addEventListener('click', buzzSelected);
        buzzAllBtn.addEventListener('click', buzzAll);
        
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
    
    // Screen navigation
    function showScreen(screen) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screen).classList.add('active');
    }
    
    function showSignup(e) {
        e.preventDefault();
        showScreen('signup-screen');
    }
    
    function showLogin(e) {
        e.preventDefault();
        showScreen('login-screen');
    }
    
    function goBack() {
        showScreen('app-screen');
    }
    
    function logout() {
        authToken = null;
        showScreen('login-screen');
    }
    
    // Form handlers
    async function handleLogin(e) {
        e.preventDefault();
        const email = loginForm.querySelector('input[type="email"]').value;
        const password = loginForm.querySelector('input[type="password"]').value;
        
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            if (!response.ok) throw new Error('Login failed');
            
            const data = await response.json();
            authToken = data.token;
            groups = data.groups || groups;
            showScreen('app-screen');
            renderGroups();
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed. Please try again.');
        }
    }
    
    async function handleSignup(e) {
        e.preventDefault();
        const email = signupForm.querySelector('input[type="email"]').value;
        const password = signupForm.querySelector('input[type="password"]').value;
        const name = signupForm.querySelector('input[placeholder="Full Name"]').value;
        
        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name })
            });
            
            if (!response.ok) throw new Error('Signup failed');
            
            const data = await response.json();
            authToken = data.token;
            showScreen('app-screen');
        } catch (error) {
            console.error('Signup error:', error);
            alert('Signup failed. Please try again.');
        }
    }
    
    // Group functions
    function renderGroups() {
        groupsList.innerHTML = '';
        
        if (groups.length === 0) {
            groupsList.innerHTML = '<div class="empty-message">No groups yet. Create your first group!</div>';
            return;
        }
        
        groups.forEach(group => {
            const groupItem = document.createElement('div');
            groupItem.className = 'group-item';
            groupItem.innerHTML = `
                <div>
                    <h4>${group.name}</h4>
                    <p>${group.members.length} ${group.members.length === 1 ? 'member' : 'members'}</p>
                </div>
                <i class="fas fa-chevron-right"></i>
            `;
            
            groupItem.addEventListener('click', () => {
                currentGroup = group;
                groupTitle.textContent = group.name;
                renderMembers();
                showScreen('group-screen');
            });
            
            groupsList.appendChild(groupItem);
        });
    }
    
    function renderMembers() {
        membersList.innerHTML = '';
        
        if (currentGroup.members.length === 0) {
            membersList.innerHTML = '<div class="empty-message">No members yet. Add your first member!</div>';
            return;
        }
        
        currentGroup.members.forEach(member => {
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
    }
    
    async function createGroup() {
        const name = newGroupName.value.trim();
        if (!name) {
            alert('Please enter a group name');
            return;
        }
        
        try {
            const response = await fetch('/api/groups', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ name })
            });
            
            if (!response.ok) throw new Error('Failed to create group');
            
            const newGroup = await response.json();
            groups.push(newGroup);
            newGroupName.value = '';
            toggleModal(createGroupModal, false);
            renderGroups();
        } catch (error) {
            console.error('Create group error:', error);
            alert('Failed to create group. Please try again.');
        }
    }
    
    async function deleteGroup() {
        if (!confirm(`Are you sure you want to delete "${currentGroup.name}" and all its members?`)) {
            return;
        }
        
        try {
            const response = await fetch(`/api/groups/${currentGroup.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            
            if (!response.ok) throw new Error('Failed to delete group');
            
            groups = groups.filter(g => g.id !== currentGroup.id);
            renderGroups();
            showScreen('app-screen');
        } catch (error) {
            console.error('Delete group error:', error);
            alert('Failed to delete group. Please try again.');
        }
    }
    
    async function addMember() {
        const name = memberName.value.trim();
        const phone = memberPhone.value.trim();
        
        if (!name || !phone) {
            alert('Please enter both name and phone number');
            return;
        }
        
        try {
            const response = await fetch(`/api/groups/${currentGroup.id}/members`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ name, phone })
            });
            
            if (!response.ok) throw new Error('Failed to add member');
            
            const newMember = await response.json();
            currentGroup.members.push(newMember);
            
            memberName.value = '';
            memberPhone.value = '';
            toggleModal(addMemberModal, false);
            renderMembers();
        } catch (error) {
            console.error('Add member error:', error);
            alert('Failed to add member. Please try again.');
        }
    }
    
    async function removeMembers() {
        const checkboxes = document.querySelectorAll('.member-checkbox:checked');
        if (checkboxes.length === 0) {
            alert('Please select at least one member to remove');
            return;
        }
        
        if (!confirm(`Remove ${checkboxes.length} selected members?`)) {
            return;
        }
        
        const idsToRemove = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));
        
        try {
            const response = await fetch(`/api/groups/${currentGroup.id}/members`, {
                method: 'DELETE',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ memberIds: idsToRemove })
            });
            
            if (!response.ok) throw new Error('Failed to remove members');
            
            currentGroup.members = currentGroup.members.filter(m => !idsToRemove.includes(m.id));
            renderMembers();
        } catch (error) {
            console.error('Remove members error:', error);
            alert('Failed to remove members. Please try again.');
        }
    }
    
    async function buzzSelected() {
        const checkboxes = document.querySelectorAll('.member-checkbox:checked');
        if (checkboxes.length === 0) {
            alert('Please select at least one member to buzz');
            return;
        }
        
        // Play buzz sound
        buzzSound.play();
        
        // Get selected members
        const idsToBuzz = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));
        const membersToBuzz = currentGroup.members.filter(m => idsToBuzz.includes(m.id));
        
        // Show loading state
        buzzSelectedBtn.disabled = true;
        buzzSelectedBtn.textContent = 'Sending...';
        
        try {
            const response = await fetch(`/api/groups/${currentGroup.id}/buzz`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ 
                    memberIds: idsToBuzz,
                    message: `BUZZ ALERT from ${currentGroup.name}!`
                })
            });
            
            if (!response.ok) throw new Error('Buzz failed');
            
            const result = await response.json();
            alert(`Successfully buzzed ${result.successCount}/${membersToBuzz.length} members!`);
        } catch (error) {
            console.error('Buzz error:', error);
            alert('Buzz failed. Please try again.');
        } finally {
            // Reset button state
            buzzSelectedBtn.disabled = false;
            buzzSelectedBtn.textContent = 'Buzz Selected';
        }
    }
    
    async function buzzAll() {
        if (currentGroup.members.length === 0) {
            alert('No members in this group to buzz');
            return;
        }
        
        // Play buzz sound
        buzzSound.play();
        
        // Show loading state
        buzzAllBtn.disabled = true;
        buzzAllBtn.textContent = 'Sending...';
        
        try {
            const response = await fetch(`/api/groups/${currentGroup.id}/buzz`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ 
                    memberIds: currentGroup.members.map(m => m.id),
                    message: `BUZZ ALERT from ${currentGroup.name}!`
                })
            });
            
            if (!response.ok) throw new Error('Buzz failed');
            
            const result = await response.json();
            alert(`Successfully buzzed ${result.successCount}/${currentGroup.members.length} members!`);
        } catch (error) {
            console.error('Buzz error:', error);
            alert('Buzz failed. Please try again.');
        } finally {
            // Reset button state
            buzzAllBtn.disabled = false;
            buzzAllBtn.textContent = 'Buzz All';
        }
    }
    
    // Utility functions
    function toggleModal(modal, show) {
        if (show) {
            modal.classList.add('active');
            document.body.classList.add('modal-open');
        } else {
            modal.classList.remove('active');
            document.body.classList.remove('modal-open');
        }
    }
    
    // Initialize the app
    init();
});
