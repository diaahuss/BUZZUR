// Firebase configuration (will be loaded from .env)
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// Socket.IO connection
const socket = io(process.env.SOCKET_SERVER_URL);

// App state
let currentUser = null;
let currentGroup = null;
let groups = [];

// DOM elements
const app = document.getElementById('app');
const buzzSound = document.getElementById('buzzSound');

// View rendering functions
function renderLogin() {
    app.innerHTML = `
        <div class="screen login-screen">
            <div class="banner">BUZZALL</div>
            <div class="form-container">
                <div class="input-group">
                    <label for="phone">Phone Number</label>
                    <input type="tel" id="phone" placeholder="+1234567890" required>
                </div>
                <div class="input-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" placeholder="••••••••" required>
                    <label class="checkbox-container">
                        <input type="checkbox" id="showPassword"> Show password
                    </label>
                </div>
                <button id="loginBtn" class="btn primary">Login</button>
                <div class="links">
                    <a href="#" id="createAccountLink">Create Account</a>
                    <a href="#" id="forgotPasswordLink">Forgot Password?</a>
                </div>
            </div>
        </div>
    `;
    
    // Add event listeners
    document.getElementById('showPassword').addEventListener('change', togglePasswordVisibility);
    document.getElementById('loginBtn').addEventListener('click', handleLogin);
    document.getElementById('createAccountLink').addEventListener('click', renderSignup);
}

function renderSignup() {
    app.innerHTML = `
        <div class="screen signup-screen">
            <div class="banner">SIGN UP</div>
            <div class="form-container">
                <div class="input-group">
                    <label for="fullName">Full Name</label>
                    <input type="text" id="fullName" placeholder="John Doe" required>
                </div>
                <div class="input-group">
                    <label for="phone">Phone Number</label>
                    <input type="tel" id="phone" placeholder="+1234567890" required>
                </div>
                <div class="input-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" placeholder="••••••••" required>
                </div>
                <div class="input-group">
                    <label for="confirmPassword">Confirm Password</label>
                    <input type="password" id="confirmPassword" placeholder="••••••••" required>
                    <label class="checkbox-container">
                        <input type="checkbox" id="showPassword"> Show password
                    </label>
                </div>
                <button id="signupBtn" class="btn primary">Sign Up</button>
                <div class="links">
                    <a href="#" id="loginLink">Already have an account? Login</a>
                </div>
            </div>
        </div>
    `;
    
    // Add event listeners
    document.getElementById('showPassword').addEventListener('change', togglePasswordVisibility);
    document.getElementById('signupBtn').addEventListener('click', handleSignup);
    document.getElementById('loginLink').addEventListener('click', renderLogin);
}

function renderMyGroups() {
    app.innerHTML = `
        <div class="screen my-groups-screen">
            <div class="banner">MY GROUPS</div>
            <div class="group-list" id="groupList">
                ${groups.map(group => `
                    <div class="group-item" data-group-id="${group.id}">
                        <div class="group-info">
                            <h3>${group.name}</h3>
                            <span class="member-count">${group.memberCount}</span>
                        </div>
                        <i class="fas fa-chevron-right"></i>
                    </div>
                `).join('')}
            </div>
            <div class="action-buttons">
                <button id="createGroupBtn" class="btn primary">➕ Create Group</button>
                <button id="removeGroupBtn" class="btn danger">🗑️ Remove Group</button>
                <button id="logoutBtn" class="btn secondary">🚪 Logout</button>
            </div>
        </div>
    `;
    
    // Add event listeners
    document.getElementById('createGroupBtn').addEventListener('click', showCreateGroupModal);
    document.getElementById('removeGroupBtn').addEventListener('click', handleRemoveGroup);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // Add click handlers for each group
    document.querySelectorAll('.group-item').forEach(item => {
        item.addEventListener('click', () => renderGroupDetail(item.dataset.groupId));
    });
}

