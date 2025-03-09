document.addEventListener("DOMContentLoaded", () => {
  const logoutButton = document.getElementById("logout-btn");

  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      // Redirect to login page
      window.location.href = "../login.html";
    });
  }
});
