const serverUrl = 'https://buzzur-server.onrender.com'; // Your deployed backend
const socket = io(serverUrl);

const app = document.getElementById('app');

function renderLogin() {
    app.innerHTML = `
        <div class="banner">BUZZUR</div>
        <div class="form">
            <h2>Login</h2>
            <input type="text" id="loginPhone" placeholder="Phone Number">
            <input type="password" id="loginPassword" placeholder="Password">
            <label><input type="checkbox" id="showLoginPassword"> Show Password</label>
            <button onclick="login()">Login</button>
            <p>
                <a href="#" onclick="renderForgotPassword()">Forgot Password?</a> |
                <a href="#" onclick="renderSignup()">Sign Up</a>
            </p>
        </div>
    `;
    setupShowPassword('loginPassword', 'showLoginPassword');
}

function renderSignup() {
    app.innerHTML = `
        <div class="banner">BUZZUR</div>
        <div class="form">
            <h2>Sign Up</h2>
            <input type="text" id="signupName" placeholder="Name">
            <input type="text" id="signupPhone" placeholder="Phone Number">
            <input type="password" id="signupPassword" placeholder="Password">
            <input type="password" id="signupConfirmPassword" placeholder="Confirm Password">
            <label><input type="checkbox" id="showSignupPassword"> Show Password</label>
            <button onclick="signup()">Sign Up</button>
            <p><a href="#" onclick="renderLogin()">Back to Login</a></p>
        </div>
    `;
    setupShowPassword('signupPassword', 'showSignupPassword');
    setupShowPassword('signupConfirmPassword', 'showSignupPassword');
}

function renderForgotPassword() {
    app.innerHTML = `
        <div class="banner">BUZZUR</div>
        <div class="form">
            <h2>Reset Password</h2>
            <input type="text" id="resetPhone" placeholder="Phone Number">
            <input type="password" id="resetNewPassword" placeholder="New Password">
            <label><input type="checkbox" id="showResetPassword"> Show Password</label>
            <button onclick="resetPassword()">Reset Password</button>
            <p><a href="#" onclick="renderLogin()">Back to Login</a></p>
        </div>
    `;
    setupShowPassword('resetNewPassword', 'showResetPassword');
}

function renderDashboard() {
    app.innerHTML = `
        <div class="banner">My Groups</div>
        <div class="groups" id="groups"></div>
        <button onclick="createGroup()">Create Group</button>
        <button onclick="logout()" style="background-color: palegreen; margin-top: 10px;">Logout</button>
    `;
    loadGroups();
}

// Utility Functions

function setupShowPassword(passwordId, checkboxId) {
    const checkbox = document.getElementById(checkboxId);
    checkbox.addEventListener('change', () => {
        const passwordField = document.getElementById(passwordId);
        passwordField.type = checkbox.checked ? 'text' : 'password';
    });
}

function saveUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

function saveGroups(groups) {
    localStorage.setItem('groups', JSON.stringify(groups));
}

function loadGroups() {
    const groups = JSON.parse(localStorage.getItem('groups')) || [];
    const groupsContainer = document.getElementById('groups');
    groupsContainer.innerHTML = '';
    groups.forEach((group, index) => {
        const div = document.createElement('div');
        div.className = 'group';
        div.innerHTML = `
            <input type="text" value="${group.name}" onchange="editGroupName(${index}, this.value)">
            <div id="members-${index}"></div>
            <button onclick="addMember(${index})">Add Member</button>
            <button onclick="buzzAll(${index})">Buzz All</button>
            <button onclick="buzzSelected(${index})">Buzz Selected</button>
            <button onclick="removeGroup(${index})">Remove Group</button>
        `;
        groupsContainer.appendChild(div);
        loadMembers(index);
    });
}

function loadMembers(groupIndex) {
    const groups = JSON.parse(localStorage.getItem('groups')) || [];
    const membersDiv = document.getElementById(`members-${groupIndex}`);
    membersDiv.innerHTML = '';
    groups[groupIndex].members.forEach((member, memberIndex) => {
        const memberDiv = document.createElement('div');
        memberDiv.className = 'member';
        memberDiv.innerHTML = `
            <input type="text" value="${member.name}" onchange="editMemberName(${groupIndex}, ${memberIndex}, this.value)">
            <input type="text" value="${member.phone}" onchange="editMemberPhone(${groupIndex}, ${memberIndex}, this.value)">
            <input type="checkbox" id="select-${groupIndex}-${memberIndex}">
            <button onclick="removeMember(${groupIndex}, ${memberIndex})">Remove</button>
        `;
        membersDiv.appendChild(memberDiv);
    });
}

