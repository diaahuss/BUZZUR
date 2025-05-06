// \ Utility Functions
function showPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
  document.getElementById(pageId).classList.remove("hidden");
}

// \ Navigation
document.getElementById("to-signup").onclick = () => showPage("signup-page");
document.getElementById("to-login").onclick = () => showPage("login-page");

// \ Show/Hide Passwords
document.getElementById("login-show-pw").onchange = function () {
  document.getElementById("login-password").type = this.checked ? "text" : "password";
};
document.getElementById("signup-show-pw").onchange = function () {
  document.getElementById("signup-password").type =
  document.getElementById("signup-confirm").type = this.checked ? "text" : "password";
};

// \ Signup
document.getElementById("signup-button").onclick = () => {
  const name = document.getElementById("signup-name").value.trim();
  const phone = document.getElementById("signup-phone").value.trim();
  const password = document.getElementById("signup-password").value;
  const confirm = document.getElementById("signup-confirm").value;

  if (!name || !phone || !password || password !== confirm) {
    alert("Check inputs and passwords match");
    return;
  }

  const users = JSON.parse(localStorage.getItem("users") || "{}");
  if (users[phone]) return alert("User already exists");

  users[phone] = { name, password };
  localStorage.setItem("users", JSON.stringify(users));
  alert("Account created! Please login.");
  showPage("login-page");
};

// \ Login
document.getElementById("login-button").onclick = () => {
  const phone = document.getElementById("login-phone").value.trim();
  const password = document.getElementById("login-password").value;

  const users = JSON.parse(localStorage.getItem("users") || "{}");
  if (!users[phone] || users[phone].password !== password) {
    alert("Wrong phone or password");
    return;
  }

  localStorage.setItem("currentUser", phone);
  showPage("groups-page");
};

// \ Logout
document.getElementById("logout-button").onclick = () => {
  localStorage.removeItem("currentUser");
  showPage("login-page");
};

// \ Initial load
showPage("login-page");
