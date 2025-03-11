document.addEventListener("DOMContentLoaded", () => {
  const logoutButton = document.getElementById("logout-btn");

  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      // Redirect to login page
      localStorage.removeItem("loggedInUser");
      window.location.href = "../login.html";
    });
  }
});
