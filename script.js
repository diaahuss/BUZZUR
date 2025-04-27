document.addEventListener("DOMContentLoaded", function () {
  const socket = io(); // Set up Socket.io connection
  let userData = {}; // Store logged-in user data
  let currentGroupId = null;

  // Toggle Password Visibility
  const togglePassword = (passwordFieldId, toggleIconId) => {
    const passwordField = document.getElementById(passwordFieldId);
    const toggleIcon = document.getElementById(toggleIconId);
    toggleIcon.addEventListener("click", function () {
      if (passwordField.type === "password") {
        passwordField.type = "text";
        toggleIcon.innerHTML = "&#128064;"; // Change to open eye
      } else {
        passwordField.type = "password";
        toggleIcon.innerHTML = "&#128065;"; // Change to closed eye
      }
    });
  };

  togglePassword("login-password", "toggle-login-password");
  togglePassword("signup-password", "toggle-signup-password");

  // Show/Hide Screens
  const showScreen = (screenId) => {
    const screens = document.querySelectorAll(".screen");
    screens.forEach((screen) => screen.style.display = "none");
    document.getElementById(screenId).style.display = "block";
  };

  // Switch to Sign-Up Screen
  document.getElementById("to-signup").addEventListener("click", function () {
    showScreen("signup-screen");
  });

  // Switch to Login Screen
  document.getElementById("to-login").addEventListener("click", function () {
    showScreen("login-screen");
  });

  // Handle Sign-Up
  document.getElementById("signup-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const name = document.getElementById("signup-name").value;
    const phone = document.getElementById("signup-phone").value;
    const password = document.getElementById("signup-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Save user data to localStorage or send to backend
    userData = { name, phone, password };
    localStorage.setItem("user", JSON.stringify(userData)); // Save user data
    alert("Sign up successful!");
    showScreen("login-screen"); // Go back to login screen after signup
  });

  // Handle Login
  document.getElementById("login-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const phone = document.getElementById("login-phone").value;
    const password = document.getElementById("login-password").value;

    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser && storedUser.phone === phone && storedUser.password === password) {
      userData = storedUser; // Store user data
      showScreen("groups-screen"); // Show group management screen after login
    } else {
      alert("Invalid phone number or password.");
    }
  });

  // Handle Group Management
  document.getElementById("create-group").addEventListener("click", function () {
    const groupName = prompt("Enter Group Name:");
    if (groupName) {
      const newGroup = { id: Date.now(), name: groupName, members: [] };
      addGroupToUI(newGroup);
      // Save group data to backend or localStorage
    }
  });

  const addGroupToUI = (group) => {
    const groupList = document.getElementById("group-list");
    const groupItem = document.createElement("li");
    groupItem.textContent = group.name;

    // Add Member Selection and Buzz Feature
    const memberSelect = document.createElement("select");
    memberSelect.id = `member-select-${group.id}`;
    group.members.forEach((member) => {
      const option = document.createElement("option");
      option.value = member.phone;
      option.textContent = `${member.name} (${member.phone})`;
      memberSelect.appendChild(option);
    });

    const buzzButton = document.createElement("button");
    buzzButton.textContent = "Buzz Selected";
    buzzButton.addEventListener("click", function () {
      const selectedPhone = memberSelect.value;
      if (selectedPhone) {
        socket.emit("send-buzz", { groupId: group.id, phone: selectedPhone });
      }
    });

    groupItem.appendChild(memberSelect);
    groupItem.appendChild(buzzButton);
    groupList.appendChild(groupItem);
  };

  // Logout
  document.getElementById("logout").addEventListener("click", function () {
    localStorage.removeItem("user");
    userData = {};
    showScreen("login-screen");
  });

  // Initial Screen
  showScreen("login-screen");
});
