document.addEventListener("DOMContentLoaded", () => {
  // Action Btn
  const resetBtn = document.getElementById("btn-reset");
  const saveBtn = document.getElementById("btn-save");
  const searchBtn = document.getElementById("searchStudentBtn");

  // Handle Search Button Click
  if (searchBtn) {
    searchBtn.addEventListener("click", async () => {
      const admissionNo = document
        .getElementById("searchAdmissionNo")
        .value.trim();
      if (!admissionNo) {
        alert("Enter admission number");
        return;
      }

      const result = await window.electronAPI.searchStudent(admissionNo);

      if (result.success) {
        const student = result.data;
        const familyMembers = result.family;

        // Show student data
        document.getElementById("admission-no").value = student.admission_no;
        document.getElementById("name").value = student.name;
        document.getElementById("address").value = student.address;
        document.getElementById("dob").value = student.date_of_birth;
        document.getElementById("doa").value = student.date_of_admission;
        document.getElementById("class").value = student.class;
        document.getElementById("aadhar").value = student.aadhar_no;
        document.getElementById("cwsn").value = student.is_cwsn;
        document.getElementById("father").value = student.father_name;
        document.getElementById("contact-father").value =
          student.father_contact;
        document.getElementById("mother").value = student.mother_name;
        document.getElementById("contact-mother").value =
          student.mother_contact;
        document.getElementById("hostler").value = student.is_hostler;
        document.getElementById("guardian").value = student.guardian_name;
        document.getElementById("guardian-address").value =
          student.guardian_address;
        document.getElementById("guardian-contact").value =
          student.guardian_contact;
        document.getElementById("alternate-no").value =
          student.alternate_contact;
        document.getElementById("email").value = student.email;
        document.getElementById("id-marks").value =
          student.identification_marks;
        // Account details
        document.getElementById("bank-name").value = student.bank_name;
        document.getElementById("branch-name").value = student.branch_name;
        document.getElementById("ifsc").value = student.ifsc_code;
        document.getElementById("account-no").value = student.account_no;

        // Socio-Economics Status
        document.getElementById("religion").value = student.religion_caste;
        document.getElementById("category").value = student.category;
        document.getElementById("father-qualification").value =
          student.father_qualification;
        document.getElementById("father-occupation").value =
          student.father_occupation;
        document.getElementById("mother-qualification").value =
          student.mother_qualification;
        document.getElementById("mother-occupation").value =
          student.mother_occupation;
        document.getElementById("annual-income").value = student.annual_income;

        // Health data
        document.getElementById("height").value = student.height;
        document.getElementById("weight").value = student.weight;
        document.getElementById("blood-group").value = student.blood_group;
        document.getElementById("special-diseases").value =
          student.special_diseases;
        document.getElementById("vaccination-details").value =
          student.vaccination_details;

        // Show family members
        familyMembers.forEach((member, index) => {
          document.querySelector(`input[name="family[${index}][name]"]`).value =
            member.name;
          document.querySelector(
            `input[name="family[${index}][relationship]"]`
          ).value = member.relationship;
          document.querySelector(
            `input[name="family[${index}][qualification]"]`
          ).value = member.qualification;
          document.querySelector(
            `input[name="family[${index}][occupation]"]`
          ).value = member.occupation;
        });
      } else {
        alert("Student not found! Enter details to add a new student.");
        studentForm.reset();
        document.getElementById("admissionNo").value = admissionNo; // Keep the entered admission number
      }
    });
  }

  // Handle Save Button Click
  if (saveBtn) {
    saveBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      const studentData = {};

      // Get all input fields dynamically
      document.querySelectorAll("select, input").forEach((input) => {
        studentData[input.id.replace("-", "_")] = input.value.trim(); // Convert "admission-no" → "admission_no"
      });

      // Collect family member details from the table
      const familyMembers = [];
      document
        .querySelectorAll("#family-members-table tr")
        .forEach((row, index) => {
          const name = row
            .querySelector(`input[name="family[${index}][name]"]`)
            ?.value.trim();
          const relationship = row
            .querySelector(`input[name="family[${index}][relationship]"]`)
            ?.value.trim();
          const qualification = row
            .querySelector(`input[name="family[${index}][qualification]"]`)
            ?.value.trim();
          const occupation = row
            .querySelector(`input[name="family[${index}][occupation]"]`)
            ?.value.trim();

          // Only add valid rows
          if (name && relationship && qualification && occupation) {
            familyMembers.push({
              name,
              relationship,
              qualification,
              occupation,
            });
          }
        });

      const response = await window.electronAPI.insertStudent(
        studentData,
        familyMembers
      );
      alert(response.message);

      if (response.success) {
        document.querySelector("form").reset(); // Reset form after successful save
        document
          .querySelectorAll("#family-members-table input")
          .forEach((input) => (input.value = "")); // Clear table inputs
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
