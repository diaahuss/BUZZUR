document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginScreen = document.getElementById('login-screen');
    const groupsScreen = document.getElementById('groups-screen');
    const groupScreen = document.getElementById('group-screen');
    const loginBtn = document.getElementById('login-btn');
    const listGroupsBtn = document.getElementById('list-groups-btn');
    const createGroupBtn = document.getElementById('create-group-btn');
    const groupsList = document.getElementById('groups-list');
    const groupNameDisplay = document.getElementById('group-name-display');
    const membersList = document.getElementById('members-list');
    const backBtn = document.getElementById('back-btn');
    const createGroupModal = document.getElementById('create-group-modal');
    const confirmCreateGroup = document.getElementById('confirm-create-group');
    const cancelCreateGroup = document.getElementById('cancel-create-group');
    const newGroupName = document.getElementById('new-group-name');
    const addMemberModal = document.getElementById('add-member-modal');
    const confirmAddMember = document.getElementById('confirm-add-member');
    const cancelAddMember = document.getElementById('cancel-add-member');
    const newMemberName = document.getElementById('new-member-name');
    const editNameBtn = document.getElementById('edit-name-btn');
    const addMemberBtn = document.getElementById('add-member-btn');
    const removeMemberBtn = document.getElementById('remove-member-btn');
    const buzzSelectedBtn = document.getElementById('buzz-selected-btn');
    const buzzAllBtn = document.getElementById('buzz-all-btn');

    // Sample data (replace with actual backend integration)
    let groups = [
        { id: 1, name: "Family", members: ["Mom", "Dad", "Sister"] },
        { id: 2, name: "Friends", members: ["Alice", "Bob", "Charlie"] },
        { id: 3, name: "Work", members: ["Manager", "Colleague 1", "Colleague 2"] }
    ];
    let currentGroup = null;

    // Event Listeners
    loginBtn.addEventListener('click', handleLogin);
    listGroupsBtn.addEventListener('click', listGroups);
    createGroupBtn.addEventListener('click', showCreateGroupModal);
    confirmCreateGroup.addEventListener('click', createGroup);
    cancelCreateGroup.addEventListener('click', hideCreateGroupModal);
    confirmAddMember.addEventListener('click', addMember);
    cancelAddMember.addEventListener('click', hideAddMemberModal);
    backBtn.addEventListener('click', goBackToGroups);
    editNameBtn.addEventListener('click', editGroupName);
    addMemberBtn.addEventListener('click', showAddMemberModal);
    removeMemberBtn.addEventListener('click', removeSelectedMembers);
    buzzSelectedBtn.addEventListener('click', buzzSelectedMembers);
    buzzAllBtn.addEventListener('click', buzzAllMembers);

    // Functions
    function handleLogin() {
        // In a real app, validate credentials with backend
        loginScreen.classList.add('hidden');
        groupsScreen.classList.remove('hidden');
        listGroups();
    }

    function listGroups() {
        groupsList.innerHTML = '';
        groups.forEach(group => {
            const groupElement = document.createElement('div');
            groupElement.className = 'group-item';
            groupElement.textContent = group.name;
            groupElement.addEventListener('click', () => viewGroup(group));
            groupsList.appendChild(groupElement);
        });
    }

    function viewGroup(group) {
        currentGroup = group;
        groupNameDisplay.textContent = group.name;
        renderMembers();
        groupsScreen.classList.add('hidden');
        groupScreen.classList.remove('hidden');
    }

    function renderMembers() {
        membersList.innerHTML = '';
        currentGroup.members.forEach(member => {
            const memberCard = document.createElement('div');
            memberCard.className = 'member-card';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `member-${member}`;
            
            const label = document.createElement('label');
            label.htmlFor = `member-${member}`;
            label.textContent = member;
            
            memberCard.appendChild(checkbox);
            memberCard.appendChild(label);
            membersList.appendChild(memberCard);
        });
    }

    function showCreateGroupModal() {
        newGroupName.value = '';
        createGroupModal.classList.remove('hidden');
    }

    function hideCreateGroupModal() {
        createGroupModal.classList.add('hidden');
    }

    function createGroup() {
        const name = newGroupName.value.trim();
        if (name) {
            const newGroup = {
                id: groups.length + 1,
                name: name,
                members: []
            };
            groups.push(newGroup);
            hideCreateGroupModal();
            listGroups();
        }
    }

    function showAddMemberModal() {
        newMemberName.value = '';
        addMemberModal.classList.remove('hidden');
    }

    function hideAddMemberModal() {
        addMemberModal.classList.add('hidden');
    }

    function addMember() {
        const name = newMemberName.value.trim();
        if (name && currentGroup) {
            currentGroup.members.push(name);
            hideAddMemberModal();
            renderMembers();
        }
    }

    function goBackToGroups() {
        groupScreen.classList.add('hidden');
        groupsScreen.classList.remove('hidden');
        currentGroup = null;
    }

    function editGroupName() {
        const newName = prompt("Enter new group name:", currentGroup.name);
        if (newName && newName.trim()) {
            currentGroup.name = newName.trim();
            groupNameDisplay.textContent = currentGroup.name;
        }
    }

    function removeSelectedMembers() {
        const checkboxes = membersList.querySelectorAll('input[type="checkbox"]:checked');
        const membersToRemove = Array.from(checkboxes).map(cb => cb.nextElementSibling.textContent);
        
        if (membersToRemove.length > 0) {
            currentGroup.members = currentGroup.members.filter(m => !membersToRemove.includes(m));
            renderMembers();
        } else {
            alert("Please select members to remove");
        }
    }

    function buzzSelectedMembers() {
        const checkboxes = membersList.querySelectorAll('input[type="checkbox"]:checked');
        const membersToBuzz = Array.from(checkboxes).map(cb => cb.nextElementSibling.textContent);
        
        if (membersToBuzz.length > 0) {
            alert(`Buzzing: ${membersToBuzz.join(', ')}`);
            // In a real app, send buzz request to backend for these members
        } else {
            alert("Please select members to buzz");
        }
    }

    function buzzAllMembers() {
        if (currentGroup.members.length > 0) {
            alert(`Buzzing all: ${currentGroup.members.join(', ')}`);
            // In a real app, send buzz request to backend for all members
        } else {
            alert("No members in this group");
        }
    }
});
