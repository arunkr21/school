document.addEventListener("DOMContentLoaded", () => {
  const logoutButton = document.getElementById("logout-btn");

  logoutButton.addEventListener("click", () => {
    showConfirm("Are you sure you want logout?", function (confirmed) {
      if (confirmed) {
        console.log("User confirmed!");
        localStorage.removeItem("loggedInUser");
        window.location.href = "../login.html";
      } else {
        return;
      }
    });
    // Redirect to login page
  });

  function showConfirm(message, callback) {
    document.getElementById("confirmMessage").innerText = message;
    document.getElementById("customConfirm").style.display = "flex";

    // Handle OK Click
    document.getElementById("confirmOk").onclick = function () {
      document.getElementById("customConfirm").style.display = "none";
      callback(true); // Return true when OK is clicked
    };

    // Handle Cancel Click
    document.getElementById("confirmCancel").onclick = function () {
      document.getElementById("customConfirm").style.display = "none";
      callback(false); // Return false when Cancel is clicked
    };
  }
});
