const socket = io("https://buzzur-server.onrender.com"); // Your deployed backend

let currentUser = JSON.parse(localStorage.getItem("user")) || null;
let groups = JSON.parse(localStorage.getItem("groups")) || [];

function saveState() {
  localStorage.setItem("user", JSON.stringify(currentUser));
  localStorage.setItem("groups", JSON.stringify(groups));
}

function renderApp() {
  const app = document.getElementById("app");
  app.innerHTML = "";

  if (!currentUser) {
    renderLogin();
  } else {
    renderGroups();
  }
}

function renderLogin() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="banner">BUZZUR</div>
    <div class="form-container">
      <h2>Login</h2>
      <input type="text" id="phone" placeholder="Phone Number" />
      <input type="password" id="password" placeholder="Password" />
      <button onclick="login()">Login</button>
      <p>No account? <a href="#" onclick="renderSignup()">Sign up</a></p>
    </div>
  `;
}

function renderSignup() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="banner">BUZZUR</div>
    <div class="form-container">
      <h2>Sign Up</h2>
      <input type="text" id="name" placeholder="Full Name" />
      <input type="text" id="phone" placeholder="Phone Number" />
      <input type="password" id="password" placeholder="Password" />
      <button onclick="signup()">Sign Up</button>
      <p>Already have an account? <a href="#" onclick="renderLogin()">Login</a></p>
    </div>
  `;
}

function login() {
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!phone || !password) return alert("Please enter phone and password");

  const userData = JSON.parse(localStorage.getItem(`user-${phone}`));
  if (!userData || userData.password !== password) {
    return alert("Invalid credentials");
  }

  currentUser = { name: userData.name, phone };
  saveState();
  renderApp();
}

function signup() {
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!name || !phone || !password) {
    return alert("All fields are required.");
  }

  if (localStorage.getItem(`user-${phone}`)) {
    return alert("User already exists.");
  }

  localStorage.setItem(`user-${phone}`, JSON.stringify({ name, password }));
  currentUser = { name, phone };
  saveState();
  renderApp();
}

function renderGroups() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="banner">BUZZUR</div>
    <div class="content">
      <h2>Welcome, ${currentUser.name}</h2>
      <div class="group-list">
        ${groups.map((group, i) => `
          <div class="group">
            <h3 contenteditable="true" onblur="renameGroup(${i}, this.textContent)">${group.name}</h3>
            <ul>
              ${group.members.map((m, j) => `
                <li>${m.name} (${m.phone}) 
                  <button onclick="removeMember(${i}, ${j})">❌</button>
                </li>
              `).join("")}
            </ul>
            <input placeholder="Member Name" id="member-name-${i}" />
            <input placeholder="Member Phone" id="member-phone-${i}" />
            <button onclick="addMember(${i})">Add Member</button>
            <button onclick="buzzGroup(${i})">BUZZ</button>
            <button onclick="deleteGroup(${i})">Delete Group</button>
          </div>
        `).join("")}
      </div>
      <input placeholder="New Group Name" id="new-group-name" />
      <button onclick="addGroup()">Create Group</button>
      <button class="logout" onclick="logout()">Logout</button>
    </div>
  `;
}

function addGroup() {
  const name = document.getElementById("new-group-name").value.trim();
  if (!name) return alert("Group name required.");
  groups.push({ name, members: [] });
  saveState();
  renderApp();
}

function renameGroup(index, newName) {
  groups[index].name = newName.trim();
  saveState();
}

function deleteGroup(index) {
  if (confirm("Are you sure you want to delete this group?")) {
    groups.splice(index, 1);
    saveState();
    renderApp();
  }
}

function addMember(groupIndex) {
  const name = document.getElementById(`member-name-${groupIndex}`).value.trim();
  const phone = document.getElementById(`member-phone-${groupIndex}`).value.trim();

  if (!name || !phone) return alert("Enter member name and phone.");
  groups[groupIndex].members.push({ name, phone });
  saveState();
  renderApp();
}

function removeMember(groupIndex, memberIndex) {
  groups[groupIndex].members.splice(memberIndex, 1);
  saveState();
  renderApp();
}

function buzzGroup(groupIndex) {
  const group = groups[groupIndex];
  if (group.members.length === 0) return alert("No members to buzz.");
  socket.emit("buzz");
  alert(`Buzzed all members in ${group.name}`);
}

function logout() {
  currentUser = null;
  saveState();
  renderApp();
}

socket.on("buzz", () => {
  alert("🔔 BUZZ! You have received an alert!");
});

window.onload = renderApp;
