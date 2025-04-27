document.addEventListener("DOMContentLoaded", function () {
  const socket = io(); // Set up Socket.io connection
  let userData = {}; // Store logged-in user data
  let currentGroupId = null;
  let groups = [];

  // Utility to toggle password visibility
  const togglePasswordVisibility = (inputId, buttonId) => {
    const passwordField = document.getElementById(inputId);
    const button = document.getElementById(buttonId);
    button.addEventListener('click', function () {
      if (passwordField.type === 'password') {
        passwordField.type = 'text';
        button.innerHTML = "&#128065;"; // Eye icon for showing
      } else {
        passwordField.type = 'password';
        button.innerHTML = "&#128068;"; // Eye icon for hiding
      }
    });
  };

  togglePasswordVisibility('login-password', 'toggle-login-password');
  togglePasswordVisibility('signup-password', 'toggle-signup-password');

  // Show different screens
  const showScreen = (screenId) => {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.style.display = 'none');
    document.getElementById(screenId).style.display = 'block';
  };

  // Show the login screen initially
  showScreen('login-screen');

  // Handle login form
  document.getElementById('login-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const phone = document.getElementById('login-phone').value;
    const password = document.getElementById('login-password').value;

    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser && storedUser.phone === phone && storedUser.password === password) {
      userData = storedUser;
      showScreen('groups-screen');
    } else {
      alert('Invalid credentials');
    }
  });

  // Handle sign-up form
  document.getElementById('signup-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const name = document.getElementById('signup-name').value;
    const phone = document.getElementById('signup-phone').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    const newUser = { name, phone, password };
    localStorage.setItem('user', JSON.stringify(newUser));
    alert("Sign-up successful!");
    showScreen('login-screen');
  });

  // Handle group creation
  document.getElementById('create-group').addEventListener('click', function () {
    const groupName = prompt("Enter Group Name:");
    if (groupName) {
      const newGroup = { id: Date.now(), name: groupName, members: [] };
      groups.push(newGroup);
      renderGroups();
      showScreen('groups-screen');
    }
  });

  // Render groups on the dashboard
  const renderGroups = () => {
    const groupList = document.getElementById('group-list');
    groupList.innerHTML = '';
    groups.forEach(group => {
      const groupItem = document.createElement('li');
      groupItem.textContent = group.name;
      
      // Remove Group Button
      const removeButton = document.createElement('button');
      removeButton.textContent = "Remove";
      removeButton.addEventListener('click', function () {
        groups = groups.filter(g => g.id !== group.id);
        renderGroups();
      });

      // Edit Group Button
      const editButton = document.createElement('button');
      editButton.textContent = "Edit Group";
      editButton.addEventListener('click', function () {
        currentGroupId = group.id;
        showScreen('edit-group-screen');
        document.getElementById('edit-group-name').value = group.name;
      });

      groupItem.appendChild(removeButton);
      groupItem.appendChild(editButton);
      groupList.appendChild(groupItem);
    });
  };

  // Handle group editing
  document.getElementById('edit-group-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const updatedName = document.getElementById('edit-group-name').value;
    const group = groups.find(g => g.id === currentGroupId);
    if (group) {
      group.name = updatedName;
      renderGroups();
      showScreen('groups-screen');
    }
  });

  // Handle buzz member selection
  document.getElementById('buzz-members-button').addEventListener('click', function () {
    const memberSelect = document.getElementById('member-select');
    const selectedMember = memberSelect.value;

    if (selectedMember) {
      socket.emit('send-buzz', { memberPhone: selectedMember });
      document.getElementById('buzzSound').play();
    } else {
      alert('Please select a member to buzz.');
    }
  });

  // Handle logout
  document.getElementById('logout').addEventListener('click', function () {
    localStorage.removeItem('user');
    showScreen('login-screen');
  });
});
