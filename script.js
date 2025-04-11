document.addEventListener("DOMContentLoaded", () => {
  const appContainer = document.getElementById("app");

  // Create and display the header
  const header = document.createElement("header");
  header.innerHTML = "Welcome to BUZZUR!";
  appContainer.appendChild(header);

  // Initialize Socket.IO
  const socket = io("https://buzzur-server.onrender.com");

  // Track user session and group details
  let user = null;
  let group = null;

  // Rendering the login form
  const renderLogin = () => {
    const loginForm = document.createElement("form");
    loginForm.innerHTML = `
      <h2>Login</h2>
      <input type="text" id="username" placeholder="Username" required />
      <input type="password" id="password" placeholder="Password" required />
      <button type="submit">Login</button>
      <p>Don't have an account? <a href="#" id="signup-link">Sign up</a></p>
    `;
    appContainer.appendChild(loginForm);

    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      login(username, password);
    });

    document.getElementById("signup-link").addEventListener("click", (e) => {
      e.preventDefault();
      renderSignup();
    });
  };

  // Rendering the signup form
  const renderSignup = () => {
    appContainer.innerHTML = ''; // Clear previous form
    const signupForm = document.createElement("form");
    signupForm.innerHTML = `
      <h2>Sign Up</h2>
      <input type="text" id="new-username" placeholder="Username" required />
      <input type="password" id="new-password" placeholder="Password" required />
      <button type="submit">Sign Up</button>
      <p>Already have an account? <a href="#" id="login-link">Login</a></p>
    `;
    appContainer.appendChild(signupForm);

    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = document.getElementById("new-username").value;
      const password = document.getElementById("new-password").value;
      signup(username, password);
    });

    document.getElementById("login-link").addEventListener("click", (e) => {
      e.preventDefault();
      renderLogin();
    });
  };

  // Handling login logic
  const login = (username, password) => {
    console.log("Logging in", username);
    // Send login request to the server
    fetch("https://buzzur-server.onrender.com/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
    .then(response => response.json())
    .then((data) => {
      if (data.success) {
        user = data.user;
        renderGroups();
      } else {
        alert("Login failed, please try again.");
      }
    })
    .catch((error) => console.error("Error logging in:", error));
  };

  // Handling signup logic
  const signup = (username, password) => {
    console.log("Signing up", username);
    fetch("https://buzzur-server.onrender.com/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
    .then(response => response.json())
    .then((data) => {
      if (data.success) {
        alert("Signup successful! Please log in.");
        renderLogin();
      } else {
        alert("Signup failed, please try again.");
      }
    })
    .catch((error) => console.error("Error signing up:", error));
  };

  // Rendering groups page
  const renderGroups = () => {
    appContainer.innerHTML = ''; // Clear the screen

    const groupForm = document.createElement("form");
    groupForm.innerHTML = `
      <h2>My Groups</h2>
      <button id="create-group-btn">Create New Group</button>
      <div id="group-list"></div>
      <button id="logout-btn" class="logout-btn">Logout</button>
    `;
    appContainer.appendChild(groupForm);

    document.getElementById("create-group-btn").addEventListener("click", () => {
      createGroup();
    });

    document.getElementById("logout-btn").addEventListener("click", () => {
      logout();
    });

    // Fetch groups
    fetch(`https://buzzur-server.onrender.com/groups/${user.id}`)
      .then(response => response.json())
      .then((data) => {
        const groupList = document.getElementById("group-list");
        data.groups.forEach((group) => {
          const groupItem = document.createElement("div");
          groupItem.innerHTML = `
            <div>
              <h3>${group.name}</h3>
              <button class="join-group-btn" data-group-id="${group.id}">Join Group</button>
            </div>
          `;
          groupList.appendChild(groupItem);

          // Attach join group functionality
          groupItem.querySelector(".join-group-btn").addEventListener("click", () => {
            joinGroup(group.id);
          });
        });
      })
      .catch((error) => console.error("Error fetching groups:", error));
  };

  // Create a new group
  const createGroup = () => {
    const groupName = prompt("Enter a name for the new group:");
    if (groupName) {
      fetch("https://buzzur-server.onrender.com/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: groupName, userId: user.id }),
      })
      .then(response => response.json())
      .then((data) => {
        if (data.success) {
          alert("Group created!");
          renderGroups();
        } else {
          alert("Error creating group.");
        }
      })
      .catch((error) => console.error("Error creating group:", error));
    }
  };

  // Join an existing group
  const joinGroup = (groupId) => {
    fetch("https://buzzur-server.onrender.com/join-group", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId, userId: user.id }),
    })
    .then(response => response.json())
    .then((data) => {
      if (data.success) {
        alert("You have joined the group!");
      } else {
        alert("Error joining the group.");
      }
    })
    .catch((error) => console.error("Error joining group:", error));
  };

  // Logout
  const logout = () => {
    user = null;
    group = null;
    renderLogin();
  };

  // Start by rendering the login page
  renderLogin();
});
