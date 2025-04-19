const app = document.getElementById("app");
const socket = io("https://buzzur-server.onrender.com"); // Update if your backend URL is different

let currentUser = null;
let groups = [];

function renderLogin() {
  app.innerHTML = `
    <div class="container">
      <h1 class="banner">BUZZUR</h1>
      <input type="tel" id="login-phone" placeholder="Phone Number">
      <div class="password-wrapper">
        <input type="password" id="login-pass" placeholder="Password">
        <span class="toggle-eye" onclick="togglePassword('login-pass', this)">👁️</span>
      </div>
      <button onclick="login()">Login</button>
      <p>No account? <a href="#" onclick="renderSignup()">Sign up</a></p>
    </div>
  `;
}

function renderSignup() {
  app.innerHTML = `
    <div class="container">
      <h1 class="banner">Sign Up</h1>
      <input type="text" id="signup-name" placeholder="Name">
      <input type="tel" id="signup-phone" placeholder="Phone Number">
      <div class="password-wrapper">
        <input type="password" id="signup-pass" placeholder="Password">
        <span class="toggle-eye" onclick="togglePassword('signup-pass', this)">👁️</span>
      </div>
      <div class="password-wrapper">
        <input type="password" id="signup-confirm" placeholder="Confirm Password">
        <span class="toggle-eye" onclick="togglePassword('signup-confirm', this)">👁️</span>
      </div>
      <button onclick="signup()">Create Account</button>
      <p><a href="#" onclick="renderLogin()">Back to Login</a></p>
    </div>
  `;
}

function renderGroups() {
  let html = `
    <div class="container">
      <h1 class="banner">My Groups</h1>
      <button onclick="createGroup()">+ Create Group</button>
      ${groups
        .map(
          (group, index) => `
        <div class="group">
          <input type="text" value="${group.name}" onchange="editGroupName(${index}, this.value)">
          ${group.members
            .map(
              (member, i) => `
            <div class="member">
              <input type="text" placeholder="Name" value="${member.name}" onchange="updateMember(${index}, ${i}, 'name', this.value)">
              <input type="tel" placeholder="Phone" value="${member.phone}" onchange="updateMember(${index}, ${i}, 'phone', this.value)">
              <button onclick="removeMember(${index}, ${i})">Remove</button>
            </div>`
            )
            .join("")}
          <button onclick="addMember(${index})">+ Add Member</button>
          <div class="controls">
            <button onclick="buzzGroup(${index})">Buzz All</button>
            <button onclick="removeGroup(${index})">Delete Group</button>
          </div>
        </div>
      `
        )
        .join("")}
      <button onclick="logout()" style="margin-top: 20px; background:#ccc; color:#333;">Logout</button>
    </div>
  `;
  app.innerHTML = html;
}

// === Logic Functions ===

function login() {
  const phone = document.getElementById("login-phone").value;
  const pass = document.getElementById("login-pass").value;
  if (!phone || !pass) return alert("Enter phone and password");
  currentUser = phone;
  groups = []; // Load from server later
  renderGroups();
}

function signup() {
  const name = document.getElementById("signup-name").value;
  const phone = document.getElementById("signup-phone").value;
  const pass = document.getElementById("signup-pass").value;
  const confirm = document.getElementById("signup-confirm").value;
  if (!name || !phone || !pass || !confirm) return alert("Fill all fields");
  if (pass !== confirm) return alert("Passwords don't match");
  alert("Signup successful!");
  renderLogin();
}

function logout() {
  currentUser = null;
  groups = [];
  renderLogin();
}

function createGroup() {
  groups.push({ name: "New Group", members: [] });
  renderGroups();
}

function editGroupName(index, name) {
  groups[index].name = name;
}

function addMember(groupIndex) {
  groups[groupIndex].members.push({ name: "", phone: "" });
  renderGroups();
}

function updateMember(groupIndex, memberIndex, field, value) {
  groups[groupIndex].members[memberIndex][field] = value;
}

function removeMember(groupIndex, memberIndex) {
  groups[groupIndex].members.splice(memberIndex, 1);
  renderGroups();
}

function removeGroup(index) {
  groups.splice(index, 1);
  renderGroups();
}

function buzzGroup(index) {
  const group = groups[index];
  const phones = group.members.map(m => m.phone).filter(p => p);
  if (phones.length === 0) return alert("No phone numbers to buzz");

  socket.emit("buzz", phones);
  fetch("https://buzzur-server.onrender.com/send-buzz", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phones })
  });

  const audio = new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg");
  audio.play();
}

// Show/Hide Password
function togglePassword(id, icon) {
  const input = document.getElementById(id);
  if (input.type === "password") {
    input.type = "text";
    icon.textContent = "🙈";
  } else {
    input.type = "password";
    icon.textContent = "👁️";
  }
}

renderLogin();
