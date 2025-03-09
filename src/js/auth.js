document.addEventListener("DOMContentLoaded", () => {
  const loginButton = document.getElementById("loginButton");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const errorMessage = document.getElementById("errorMessage");

  if (loginButton) {
    loginButton.addEventListener("click", async () => {
      const username = usernameInput.value;
      const password = passwordInput.value;

      try {
        if (username && password) {
          const result = await window.electronAPI.login(username, password);
          if (result.success === true) {
            if (result.user.role === "admin") {
              window.location.href = "../pages/admin/students.html";
            } else {
              window.location.href = "../pages/staff/staff.html";
            }
          } else {
            errorMessage.textContent = result.message;
          }
        }
      } catch (error) {
        errorMessage.textContent = error;
      }
    });
  }
});
