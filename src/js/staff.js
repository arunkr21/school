document.addEventListener("DOMContentLoaded", () => {
  const addStaffBtn = document.getElementById("addStaffBtn");
  const staffList = document.getElementById("staffList");

  const profileField = document.querySelector("#profile p");
  const profileName = JSON.parse(localStorage.getItem("loggedInUser")).username;
  profileField.textContent = profileName;

  // Alert Box
  const alertClose = document.getElementById("alertClose");
  function showAlert(message) {
    document.getElementById("alertMessage").innerText = message;
    document.getElementById("customAlert").style.display = "flex";
  }
  alertClose.addEventListener("click", () => {
    document.getElementById("customAlert").style.display = "none";
  });

  // Confirm Box
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

  // Load staff list on page load
  async function loadStaffList() {
    const staffUsers = await window.electronAPI.getAllStaff();
    staffList.innerHTML = ""; // Clear existing table data

    staffUsers.forEach((staff) => {
      const row = document.createElement("tr");
      row.innerHTML = `
      <td>${staff.username}</td>
      <td>${staff.assigned_class}</td>
      <td><button class="deleteStaffBtn" data-username="${staff.username}">Delete</button></td>
      `;
      staffList.appendChild(row);
    });

    // Attach delete event to each button
    document.querySelectorAll(".deleteStaffBtn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const username = btn.getAttribute("data-username");
        // if (confirm(`Are you sure you want to delete ${username}?`)) {
        //   const result = await window.electronAPI.deleteStaff(username);
        //   alert(result.message);
        //   loadStaffList(); // Refresh staff list
        // }

        showConfirm(
          `Are you sure you want ${username}?`,
          async function (confirmed) {
            if (confirmed) {
              const result = await window.electronAPI.deleteStaff(username);
              showAlert(result.message);
              loadStaffList(); // Refresh staff list
            } else {
              return;
            }
          }
        );
      });
    });
  }

  // Add staff button event
  addStaffBtn.addEventListener("click", async () => {
    const username = document.getElementById("staffUsername").value.trim();
    const password = document.getElementById("staffPassword").value.trim();
    const assignedClass = document.getElementById("staffClass").value.trim();

    if (!username || !password || !assignedClass) {
      showAlert("Please fill all fields.");
      return;
    }

    const result = await window.electronAPI.addStaff({
      username,
      password,
      assignedClass,
    });
    showAlert(result.message);
    document.getElementById("staffUsername").value = "";
    document.getElementById("staffPassword").value = "";
    document.getElementById("staffClass").value = "";
    loadStaffList(); // Refresh staff list
  });

  loadStaffList(); // Load staff on page load

  function clearField() {}
});
