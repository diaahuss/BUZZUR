const app = document.getElementById("app");
const socket = io("http://localhost:3000"); // Use localhost during development
let currentUser = null;

function showLogin() {
  app.innerHTML = `
    <div class="banner">BUZZUR</div>
    <div class="container">
      <h2>Login</h2>
      <input type="text" id="loginPhone" placeholder="Phone Number">
      <input type="password" id="loginPassword" placeholder="Password">
      <label><input type="checkbox" id="showLoginPassword"> Show Password</label>
      <button onclick="handleLogin()">Login</button>
      <p><a href="#" onclick="showReset()">Forgot Password?</a> | 
         <a href="#" onclick="showSignup()">Sign Up</a></p>
    </div>
  `;

  document.getElementById("showLoginPassword").addEventListener("change", function () {
    const pwd = document.getElementById("loginPassword");
    pwd.type = this.checked ? "text" : "password";
  });
}

function showSignup() {
  app.innerHTML = `
    <div class="banner">BUZZUR</div>
    <div class="container">
      <h2>Sign Up</h2>
      <input type="text" id="signupName" placeholder="Name">
      <input type="text" id="signupPhone" placeholder="Phone Number">
      <input type="password" id="signupPassword" placeholder="Password">
      <input type="password" id="signupConfirm" placeholder="Confirm Password">
      <label><input type="checkbox" id="showSignupPassword"> Show Password</label>
      <button onclick="handleSignup()">Sign Up</button>
      <p><a href="#" onclick="showLogin()">Back to Login</a></p>
    </div>
  `;

  document.getElementById("showSignupPassword").addEventListener("change", function () {
    const pwd = document.getElementById("signupPassword");
    const confirm = document.getElementById("signupConfirm");
    pwd.type = confirm.type = this.checked ? "text" : "password";
  });
}

function showReset() {
  app.innerHTML = `
    <div class="banner">BUZZUR</div>
    <div class="container">
      <h2>Reset Password</h2>
      <input type="text" id="resetPhone" placeholder="Phone Number">
      <input type="password" id="resetPassword" placeholder="New Password">
      <label><input type="checkbox" id="showResetPassword"> Show Password</label>
      <button onclick="handleReset()">Reset</button>
      <p><a href="#" onclick="showLogin()">Back to Login</a></p>
    </div>
  `;

  document.getElementById("showResetPassword").addEventListener("change", function () {
    const pwd = document.getElementById("resetPassword");
    pwd.type = this.checked ? "text" : "password";
  });
}

async function handleLogin() {
  const phone = document.getElementById("loginPhone").value.trim();
  const password = document.getElementById("loginPassword").value;

const res = await fetch("https://buzzur-server.onrender.com/api/login", { ... });
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, password }),
  });

  const data = await res.json();
  if (res.ok) {
    currentUser = data.user;
    showDashboard();
  } else {
    alert(data.message || "Login failed");
  }
}

async function handleSignup() {
  const name = document.getElementById("signupName").value.trim();
  const phone = document.getElementById("signupPhone").value.trim();
  const password = document.getElementById("signupPassword").value;
  const confirm = document.getElementById("signupConfirm").value;

  if (password !== confirm) {
    alert("Passwords do not match.");
    return;
  }

  const res = await fetch("https://buzzur-server.onrender.com/api/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, phone, password }),
  });

  const data = await res.json();
  if (res.ok) {
    alert("Signup successful! Please log in.");
    showLogin();
  } else {
    alert(data.message || "Signup failed");
  }
}

async function handleReset() {
  const phone = document.getElementById("resetPhone").value.trim();
  const password = document.getElementById("resetPassword").value;

  const res = await fetch("https://buzzur-server.onrender.com/api/reset", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, password }),
  });

  const data = await res.json();
  if (res.ok) {
    alert("Password reset. Please log in.");
    showLogin();
  } else {
    alert(data.message || "Reset failed");
  }
}

async function showDashboard() {
  const res = await fetch(`https://buzzur-server.onrender.com/api/groups?user=${currentUser.phone}`);
  const groups = await res.json();

  app.innerHTML = `
    <div class="banner">My Groups</div>
    <div class="container">
      <button onclick="createGroup()">+ Create Group</button>
      <div id="groups">${groups.map(renderGroup).join("")}</div>
      <button onclick="logout()" style="margin-top:20px;">Logout</button>
    </div>
  `;
}

function renderGroup(group) {
  return `
    <div class="group" data-id="${group.id}">
      <input value="${group.name}" onchange="renameGroup('${group.id}', this.value)">
      <button onclick="deleteGroup('${group.id}')">🗑</button>
      <div class="members">${group.members.map((m, i) => `
        <div>
          <input value="${m.name}" onchange="updateMember('${group.id}', ${i}, 'name', this.value)">
          <input value="${m.phone}" onchange="updateMember('${group.id}', ${i}, 'phone', this.value)">
          <button onclick="removeMember('${group.id}', ${i})">🗑</button>
        </div>`).join("")}
      </div>
      <button onclick="addMember('${group.id}')">+ Add Member</button>
      <button onclick="buzzSelected('${group.id}')">Buzz Selected</button>
      <button onclick="buzzAll('${group.id}')">Buzz All</button>
    </div>
  `;
}

function buzzSelected(groupId) {
  // For now buzz all members
  buzzAll(groupId);
}

function buzzAll(groupId) {
  socket.emit("buzz", { groupId });
  const audio = new Audio("buzz.mp3");
  audio.play();
}

function logout() {
  currentUser = null;
  showLogin();
}

socket.on("buzz", () => {
  const audio = new Audio("buzz.mp3");
  audio.play();
});

showLogin();
