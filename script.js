// Screen Management
const SCREENS = {
  LOGIN: 'login-screen',
  SIGNUP: 'signup-screen',
  APP: 'app-screen',
  GROUP: 'group-screen'
};

let currentUser = null;
let currentGroup = null;
let groups = [];

// Initialize app
function initApp() {
  setupEventListeners();
  showScreen(SCREENS.LOGIN);
  
  // Load test data
  groups = [
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
}

// Screen navigation
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  document.getElementById(screenId).classList.add('active');
}

// Event listeners setup
function setupEventListeners() {
  // Auth navigation
  document.getElementById('show-signup').addEventListener('click', (e) => {
    e.preventDefault();
    showScreen(SCREENS.SIGNUP);
  });
  
  document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault();
    showScreen(SCREENS.LOGIN);
  });

  // Login functionality
  document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const phone = document.getElementById('login-phone').value;
    const password = document.getElementById('login-password').value;
    
    // Mock authentication
    if (phone && password) {
      currentUser = { phone, name: "Test User" };
      showScreen(SCREENS.APP);
      loadGroups();
    } else {
      alert('Please enter both phone and password');
    }
  });

  // Signup functionality
  document.getElementById('signup-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const phone = document.getElementById('signup-phone').value;
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;
    
    if (password !== confirm) {
      alert("Passwords don't match!");
      return;
    }
    
    alert('Account created! Please login.');
    showScreen(SCREENS.LOGIN);
  });

  // Password visibility toggle
  document.querySelectorAll('.toggle-password').forEach(icon => {
    icon.addEventListener('click', function() {
      const input = this.previousElementSibling;
      const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
      input.setAttribute('type', type);
      this.classList.toggle('fa-eye-slash');
    });
  });

  // Group management
  document.getElementById('create-group-btn').addEventListener('click', () => {
    document.getElementById('create-group-modal').style.display = 'flex';
  });

  document.getElementById('confirm-create').addEventListener('click', () => {
    const name = document.getElementById('new-group-name').value.trim();
    if (name) {
      groups.push({
        id: Date.now(),
        name,
        members: []
      });
      loadGroups();
      document.getElementById('create-group-modal').style.display = 'none';
    }
  });

  document.getElementById('cancel-create').addEventListener('click', () => {
    document.getElementById('create-group-modal').style.display = 'none';
  });

  // Member management
  document.getElementById('add-member-btn').addEventListener('click', () => {
    document.getElementById('add-member-modal').style.display = 'flex';
  });

  document.getElementById('confirm-add').addEventListener('click', () => {
    const name = document.getElementById('member-name').value.trim();
    const phone = document.getElementById('member-phone').value.trim();
    
    if (name && phone) {
      if (!currentGroup.members.some(m => m.phone === phone)) {
        currentGroup.members.push({ name, phone });
        renderMembersList();
        document.getElementById('add-member-modal').style.display = 'none';
      } else {
        alert('Member already exists!');
      }
    }
  });

  document.getElementById('cancel-add').addEventListener('click', () => {
    document.getElementById('add-member-modal').style.display = 'none';
  });

  document.getElementById('remove-members-btn').addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('#members-list input[type="checkbox"]:checked');
    if (checkboxes.length > 0) {
      checkboxes.forEach(checkbox => {
        const phone = checkbox.id.replace('member-', '');
        currentGroup.members = currentGroup.members.filter(m => m.phone !== phone);
      });
      renderMembersList();
    } else {
      alert('Please select members to remove');
    }
  });

  // Buzz functionality
  document.getElementById('buzz-selected-btn').addEventListener('click', () => {
    const selected = document.querySelectorAll('#members-list input[type="checkbox"]:checked');
    if (selected.length > 0) {
      buzzMembers(Array.from(selected).map(el => el.id.replace('member-', '')));
    } else {
      alert('Please select members to buzz');
    }
  });

  document.getElementById('buzz-all-btn').addEventListener('click', () => {
    buzzMembers(currentGroup.members.map(m => m.phone));
  });

  // Navigation
  document.getElementById('back-btn').addEventListener('click', () => {
    showScreen(SCREENS.APP);
  });

  document.getElementById('logout-btn').addEventListener('click', () => {
    currentUser = null;
    showScreen(SCREENS.LOGIN);
  });
}

// Load groups list
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

// Show group details
function showGroupDetail(group) {
  currentGroup = group;
  document.getElementById('group-title').textContent = group.name;
  renderMembersList();
  showScreen(SCREENS.GROUP);
}

// Render members list
function renderMembersList() {
  const container = document.getElementById('members-list');
  container.innerHTML = '';
  
  currentGroup.members.forEach(member => {
    const memberItem = document.createElement('div');
    memberItem.className = 'member-item';
    memberItem.innerHTML = `
      <input type="checkbox" id="member-${member.phone}">
      <label for="member-${member.phone}">
        <span class="member-name">${member.name}</span>
        <span class="member-phone">${member.phone}</span>
      </label>
    `;
    container.appendChild(memberItem);
  });
}

// Buzz members
function buzzMembers(phones) {
  const buzzSound = document.getElementById('buzz-sound');
  buzzSound.play();
  alert(`BUZZ sent to ${phones.length} members!`);
}

// Start the app
initApp();