function renderGroupDetail(groupId) {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;
    
    currentGroup = group;
    
    app.innerHTML = `
        <div class="screen group-detail-screen">
            <div class="banner">${group.name}</div>
            <div class="member-list" id="memberList">
                ${group.members.map(member => `
                    <div class="member-item" data-member-id="${member.id}">
                        <input type="checkbox" id="member-${member.id}" class="member-checkbox">
                        <label for="member-${member.id}">
                            <span class="member-name">${member.name}</span>
                            <span class="member-phone">${member.phone}</span>
                        </label>
                    </div>
                `).join('')}
            </div>
            <div class="action-buttons">
                <button id="addMemberBtn" class="btn primary">➕ Add Member</button>
                <button id="removeMemberBtn" class="btn danger">🗑️ Remove Selected</button>
                <button id="editGroupNameBtn" class="btn secondary">✏️ Edit Group Name</button>
                <button id="buzzSelectedBtn" class="btn accent">🔔 Buzz Selected</button>
                <button id="buzzAllBtn" class="btn accent">🔔 Buzz Entire Group</button>
                <button id="backBtn" class="btn secondary">⬅️ Back</button>
            </div>
        </div>
    `;
    
    // Add event listeners
    document.getElementById('addMemberBtn').addEventListener('click', showAddMemberModal);
    document.getElementById('removeMemberBtn').addEventListener('click', handleRemoveMembers);
    document.getElementById('editGroupNameBtn').addEventListener('click', showEditGroupNameModal);
    document.getElementById('buzzSelectedBtn').addEventListener('click', handleBuzzSelected);
    document.getElementById('buzzAllBtn').addEventListener('click', handleBuzzAll);
    document.getElementById('backBtn').addEventListener('click', renderMyGroups);
}

// Modal functions
function showCreateGroupModal() {
    // Modal implementation
}

function showAddMemberModal() {
    // Modal implementation
}

function showEditGroupNameModal() {
    // Modal implementation
}

// Event handlers
function handleLogin() {
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    
    // Firebase authentication
    auth.signInWithEmailAndPassword(phone + '@buzzall.com', password)
        .then((userCredential) => {
            currentUser = userCredential.user;
            loadUserGroups();
        })
        .catch((error) => {
            showError(error.message);
        });
}

function handleSignup() {
    const fullName = document.getElementById('fullName').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        showError("Passwords don't match");
        return;
    }
    
    // Firebase authentication
    auth.createUserWithEmailAndPassword(phone + '@buzzall.com', password)
        .then((userCredential) => {
            currentUser = userCredential.user;
            
            // Save additional user data
            return database.ref('users/' + currentUser.uid).set({
                fullName: fullName,
                phone: phone
            });
        })
        .then(() => {
            renderLogin();
            showSuccess("Account created successfully! Please login.");
        })
        .catch((error) => {
            showError(error.message);
        });
}

function handleLogout() {
    auth.signOut().then(() => {
        currentUser = null;
        groups = [];
        renderLogin();
    });
}

function handleBuzzSelected() {
    const selectedMembers = Array.from(document.querySelectorAll('.member-checkbox:checked'))
                                .map(checkbox => checkbox.id.replace('member-', ''));
    
    if (selectedMembers.length === 0) {
        showError("Please select at least one member to buzz");
        return;
    }
    
    // Play buzz sound locally
    buzzSound.play();
    
    // Send buzz notifications via Socket.IO and Twilio
    socket.emit('buzz-members', {
        groupId: currentGroup.id,
        memberIds: selectedMembers
    });
    
    showSuccess(`Buzz sent to ${selectedMembers.length} members!`);
}

function handleBuzzAll() {
    // Play buzz sound locally
    buzzSound.play();
    
    // Send buzz to all group members
    socket.emit('buzz-group', {
        groupId: currentGroup.id
    });
    
    showSuccess(`Buzz sent to entire group!`);
}

// Helper functions
function togglePasswordVisibility() {
    const passwordFields = document.querySelectorAll('input[type="password"]');
    const showPassword = document.getElementById('showPassword').checked;
    
    passwordFields.forEach(field => {
        field.type = showPassword ? 'text' : 'password';
    });
}

function loadUserGroups() {
    // Load groups from Firebase
    database.ref('userGroups/' + currentUser.uid).once('value')
        .then((snapshot) => {
            groups = snapshot.val() || [];
            renderMyGroups();
        });
}

function showError(message) {
    // Show error message to user
}

function showSuccess(message) {
    // Show success message to user
}

// Initialize app
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        loadUserGroups();
    } else {
        renderLogin();
    }
});

// Socket.IO event listeners
socket.on('buzz-received', () => {
    buzzSound.play();
    showAlert("You've been buzzed!");
});

// Start the app
renderLogin();
