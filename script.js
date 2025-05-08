<<<<<<< HEAD
const app = document.getElementById('app');
const banner = document.getElementById('banner');

let currentUser = null;
let users = JSON.parse(localStorage.getItem('users') || '{}');

function saveUsers() {
  localStorage.setItem('users', JSON.stringify(users));
}

function togglePassword(id) {
  const input = document.getElementById(id);
  input.type = input.type === 'password' ? 'text' : 'password';
}

function showLogin() {
  banner.textContent = 'BUZU';
  app.innerHTML = `
    <h2>Login</h2>
    <div class="input-wrapper">
      <input id="loginPhone" placeholder="Phone Number">
    </div>
    <div class="input-wrapper">
      <input type="password" id="loginPass" placeholder="Password">
      <span class="eye-icon" onclick="togglePassword('loginPass')">👁️</span>
    </div>
    <button onclick="handleLogin()">Login</button>
    <p><a href="#" onclick="showSignup()">Sign Up</a></p>
  `;
}

function showSignup() {
  banner.textContent = 'BUZU';
  app.innerHTML = `
    <h2>Sign Up</h2>
    <input id="signupName" placeholder="Name">
    <input id="signupPhone" placeholder="Phone Number">
    <div class="input-wrapper">
      <input type="password" id="signupPass" placeholder="Password">
      <span class="eye-icon" onclick="togglePassword('signupPass')">👁️</span>
    </div>
    <div class="input-wrapper">
      <input type="password" id="signupConfirm" placeholder="Confirm Password">
      <span class="eye-icon" onclick="togglePassword('signupConfirm')">👁️</span>
    </div>
    <button onclick="handleSignup()">Sign Up</button>
    <p><a href="#" onclick="showLogin()">Back to Login</a></p>
  `;
}

function handleSignup() {
  const name = document.getElementById('signupName').value;
  const phone = document.getElementById('signupPhone').value;
  const pass = document.getElementById('signupPass').value;
  const confirm = document.getElementById('signupConfirm').value;

  if (users[phone]) return alert('User already exists');
  if (pass !== confirm) return alert('Passwords do not match');

  users[phone] = { name, phone, pass, groups: [] };
  saveUsers();
  alert('Signed up!');
  showLogin();
}

function handleLogin() {
  const phone = document.getElementById('loginPhone').value;
  const pass = document.getElementById('loginPass').value;

  const user = users[phone];
  if (!user || user.pass !== pass) return alert('Invalid login');

  currentUser = user;
  showDashboard();
}

function showDashboard() {
  banner.textContent = `Welcome, ${currentUser.name}`;
  app.innerHTML = `
    <button onclick="createGroup()">Create Group</button>
    <div id="groupList">${renderGroups()}</div>
    <button onclick="logout()">Logout</button>
  `;
}

function renderGroups() {
  return currentUser.groups.map((g, i) => `
    <div>
      <strong>${g.name}</strong>
      <button onclick="openGroup(${i})">Open</button>
    </div>
  `).join('');
}

function createGroup() {
  const name = prompt('Group name?');
  if (!name) return;
  currentUser.groups.push({ name, members: [] });
  saveUsers();
  showDashboard();
}

function openGroup(index) {
  const group = currentUser.groups[index];
  banner.textContent = `Group: ${group.name}`;
  app.innerHTML = `
    <button onclick="editGroupName(${index})">Edit Group Name</button>
    <button onclick="addMember(${index})">Add Member</button>
    <button onclick="buzzAll(${index})">Buzz All</button>
    <div>${group.members.map((m, i) => `
      <div>
        ${m.name} (${m.phone})
        <button onclick="removeMember(${index}, ${i})">Remove</button>
      </div>
    `).join('')}</div>
    <button onclick="showDashboard()">Back to Groups</button>
  `;
}

function editGroupName(index) {
  const newName = prompt('New group name?');
  if (newName) {
    currentUser.groups[index].name = newName;
    saveUsers();
    openGroup(index);
  }
}

