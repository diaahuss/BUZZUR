document.addEventListener("DOMContentLoaded", function () {
  // Dynamically create screens
  const appContainer = document.getElementById("app");

  const loginScreen = `
    <div id="login-screen" class="screen">
      <h2>Login</h2>
      <form id="login-form">
        <input type="text" id="login-phone" placeholder="Phone" required>
        <div class="password-container">
          <input type="password" id="login-password" placeholder="Password" required>
          <button type="button" id="toggle-login-password" class="show-password-btn">👁</button>
        </div>
        <button type="submit">Login</button>
      </form>
      <button onclick="showScreen('signup-screen')">Go to Sign Up</button>
    </div>
  `;

  const signupScreen = `
    <div id="signup-screen" class="screen">
      <h2>Sign Up</h2>
      <form id="signup-form">
        <input type="text" id="signup-name" placeholder="Full Name" required>
        <input type="text" id="signup-phone" placeholder="Phone" required>
        <div class="password-container">
          <input type="password" id="signup-password" placeholder="Password" required>
          <button type="button" id="toggle-signup-password" class="show-password-btn">👁</button>
        </div>
        <input type="password" id="confirm-password" placeholder="Confirm Password" required>
        <button type="submit">Sign Up</button>
      </form>
      <button onclick="showScreen('login-screen')">Already have an account? Login</button>
    </div>
  `;

  const myGroupsScreen = `
    <div id="my-groups-screen" class="screen">
      <h2>My Groups</h2>
      <button onclick="createGroup()">Create a Group</button>
      <div id="groups-list"></div>
    </div>
  `;

  appContainer.innerHTML = loginScreen; // Initially load the login screen

  // Switch screen function
  window.showScreen = function(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.style.display = 'none');
    document.getElementById(screenId).style.display = 'block';
  };

  // Function to toggle password visibility
  const togglePasswordVisibility = (inputId, buttonId) => {
    const passwordField = document.getElementById(inputId);
    const button = document.getElementById(buttonId);
    button.addEventListener('click', function () {
      if (passwordField.type === 'password') {
        passwordField.type = 'text';
        button.innerHTML = "🙈"; // Hide password icon
      } else {
        passwordField.type = 'password';
        button.innerHTML = "👁"; // Show password icon
      }
    });
  };

  togglePasswordVisibility('login-password', 'toggle-login-password');
  togglePasswordVisibility('signup-password', 'toggle-signup-password');
});

function createGroup() {
  const groupName = prompt("Enter group name");
  if (groupName) {
    const groupList = document.getElementById("groups-list");
    const groupDiv = document.createElement("div");
    groupDiv.classList.add("group-item");
    groupDiv.innerHTML = `
      <span>${groupName}</span>
      <button onclick="editGroup('${groupName}')">Edit</button>
      <button onclick="removeGroup(this)">Remove</button>
      <button onclick="showMembers('${groupName}')">View Members</button>
    `;
    groupList.appendChild(groupDiv);
  }
}

function editGroup(groupName) {
  const newName = prompt("Edit group name", groupName);
  if (newName) {
    const groupDiv = document.querySelector(`.group-item span:contains(${groupName})`).parentNode;
    groupDiv.querySelector("span").textContent = newName;
  }
}

function removeGroup(button) {
  button.parentElement.remove();
}

function showMembers(groupName) {
  const membersList = prompt("Enter members for " + groupName + " (comma separated)");
  if (membersList) {
    const members = membersList.split(",").map(name => name.trim());
    const memberDiv = document.createElement("div");
    memberDiv.innerHTML = `
      <h3>Members for ${groupName}</h3>
      <ul>
        ${members.map(member => `<li>${member}</li>`).join("")}
      </ul>
      <button onclick="selectToBuzz()">Select to Buzz</button>
    `;
    document.body.appendChild(memberDiv);
  }
}

function selectToBuzz() {
  alert("You have selected members to buzz.");
}
