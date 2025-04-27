document.addEventListener("DOMContentLoaded", function() {
  let currentScreen = "login-screen"; // Default screen
  const screens = {
    "login-screen": document.getElementById("login-screen"),
    "signup-screen": document.getElementById("signup-screen"),
    "my-groups-screen": document.getElementById("my-groups-screen"),
    "edit-group-screen": document.getElementById("edit-group-screen")
  };

  function showScreen(screenName) {
    Object.values(screens).forEach(screen => screen.style.display = "none");
    screens[screenName].style.display = "block";
    currentScreen = screenName;
  }

  // Show password functionality
  function togglePasswordVisibility(passwordId, toggleBtnId) {
    const passwordField = document.getElementById(passwordId);
    const toggleBtn = document.getElementById(toggleBtnId);

    toggleBtn.addEventListener("click", () => {
      if (passwordField.type === "password") {
        passwordField.type = "text";
      } else {
        passwordField.type = "password";
      }
    });
  }

  // Initialize password visibility toggles
  togglePasswordVisibility("login-password", "toggle-login-password");
  togglePasswordVisibility("signup-password", "toggle-signup-password");

  // Login screen
  document.getElementById("login-btn").addEventListener("click", () => {
    // For now, just transition to My Groups screen
    showScreen("my-groups-screen");
  });

  // Sign Up screen
  document.getElementById("sign-up-link").addEventListener("click", () => {
    showScreen("signup-screen");
  });

  document.getElementById("signup-btn").addEventListener("click", () => {
    // For now, just transition to My Groups screen after sign up
    showScreen("my-groups-screen");
  });

  document.getElementById("back-to-login-link").addEventListener("click", () => {
    showScreen("login-screen");
  });

  // My Groups screen
  document.getElementById("create-group-btn").addEventListener("click", () => {
    // Create a group (placeholder functionality)
    const group = document.createElement("div");
    group.textContent = "New Group";
    group.addEventListener("click", () => {
      // Go to Edit Group screen
      showScreen("edit-group-screen");
    });
    document.getElementById("groups-list").appendChild(group);
  });

  document.getElementById("logout-btn").addEventListener("click", () => {
    showScreen("login-screen");
  });

  // Edit Group screen
  document.getElementById("back-to-my-groups-btn").addEventListener("click", () => {
    showScreen("my-groups-screen");
  });

  document.getElementById("remove-group-btn").addEventListener("click", () => {
    // Remove group (placeholder functionality)
    alert("Group Removed");
  });
});
