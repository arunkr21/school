document.addEventListener("DOMContentLoaded", () => {
  const profileField = document.querySelector("#profile p");
  const profileName = JSON.parse(localStorage.getItem("loggedInUser")).username;
  profileField.textContent = profileName;
  // Alert Box
  function showAlert(message) {
    document.getElementById("alertMessage").innerText = message;
    document.getElementById("customAlert").style.display = "flex";
  }
  alertClose.addEventListener("click", () => {
    document.getElementById("customAlert").style.display = "none";
  });

  document.getElementById("exportDB").addEventListener("click", async () => {
    const result = await window.electronAPI.exportDatabase();
    showAlert(
      result.success
        ? "Database exported successfully!"
        : // : "Export failed: " + result.message
          result.message
    );
  });

  document.getElementById("importDB").addEventListener("click", async () => {
    const result = await window.electronAPI.importDatabase();
    showAlert(
      result.success
        ? "Database imported successfully! Restart the app to apply changes."
        : // : "Import failed: " + result.message
          result.message
    );
  });
});
