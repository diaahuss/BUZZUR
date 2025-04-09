let currentUser = null;
let groups = [];

// Show the login page
function showLoginPage() {
  document.getElementById("loginPage").style.display = "block";
  document.getElementById("signupPage").style.display = "none";
  document.getElementById("myGroupsPage").style.display = "none";
  document.getElementById("forgotPasswordDialog").style.display = "none";
}

// Show the sign-up page
function showSignupPage() {
  document.getElementById("loginPage").style.display = "none";
  document.getElementById("signupPage").style.display = "block";
  document.getElementById("myGroupsPage").style.display = "none";
  document.getElementById("forgotPasswordDialog").style.display = "none";
}

// Show My Groups page
function showMyGroupsPage() {
  document.getElementById("loginPage").style.display = "none";
  document.getElementById("signupPage").style.display = "none";
  document.getElementById("myGroupsPage").style.display = "block";
  renderGroups();
}

// Function for Login
function login() {
  const phone = document.getElementById("loginPhone").value;
  const password = document.getElementById("loginPassword").value;
  if (!phone || !password) {
    alert("Please enter both phone and password");
    return;
  }
  currentUser = { phone, password };
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  showMyGroupsPage();
}

// Function for Sign-Up
function signup() {
  const name = document.getElementById("signupName").value;
  const phone = document.getElementById("signupPhone").value;
  const password = document.getElementById("signupPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  if (!name || !phone || !password || !confirmPassword) {
    alert("Please fill in all fields");
    return;
  }
  if (password !== confirmPassword) {
    alert("Passwords do not match");
    return;
  }
  currentUser = { name, phone, password };
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  showMyGroupsPage();
}

// Forgot Password Dialog
function showForgotPassword() {
  document.getElementById("forgotPasswordDialog").style.display = "block";
}

function closeForgotPassword() {
  document.getElementById("forgotPasswordDialog").style.display = "none";
}

function resetPassword() {
  const phone = document.getElementById("forgotPhone").value;
  if (!phone) {
    alert("Please enter your phone number");
    return;
  }
  alert("Password reset link sent to " + phone);
  closeForgotPassword();
}

// Create a group
function createGroup() {
  const groupName = document.getElementById("groupName").value;
  if (!groupName) {
    alert("Please enter a group name");
    return;
  }
  const newGroup = { name: groupName, members: [] };
  groups.push(newGroup);
  renderGroups();
}

// Render groups on My Groups page
function renderGroups() {
  const groupListElement = document.getElementById("groupList");
  groupListElement.innerHTML = "";
  groups.forEach(group => {
    const groupItem = document.createElement("li");
    groupItem.textContent = `${group.name} - Members: ${group.members.length}`;
    groupListElement.appendChild(groupItem);
  });
}

// Logout Function
function logout() {
  localStorage.removeItem("currentUser");
  groups = [];
  alert("Logged out successfully");
  showLoginPage();
}

if (localStorage.getItem("currentUser")) {
  currentUser = JSON.parse(localStorage.getItem("currentUser"));
  showMyGroupsPage();
} else {
  showLoginPage();
}
