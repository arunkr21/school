document.addEventListener("DOMContentLoaded", () => {
  const addStaffBtn = document.getElementById("addStaffBtn");
  const staffList = document.getElementById("staffList");

  // Load staff list on page load
  async function loadStaffList() {
    const staffUsers = await window.electronAPI.getAllStaff();
    staffList.innerHTML = ""; // Clear existing table data

    staffUsers.forEach((staff) => {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${staff.username}</td><td>${staff.assigned_class}</td>`;
      staffList.appendChild(row);
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