function addMember(index) {
  const name = prompt('Member name?');
  const phone = prompt('Member phone?');
  if (name && phone) {
    currentUser.groups[index].members.push({ name, phone });
    saveUsers();
    openGroup(index);
  }
}

function removeMember(groupIdx, memberIdx) {
  currentUser.groups[groupIdx].members.splice(memberIdx, 1);
  saveUsers();
  openGroup(groupIdx);
}

function buzzAll(index) {
  const sound = document.getElementById('buzz-sound');
  sound.play();
  alert(`Buzz sent to ${currentUser.groups[index].members.length} members!`);
}

function logout() {
  currentUser = null;
  showLogin();
}

showLogin();
=======
const appState = {
    currentUser: null,
    currentGroup: null,
    groups: [
        {
            id: '1',
            name: 'Family',
            members: [
                { id: '1', name: 'Mom', phone: '+1234567891' },
                { id: '2', name: 'Dad', phone: '+1234567892' }
            ]
        }
    ]
};

const elements = {
    app: document.getElementById('app'),
    buzzSound: document.getElementById('buzzSound')
};

// Initialize the app
function init() {
    renderLoginScreen();
    setupEventListeners();
}

// Render the login screen with all required elements
function renderLoginScreen() {
    elements.app.innerHTML = `
        <div class="screen">
            <div class="banner">BUZZALL</div>
            <div class="form-container">
                <form id="loginForm">
                    <div class="input-group">
                        <label for="phone">Phone Number</label>
                        <input type="tel" id="phone" placeholder="+1234567890" required>
                    </div>
                    <div class="input-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" placeholder="••••••••" required>
                    </div>
                    <button type="submit" id="loginBtn" class="btn primary">Login</button>
                    <div class="links">
                        <a href="#" id="signUpLink">Sign Up</a>
                        <span>•</span>
                        <a href="#" id="forgotPasswordLink">Forgot Password</a>
                    </div>
                </form>
            </div>
        </div>
    `;
}

// Render the groups screen with list of groups and action buttons
function renderGroupsScreen() {
    elements.app.innerHTML = `
        <div class="screen">
            <div class="banner">MY GROUPS</div>
            <div class="group-list">
                ${appState.groups.map(group => `
                    <div class="group-item" data-group-id="${group.id}">
                        <div class="group-info">
                            <h3>${group.name}</h3>
                            <span>${group.members.length} members</span>
                        </div>
                        <i class="fas fa-chevron-right"></i>
                    </div>
                `).join('')}
            </div>
            <div class="action-buttons">
                <button id="createGroupBtn" class="btn primary">Create Group</button>
                <button id="logoutBtn" class="btn secondary">Logout</button>
            </div>
        </div>
    `;
}

// Render the group detail screen with all requested buttons
function renderGroupDetailScreen(groupId) {
    const group = appState.groups.find(g => g.id === groupId);
    if (!group) return;

    appState.currentGroup = group;

    elements.app.innerHTML = `
        <div class="screen">
            <div class="screen-header">
                <button class="back-button" id="backToGroups">
                    <i class="fas fa-arrow-left"></i>
                </button>
                <h2>${group.name}</h2>
            </div>
            <div class="group-actions">
                <button id="membersBtn" class="btn action">Members</button>
                <button id="editGroupBtn" class="btn action">Edit Group</button>
                <button id="removeGroupBtn" class="btn action danger">Remove Group</button>
                <button id="buzzSelectedBtn" class="btn action accent">Buzz Selected</button>
                <button id="buzzAllBtn" class="btn action accent">Buzz All</button>
            </div>
        </div>
    `;
}

// Render the members screen for a group
function renderMembersScreen() {
    const group = appState.currentGroup;
    if (!group) return;

    elements.app.innerHTML = `
        <div class="screen">
            <div class="screen-header">
                <button class="back-button" id="backToGroup">
                    <i class="fas fa-arrow-left"></i>
                </button>
                <h2>${group.name} Members</h2>
            </div>
            <div class="member-list">
                ${group.members.map(member => `
                    <div class="member-item" data-member-id="${member.id}">
                        <div class="member-info">
                            <div class="member-name">${member.name}</div>
                            <div class="member-phone">${member.phone}</div>
                        </div>
                        <i class="fas fa-times remove-member"></i>
                    </div>
                `).join('')}
            </div>
            <div class="action-buttons">
                <button id="addMemberBtn" class="btn primary">Add Member</button>
                <button id="backToGroupBtn" class="btn secondary">Back to Group</button>
            </div>
        </div>
    `;
}

