// script.js

// Socket.IO connection
const socket = io();

// Main render container
const app = document.getElementById("app");

// Entry point: show login on load
renderLogin();

// Utility functions
function clearApp() {
  app.innerHTML = "";
}

function createInput(type, placeholder, value = "") {
  const input = document.createElement("input");
  input.type = type;
  input.placeholder = placeholder;
  input.value = value;
  return input;
}

function createButton(text, onClick) {
  const button = document.createElement("button");
  button.textContent = text;
  button.onclick = onClick;
  return button;
}

function createMemberInput(name = "", phone = "") {
  const memberDiv = document.createElement("div");
  memberDiv.className = "member-input";

  const nameInput = createInput("text", "Name", name);
  const phoneInput = createInput("text", "Phone", phone);

  memberDiv.appendChild(nameInput);
  memberDiv.appendChild(phoneInput);

  return memberDiv;
}

// Render login screen
function renderLogin() {
  clearApp();

  const container = document.createElement("div");
  container.className = "container";

  const banner = document.createElement("div");
  banner.className = "banner";
  banner.textContent = "BUZZUR - Login";

  const phoneInput = createInput("text", "Phone Number");
  const passwordInput = createInput("password", "Password");

  const loginBtn = createButton("Login", () => {
    const phone = phoneInput.value;
    const password = passwordInput.value;
    // Handle login logic here (Firebase/localStorage/etc.)
    if (phone && password) {
      localStorage.setItem("currentUser", phone);
      renderMyGroups();
    }
  });

  const signupLink = document.createElement("a");
  signupLink.href = "#";
  signupLink.textContent = "Sign Up";
  signupLink.onclick = (e) => {
    e.preventDefault();
    renderSignup();
  };

  const forgotLink = document.createElement("a");
  forgotLink.href = "#";
  forgotLink.textContent = "Forgot Password?";
  forgotLink.onclick = (e) => {
    e.preventDefault();
    renderForgotPassword();
  };

  const linkRow = document.createElement("div");
  linkRow.className = "link-row";
  linkRow.appendChild(forgotLink);
  linkRow.appendChild(signupLink);

  container.append(banner, phoneInput, passwordInput, loginBtn, linkRow);
  app.appendChild(container);
}

// Render signup screen
function renderSignup() {
  clearApp();

  const container = document.createElement("div");
  container.className = "container";

  const banner = document.createElement("div");
  banner.className = "banner";
  banner.textContent = "BUZZUR - Sign Up";

  const nameInput = createInput("text", "Name");
  const phoneInput = createInput("text", "Phone Number");
  const passwordInput = createInput("password", "Password");
  const confirmPasswordInput = createInput("password", "Confirm Password");

  const signupBtn = createButton("Sign Up", () => {
    // Sign up logic here
    renderLogin();
  });

  container.append(banner, nameInput, phoneInput, passwordInput, confirmPasswordInput, signupBtn);
  app.appendChild(container);
}

// Render forgot password screen
function renderForgotPassword() {
  clearApp();

  const container = document.createElement("div");
  container.className = "container";

  const banner = document.createElement("div");
  banner.className = "banner";
  banner.textContent = "Reset Password";

  const phoneInput = createInput("text", "Phone Number");
  const resetBtn = createButton("Reset Password", () => {
    alert("Password reset link sent!");
    renderLogin();
  });

  container.append(banner, phoneInput, resetBtn);
  app.appendChild(container);
}

// Render main dashboard (My Groups)
function renderMyGroups() {
  clearApp();

  const container = document.createElement("div");
  container.className = "container";

  const banner = document.createElement("div");
  banner.className = "banner";
  banner.textContent = "My Groups";

  const createGroupBtn = createButton("Create Group", () => {
    const groupName = prompt("Enter group name:");
    if (groupName) addGroup(groupName);
  });

  const logoutBtn = createButton("Logout", () => {
    localStorage.removeItem("currentUser");
    renderLogin();
  });
  logoutBtn.style.marginTop = "20px";

  const groupList = document.createElement("div");
  groupList.id = "group-list";

  container.append(banner, createGroupBtn, groupList, logoutBtn);
  app.appendChild(container);

  loadGroups();
}

// Add a new group to local storage
function addGroup(name) {
  const groups = JSON.parse(localStorage.getItem("groups") || "[]");
  const newGroup = { name, members: [] };
  groups.push(newGroup);
  localStorage.setItem("groups", JSON.stringify(groups));
  loadGroups();
}

// Load groups into the UI
function loadGroups() {
  const list = document.getElementById("group-list");
  list.innerHTML = "";
  const groups = JSON.parse(localStorage.getItem("groups") || "[]");

  groups.forEach((group, index) => {
    const section = document.createElement("div");
    section.className = "group-section";

    const title = document.createElement("h3");
    title.textContent = group.name;

    const renameBtn = createButton("Rename", () => {
      const newName = prompt("New group name:", group.name);
      if (newName) {
        group.name = newName;
        saveGroups(groups);
        loadGroups();
      }
    });

    const removeBtn = createButton("Remove", () => {
      if (confirm("Are you sure?")) {
        groups.splice(index, 1);
        saveGroups(groups);
        loadGroups();
      }
    });

    const memberList = document.createElement("div");
    memberList.id = `group-${index}-members`;

    group.members.forEach((member) => {
      const memberInput = createMemberInput(member.name, member.phone);
      memberList.appendChild(memberInput);
    });

    const addMemberBtn = createButton("Add Member", () => {
      const newMember = createMemberInput();
      memberList.appendChild(newMember);
    });

    const buzzAllBtn = createButton("Buzz All", () => {
      const members = [...memberList.querySelectorAll(".member-input")].map(m => ({
        name: m.children[0].value,
        phone: m.children[1].value
      }));
      socket.emit("buzz", { group: group.name, members });
      alert("Buzzed!");
    });

    section.append(title, renameBtn, removeBtn, memberList, addMemberBtn, buzzAllBtn);
    list.appendChild(section);
  });
}

// Save groups to local storage
function saveGroups(groups) {
  localStorage.setItem("groups", JSON.stringify(groups));
}
