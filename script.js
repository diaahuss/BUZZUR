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
        
        // Members
        addMemberBtn.addEventListener('click', () => toggleModal(addMemberModal, true));
        cancelAdd.addEventListener('click', () => toggleModal(addMemberModal, false));
        confirmAdd.addEventListener('click', addMember);
        
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
        showScreen('login-screen');
    }
    
    // Form handlers
    function handleLogin(e) {
        e.preventDefault();
        showScreen('app-screen');
    }
    
    function handleSignup(e) {
        e.preventDefault();
        showScreen('app-screen');
    }
    
    // Group functions
    function renderGroups() {
        groupsList.innerHTML = '';
        
        groups.forEach(group => {
            const groupItem = document.createElement('div');
            groupItem.className = 'group-item';
            groupItem.innerHTML = `
                <div>${group.name}</div>
                <div>${group.members.length} members</div>
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
    
    function createGroup() {
        const name = newGroupName.value.trim();
        if (!name) return;
        
        groups.push({
            id: Date.now(),
            name,
            members: []
        });
        
        newGroupName.value = '';
        toggleModal(createGroupModal, false);
        renderGroups();
    }
    
    function addMember() {
        const name = memberName.value.trim();
        const phone = memberPhone.value.trim();
        
        if (!name || !phone) return;
        
        currentGroup.members.push({
            id: Date.now(),
            name,
            phone
        });
        
        memberName.value = '';
        memberPhone.value = '';
        toggleModal(addMemberModal, false);
        renderMembers();
    }
    
    function buzzSelected() {
        const selected = document.querySelectorAll('.member-checkbox:checked');
        if (selected.length === 0) {
            alert('Please select at least one member');
            return;
        }
        
        buzzSound.play();
        alert(`Buzzing ${selected.length} members!`);
    }
    
    function buzzAll() {
        buzzSound.play();
        alert(`Buzzing all ${currentGroup.members.length} members!`);
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
