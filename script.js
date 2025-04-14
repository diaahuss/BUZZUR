// Entry point
document.addEventListener("DOMContentLoaded", () => {
  renderLogin();
});

// DOM reference
const app = document.getElementById("app");

// View: Login
function renderLogin() {
  app.innerHTML = `
    <form onsubmit="handleLogin(event)">
      <h2>Login</h2>
      <input type="tel" id="loginPhone" placeholder="Phone Number" required />
      <input type="password" id="loginPassword" placeholder="Password" required />
      <button type="submit">Login</button>
      <div class="link-row">
        <a href="#" onclick="renderSignup()">Sign Up</a>
        <a href="#" onclick="renderForgotPassword()">Forgot Password?</a>
      </div>
    </form>
  `;
}

// View: Signup
function renderSignup() {
  app.innerHTML = `
    <form onsubmit="handleSignup(event)">
      <h2>Sign Up</h2>
      <input type="text" id="signupName" placeholder="Name" required />
      <input type="tel" id="signupPhone" placeholder="Phone Number" required />
      <input type="password" id="signupPassword" placeholder="Password" required />
      <input type="password" id="signupConfirmPassword" placeholder="Confirm Password" required />
      <label><input type="checkbox" onclick="togglePasswordVisibility()"> Show Password</label>
      <button type="submit">Sign Up</button>
      <div class="link-row">
        <a href="#" onclick="renderLogin()">Back to Login</a>
      </div>
    </form>
  `;
}

// View: Forgot Password
function renderForgotPassword() {
  app.innerHTML = `
    <form onsubmit="handleForgotPassword(event)">
      <h2>Forgot Password</h2>
      <input type="tel" id="resetPhone" placeholder="Phone Number" required />
      <button type="submit">Reset Password</button>
      <div class="link-row">
        <a href="#" onclick="renderLogin()">Back to Login</a>
      </div>
    </form>
  `;
}

// View: My Groups
function renderGroups() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) return renderLogin();

  const groups = JSON.parse(localStorage.getItem("groups")) || [];
  const userGroups = groups.filter(g => g.owner === user.phone);

  app.innerHTML = `
    <div class="form-box">
      <h2>My Groups</h2>
      <input type="text" id="newGroupName" placeholder="New Group Name" />
      <button onclick="createGroup()">Create Group</button>
    </div>
    <div id="groupList">
      ${userGroups.map(group => `
        <div class="group">
          <h3>${group.name}</h3>
          <button onclick="editGroup('${group.id}')">Edit</button>
          <button onclick="buzzAll('${group.id}')">Buzz All</button>
        </div>
      `).join("")}
    </div>
    <div class="logout-btn" onclick="logout()">Logout</div>
  `;
}

// Handle: Login
function handleLogin(event) {
  event.preventDefault();
  const phone = document.getElementById("loginPhone").value;
  const password = document.getElementById("loginPassword").value;
  const users = JSON.parse(localStorage.getItem("users")) || [];

  const user = users.find(u => u.phone === phone && u.password === password);
  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
    renderGroups();
  } else {
    alert("Invalid credentials.");
  }
}

// Handle: Signup
function handleSignup(event) {
  event.preventDefault();
  const name = document.getElementById("signupName").value;
  const phone = document.getElementById("signupPhone").value;
  const password = document.getElementById("signupPassword").value;
  const confirm = document.getElementById("signupConfirmPassword").value;

  if (password !== confirm) {
    return alert("Passwords do not match.");
  }

  const users = JSON.parse(localStorage.getItem("users")) || [];
  if (users.find(u => u.phone === phone)) {
    return alert("User already exists.");
  }

  const user = { name, phone, password };
  users.push(user);
  localStorage.setItem("users", JSON.stringify(users));
  alert("Sign-up successful. Please login.");
  renderLogin();
}

// Handle: Forgot Password
function handleForgotPassword(event) {
  event.preventDefault();
  const phone = document.getElementById("resetPhone").value;
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find(u => u.phone === phone);
  if (user) {
    alert(`Password: ${user.password}`);
  } else {
    alert("User not found.");
  }
}

// Utility: Toggle password visibility
function togglePasswordVisibility() {
  const pwd = document.getElementById("signupPassword");
  const confirm = document.getElementById("signupConfirmPassword");
  const type = pwd.type === "password" ? "text" : "password";
  pwd.type = type;
  confirm.type = type;
}

// Group logic
function createGroup() {
  const name = document.getElementById("newGroupName").value;
  if (!name) return alert("Enter group name");

  const user = JSON.parse(localStorage.getItem("currentUser"));
  const groups = JSON.parse(localStorage.getItem("groups")) || [];

  const newGroup = {
    id: Date.now().toString(),
    name,
    owner: user.phone,
    members: []
  };

  groups.push(newGroup);
  localStorage.setItem("groups", JSON.stringify(groups));
  renderGroups();
}

function editGroup(groupId) {
  const groups = JSON.parse(localStorage.getItem("groups")) || [];
  const group = groups.find(g => g.id === groupId);
  if (!group) return;

  const newName = prompt("Edit Group Name:", group.name);
  if (newName) {
    group.name = newName;
  }

  const newMember = prompt("Add Member (name, phone):");
  if (newMember) {
    const [name, phone] = newMember.split(",");
    group.members.push({ name: name.trim(), phone: phone.trim() });
  }

  localStorage.setItem("groups", JSON.stringify(groups));
  renderGroups();
}

function buzzAll(groupId) {
  const groups = JSON.parse(localStorage.getItem("groups")) || [];
  const group = groups.find(g => g.id === groupId);
  if (!group) return;

  alert(`Buzz sent to all ${group.members.length} members of ${group.name}!`);
}

// Logout
function logout() {
  localStorage.removeItem("currentUser");
  renderLogin();
}
