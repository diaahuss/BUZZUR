const socket = io();
const app = document.getElementById('app');

// Screens
const loginScreen = document.getElementById('login-screen');
const signupScreen = document.getElementById('signup-screen');
const groupsScreen = document.getElementById('groups-screen');
const groupDetailsScreen = document.getElementById('group-details-screen');

// Banner
const banner = document.getElementById('banner');
const groupsBanner = document.getElementById('groups-banner');
const groupBanner = document.getElementById('group-banner');

// Buttons
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const toSignup = document.getElementById('to-signup');
const toLogin = document.getElementById('to-login');
const createGroupBtn = document.getElementById('create-group-btn');
const logoutBtn = document.getElementById('logout-btn');
const backToGroupsBtn = document.getElementById('back-to-groups-btn');
const editNameBtn = document.getElementById('edit-name-btn');
const addMemberBtn = document.getElementById('add-member-btn');
const removeMemberBtn = document.getElementById('remove-member-btn');
const buzzSelectedBtn = document.getElementById('buzz-selected-btn');
const buzzAllBtn = document.getElementById('buzz-all-btn');

// Lists
const groupList = document.getElementById('group-list');
const memberList = document.getElementById('member-list');
const selectedGroupName = document.getElementById('selected-group-name');

// Data
let groups = [];
let selectedGroup = null;

// Navigation
toSignup.onclick = () => {
    loginScreen.style.display = 'none';
    signupScreen.style.display = 'block';
};
toLogin.onclick = () => {
    signupScreen.style.display = 'none';
    loginScreen.style.display = 'block';
};

// Fake login/signup
loginBtn.onclick = () => {
    loginScreen.style.display = 'none';
    groupsScreen.style.display = 'block';
    banner.innerText = 'BUZZALL';
};

signupBtn.onclick = () => {
    signupScreen.style.display = 'none';
    loginScreen.style.display = 'block';
};

// Logout
logoutBtn.onclick = () => {
    location.reload();
};

// Create Group
createGroupBtn.onclick = () => {
    const groupName = prompt('Enter group name:');
    if (groupName) {
        const newGroup = { id: Date.now(), name: groupName, members: [] };
        groups.push(newGroup);
        renderGroups();
    }
};

// Render Groups
function renderGroups() {
    groupList.innerHTML = '';
    groups.forEach(group => {
        const btn = document.createElement('button');
        btn.textContent = group.name;
        btn.onclick = () => openGroup(group);
        groupList.appendChild(btn);
    });
}

// Open Group
function openGroup(group) {
    selectedGroup = group;
    groupsScreen.style.display = 'none';
    groupDetailsScreen.style.display = 'block';
    selectedGroupName.textContent = group.name;
    renderMembers();
}

// Render Members
function renderMembers() {
    memberList.innerHTML = '';
    selectedGroup.members.forEach((member, index) => {
        const div = document.createElement('div');
        div.className = 'member-item';
        div.innerHTML = `<input type="checkbox" data-index="${index}"> ${member.name} (${member.phone})`;
        memberList.appendChild(div);
    });
}

// Edit Group Name
editNameBtn.onclick = () => {
    const newName = prompt('Enter new group name:', selectedGroup.name);
    if (newName) {
        selectedGroup.name = newName;
        selectedGroupName.textContent = newName;
        renderGroups();
    }
};

// Add Member
addMemberBtn.onclick = () => {
    const name = prompt('Member name:');
    const phone = prompt('Member phone:');
    if (name && phone) {
        selectedGroup.members.push({ name, phone });
        renderMembers();
    }
};

// Remove Member
removeMemberBtn.onclick = () => {
    const index = [...memberList.querySelectorAll('input[type="checkbox"]')]
        .findIndex(checkbox => checkbox.checked);
    if (index !== -1) {
        selectedGroup.members.splice(index, 1);
        renderMembers();
    }
};

// Buzz Selected
buzzSelectedBtn.onclick = () => {
    const selectedMembers = [...memberList.querySelectorAll('input[type="checkbox"]')]
        .filter(c => c.checked)
        .map(c => selectedGroup.members[c.dataset.index]);
    if (selectedMembers.length > 0) {
        selectedMembers.forEach(member => buzz(member.phone));
    }
};

// Buzz All
buzzAllBtn.onclick = () => {
    selectedGroup.members.forEach(member => buzz(member.phone));
};

// Back
backToGroupsBtn.onclick = () => {
    groupDetailsScreen.style.display = 'none';
    groupsScreen.style.display = 'block';
};

// Buzz function
function buzz(phone) {
    socket.emit('buzz', { phone });
    const sound = document.getElementById('buzz-sound');
    sound.play();
}
