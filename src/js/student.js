document.addEventListener("DOMContentLoaded", () => {
  // Student data
  const admissionNo = document.getElementById("admission-no");
  const name = document.getElementById("name");
  const address = document.getElementById("address");
  const dob = document.getElementById("dob");
  const doa = document.getElementById("doa");
  const classes = document.getElementById("class");
  const aadhar = document.getElementById("aadhar");
  const cwsn = document.getElementById("cwsn");
  const father = document.getElementById("father");
  const contactFather = document.getElementById("contact-father");
  const mother = document.getElementById("mother");
  const contactMother = document.getElementById("contact-mother");
  const hostler = document.getElementById("hostler");
  const guardian = document.getElementById("guardian");
  const guardianAddress = document.getElementById("guardian-address");
  const guardianContact = document.getElementById("guardian-contact");
  const alternateNo = document.getElementById("alternate-no");
  const email = document.getElementById("email");
  const idMarks = document.getElementById("id-marks");

  // Account Details
  const bankName = document.getElementById("bank-name");
  const branchName = document.getElementById("branch-name");
  const ifsc = document.getElementById("ifsc");
  const accountNo = document.getElementById("account-no");

  // Socio-Economic Status
  const religion = document.getElementById("religion");
  const category = document.getElementById("category");
  const fatherQualification = document.getElementById("father-qualification");
  const fatherOccupation = document.getElementById("father-occupation");
  const motherQualification = document.getElementById("mother-qualification");
  const motherOccupation = document.getElementById("mother-occupation");
  const annualIncome = document.getElementById("annual-income");

  // Health Data
  const height = document.getElementById("height");
  const weight = document.getElementById("weight");
  const bloodGroup = document.getElementById("blood-group");
  const specialDiseases = document.getElementById("special-diseases");
  const vaccinationDetails = document.getElementById("vaccination-details");

  // Action Btn
  const resetBtn = document.getElementById("btn-reset");
  const saveBtn = document.getElementById("btn-save");

  if (saveBtn) {
    saveBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      const studentData = {};

      // Get all input fields dynamically
      document.querySelectorAll("select, input").forEach((input) => {
        studentData[input.id.replace("-", "_")] = input.value.trim(); // Convert "admission-no" → "admission_no"
      });

      const response = await window.electronAPI.insertStudent(studentData);
      alert(response.message);

      if (response.success) {
        document.querySelector("form").reset(); // Reset form after successful save
      }
    });
  }

  // Handle Reset Button Click
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      document.querySelectorAll("input").forEach((input) => {
        input.value = ""; // Clear input fields
      });
      document
        .querySelectorAll("select")
        .forEach((select) => (select.selectedIndex = 0));
    });
  }
});
