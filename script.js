// ================= SCREEN MANAGEMENT =================
const SCREENS = {
  LOGIN: 'login-screen',
  SIGNUP: 'signup-screen',
  APP: 'app-screen',
  GROUP: 'group-screen'
};

let currentUser = null;
let currentGroup = null;

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  document.getElementById(screenId).classList.add('active');
}

// ================= AUTHENTICATION =================
// Mock database
const users = [
  { phone: '1234567890', password: 'password123', name: 'Test User' }
];

// Password visibility toggle
document.querySelectorAll('.toggle-password').forEach(icon => {
  icon.addEventListener('click', function() {
    const input = this.previousElementSibling;
    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
    input.setAttribute('type', type);
    this.classList.toggle('fa-eye-slash');
  });
});

// Login
document.getElementById('login-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const phone = document.getElementById('login-phone').value;
  const password = document.getElementById('login-password').value;

  const user = users.find(u => u.phone === phone && u.password === password);
  if (user) {
    currentUser = user;
    showScreen(SCREENS.APP);
    loadGroups();
  } else {
    alert('Invalid phone or password');
  }
});

// Signup
document.getElementById('signup-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const name = document.getElementById('signup-name').value;
  const phone = document.getElementById('signup-phone').value;
  const password = document.getElementById('signup-password').value;
  const confirm = document.getElementById('signup-confirm').value;

  if (password !== confirm) {
    alert("Passwords don't match!");
    return;
  }

  if (users.some(u => u.phone === phone)) {
    alert('User already exists!');
    return;
  }

  users.push({ name, phone, password });
  alert('Account created! Please login.');
  showScreen(SCREENS.LOGIN);
});

// ================= GROUP MANAGEMENT =================
let groups = [
  { 
    id: 1, 
    name: 'Family', 
    members: [
      { name: 'Mom', phone: '1111111111' },
      { name: 'Dad', phone: '2222222222' }
    ]
  },
  { 
    id: 2, 
    name: 'Friends', 
    members: [
      { name: 'Alice', phone: '3333333333' }
    ]
  }
];

function loadGroups() {
  const container = document.getElementById('groups-list');
  container.innerHTML = '';
  
  groups.forEach(group => {
    const groupCard = document.createElement('div');
    groupCard.className = 'group-card';
    groupCard.innerHTML = `
      <h3>${group.name}</h3>
      <p>${group.members.length} ${group.members.length === 1 ? 'member' : 'members'}</p>
    `;
    groupCard.addEventListener('click', () => showGroupDetail(group));
    container.appendChild(groupCard);
  });
}

function showGroupDetail(group) {
  currentGroup = group;
  document.getElementById('group-title').textContent = group.name;
  const membersList = document.getElementById('members-list');
  membersList.innerHTML = '';
  
  group.members.forEach(member => {
    const memberItem = document.createElement('div');
    memberItem.className = 'member-item';
    memberItem.innerHTML = `
      <input type="checkbox" id="member-${member.phone}">
      <label for="member-${member.phone}">
        ${member.name} (${member.phone})
      </label>
    `;
    membersList.appendChild(memberItem);
  });
  
  showScreen(SCREENS.GROUP);
}

// ================= MODAL FUNCTIONS =================
// Create Group
document.getElementById('create-group-btn').addEventListener('click', () => {
  document.getElementById('create-group-modal').style.display = 'flex';
  document.getElementById('new-group-name').value = '';
});

document.getElementById('cancel-create').addEventListener('click', () => {
  document.getElementById('create-group-modal').style.display = 'none';
});

document.getElementById('confirm-create').addEventListener('click', () => {
  const name = document.getElementById('new-group-name').value.trim();
  if (!name) return;

  groups.push({
    id: Date.now(),
    name,
    members: []
  });
  
  loadGroups();
  document.getElementById('create-group-modal').style.display = 'none';
});

// Add Member
document.getElementById('add-member-btn').addEventListener('click', () => {
  document.getElementById('add-member-modal').style.display = 'flex';
  document.getElementById('member-name').value = '';
  document.getElementById('member-phone').value = '';
});

document.getElementById('cancel-add').addEventListener('click', () => {
  document.getElementById('add-member-modal').style.display = 'none';
});

document.getElementById('confirm-add').addEventListener('click', () => {
  const name = document.getElementById('member-name').value.trim();
  const phone = document.getElementById('member-phone').value.trim();
  
  if (!name || !phone) return;
  
  currentGroup.members.push({ name, phone });
  showGroupDetail(currentGroup);
  document.getElementById('add-member-modal').style.display = 'none';
});

// Remove Members
document.getElementById('remove-members-btn').addEventListener('click', () => {
  const checkboxes = document.querySelectorAll('#members-list input[type="checkbox"]:checked');
  checkboxes.forEach(checkbox => {
    const phone = checkbox.id.replace('member-', '');
    currentGroup.members = currentGroup.members.filter(m => m.phone !== phone);
  });
  showGroupDetail(currentGroup);
});

// Buzz Functionality
document.getElementById('buzz-selected-btn').addEventListener('click', () => {
  const selected = document.querySelectorAll('#members-list input[type="checkbox"]:checked');
  if (selected.length === 0) {
    alert('Please select members to buzz!');
    return;
  }
  buzzMembers(Array.from(selected).map(el => el.id.replace('member-', '')));
});

document.getElementById('buzz-all-btn').addEventListener('click', () => {
  buzzMembers(currentGroup.members.map(m => m.phone));
});

function buzzMembers(phones) {
  const buzzSound = document.getElementById('buzz-sound');
  buzzSound.play();
  alert(`BUZZING ${phones.length} MEMBERS!`);
  console.log('Buzz sent to:', phones);
}

// ================= NAVIGATION =================
document.getElementById('show-signup').addEventListener('click', (e) => {
  e.preventDefault();
  showScreen(SCREENS.SIGNUP);
});

document.getElementById('show-login').addEventListener('click', (e) => {
  e.preventDefault();
  showScreen(SCREENS.LOGIN);
});

document.getElementById('logout-btn').addEventListener('click', () => {
  currentUser = null;
  showScreen(SCREENS.LOGIN);
});

document.getElementById('back-btn').addEventListener('click', () => {
  showScreen(SCREENS.APP);
});

// Initialize
showScreen(SCREENS.LOGIN);