// Auth Functions

function login() {
    const phone = document.getElementById('loginPhone').value;
    const password = document.getElementById('loginPassword').value;
    const user = JSON.parse(localStorage.getItem(`user-${phone}`));
    if (user && user.password === password) {
        saveUser(user);
        renderDashboard();
    } else {
        alert('Invalid phone number or password');
    }
}

function signup() {
    const name = document.getElementById('signupName').value;
    const phone = document.getElementById('signupPhone').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    const user = { name, phone, password };
    localStorage.setItem(`user-${phone}`, JSON.stringify(user));
    alert('Sign up successful! Please log in.');
    renderLogin();
}

function resetPassword() {
    const phone = document.getElementById('resetPhone').value;
    const newPassword = document.getElementById('resetNewPassword').value;

    const user = JSON.parse(localStorage.getItem(`user-${phone}`));
    if (user) {
        user.password = newPassword;
        localStorage.setItem(`user-${phone}`, JSON.stringify(user));
        alert('Password reset successful! Please log in.');
        renderLogin();
    } else {
        alert('User not found.');
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    renderLogin();
}

// Group & Member Management

function createGroup() {
    const groupName = prompt('Enter group name:');
    if (!groupName) return;
    const groups = JSON.parse(localStorage.getItem('groups')) || [];
    groups.push({ name: groupName, members: [] });
    saveGroups(groups);
    loadGroups();
}

function editGroupName(index, newName) {
    const groups = JSON.parse(localStorage.getItem('groups')) || [];
    groups[index].name = newName;
    saveGroups(groups);
}

function removeGroup(index) {
    const groups = JSON.parse(localStorage.getItem('groups')) || [];
    groups.splice(index, 1);
    saveGroups(groups);
    loadGroups();
}

function addMember(groupIndex) {
    const name = prompt('Member name:');
    const phone = prompt('Member phone number:');
    if (!name || !phone) return;
    const groups = JSON.parse(localStorage.getItem('groups')) || [];
    groups[groupIndex].members.push({ name, phone });
    saveGroups(groups);
    loadMembers(groupIndex);
}

function removeMember(groupIndex, memberIndex) {
    const groups = JSON.parse(localStorage.getItem('groups')) || [];
    groups[groupIndex].members.splice(memberIndex, 1);
    saveGroups(groups);
    loadMembers(groupIndex);
}

function editMemberName(groupIndex, memberIndex, newName) {
    const groups = JSON.parse(localStorage.getItem('groups')) || [];
    groups[groupIndex].members[memberIndex].name = newName;
    saveGroups(groups);
}

function editMemberPhone(groupIndex, memberIndex, newPhone) {
    const groups = JSON.parse(localStorage.getItem('groups')) || [];
    groups[groupIndex].members[memberIndex].phone = newPhone;
    saveGroups(groups);
}

// Buzz Functions

function buzzSelected(groupIndex) {
    const groups = JSON.parse(localStorage.getItem('groups')) || [];
    const selectedPhones = groups[groupIndex].members
        .map((member, memberIndex) => {
            const checkbox = document.getElementById(`select-${groupIndex}-${memberIndex}`);
            return checkbox.checked ? member.phone : null;
        })
        .filter(phone => phone);

    sendBuzz(selectedPhones);
}

function buzzAll(groupIndex) {
    const groups = JSON.parse(localStorage.getItem('groups')) || [];
    const allPhones = groups[groupIndex].members.map(member => member.phone);
    sendBuzz(allPhones);
}

function sendBuzz(phones) {
    const message = 'Buzz from BUZZUR!';
    fetch(`${serverUrl}/send-buzz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phones, message })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Buzz sent:', data);
        socket.emit('buzz', { phones });
    })
    .catch(error => {
        console.error('Error sending buzz:', error);
    });
}

// Initial Load
renderLogin();
