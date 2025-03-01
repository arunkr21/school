document.addEventListener("DOMContentLoaded", () => {
  const loginButton = document.getElementById("loginButton");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const errorMessage = document.getElementById("errorMessage");

  if (loginButton) {
    loginButton.addEventListener("click", async () => {
      const username = usernameInput.value;
      const password = passwordInput.value;

      if (username && password) {
        const role = await window.electronAPI.loginUser(username, password);
        if (role === "admin") {
          window.location.href = "admin.html";
        } else if (role === "staff") {
          window.location.href = "staff.html";
        } else {
          errorMessage.textContent = "Invalid username or password.";
        }
      }
    });
  }
});
