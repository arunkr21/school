document.addEventListener("DOMContentLoaded", () => {
  const addStaffBtn = document.getElementById("addStaffBtn");
  const staffList = document.getElementById("staffList");

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
        if (confirm(`Are you sure you want to delete ${username}?`)) {
          const result = await window.electronAPI.deleteStaff(username);
          alert(result.message);
          loadStaffList(); // Refresh staff list
        }
      });
    });
  }

  // Add staff button event
  addStaffBtn.addEventListener("click", async () => {
    const username = document.getElementById("staffUsername").value.trim();
    const password = document.getElementById("staffPassword").value.trim();
    const assignedClass = document.getElementById("staffClass").value.trim();

    if (!username || !password || !assignedClass) {
      alert("Please fill all fields.");
      return;
    }

    const result = await window.electronAPI.addStaff({
      username,
      password,
      assignedClass,
    });
    alert(result.message);
    loadStaffList(); // Refresh staff list
  });

  loadStaffList(); // Load staff on page load
});