// Set up all event listeners
function setupEventListeners() {
    // Login form submission
    document.addEventListener('submit', (e) => {
        if (e.target.id === 'loginForm') {
            e.preventDefault();
            const phone = document.getElementById('phone').value;
            const password = document.getElementById('password').value;
            
            // Basic validation
            if (phone && password) {
                appState.currentUser = { phone, name: "User" };
                renderGroupsScreen();
            }
        }
    });

    // General click handlers
    document.addEventListener('click', (e) => {
        // Sign Up link
        if (e.target.id === 'signUpLink') {
            e.preventDefault();
            alert('Sign up functionality coming soon!');
        }
        
        // Forgot Password link
        if (e.target.id === 'forgotPasswordLink') {
            e.preventDefault();
            alert('Password reset functionality coming soon!');
        }
        
        // Logout
        if (e.target.id === 'logoutBtn') {
            appState.currentUser = null;
            renderLoginScreen();
        }
        
        // Create Group
        if (e.target.id === 'createGroupBtn') {
            const name = prompt('Enter group name:');
            if (name) {
                const newGroup = {
                    id: Date.now().toString(),
                    name,
                    members: []
                };
                appState.groups.push(newGroup);
                renderGroupsScreen();
            }
        }
        
        // View Group
        if (e.target.closest('.group-item')) {
            const groupId = e.target.closest('.group-item').dataset.groupId;
            renderGroupDetailScreen(groupId);
        }
        
        // Back to Groups
        if (e.target.closest('#backToGroups')) {
            renderGroupsScreen();
        }
        
        // Members button
        if (e.target.id === 'membersBtn') {
            renderMembersScreen();
        }
        
        // Edit Group
        if (e.target.id === 'editGroupBtn') {
            const newName = prompt('Enter new group name:', appState.currentGroup.name);
            if (newName) {
                appState.currentGroup.name = newName;
                renderGroupDetailScreen(appState.currentGroup.id);
            }
        }
        
        // Remove Group
        if (e.target.id === 'removeGroupBtn') {
            if (confirm('Are you sure you want to remove this group?')) {
                appState.groups = appState.groups.filter(g => g.id !== appState.currentGroup.id);
                renderGroupsScreen();
            }
        }
        
        // Buzz Selected
        if (e.target.id === 'buzzSelectedBtn') {
            elements.buzzSound.play();
            alert('Buzz sent to selected members!');
        }
        
        // Buzz All
        if (e.target.id === 'buzzAllBtn') {
            elements.buzzSound.play();
            alert('Buzz sent to all members!');
        }
        
        // Back to Group from Members view
        if (e.target.closest('#backToGroup') || e.target.id === 'backToGroupBtn') {
            renderGroupDetailScreen(appState.currentGroup.id);
        }
        
        // Add Member
        if (e.target.id === 'addMemberBtn') {
            const name = prompt('Enter member name:');
            const phone = prompt('Enter member phone number:');
            if (name && phone) {
                appState.currentGroup.members.push({
                    id: Date.now().toString(),
                    name,
                    phone
                });
                renderMembersScreen();
            }
        }
        
        // Remove Member
        if (e.target.closest('.remove-member')) {
            const memberItem = e.target.closest('.member-item');
            const memberId = memberItem.dataset.memberId;
            
            if (confirm('Remove this member from the group?')) {
                appState.currentGroup.members = appState.currentGroup.members.filter(
                    m => m.id !== memberId
                );
                renderMembersScreen();
            }
        }
    });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
>>>>>>> c07a09301e073e5ec273423c094fe5c79222bfbb
