document.addEventListener("DOMContentLoaded", () => {
  const searchBtn = document.getElementById("searchStudentBtn");
  const studentsTable = document.getElementById("studentsTable");
  const studentsTableBody = document.querySelector("#studentsTable tbody");

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
        // Display student data
        const studentDataSection = document.querySelector(
          ".student-data-section"
        );
        studentDataSection.innerHTML = `
            <h2>Student Data</h2>
            <div class="student-data-list">
              <h3>Admission No:</h3>
              <p>${result.data.admission_no}</p>
              <h3>Name:</h3>
              <p>${result.data.name}</p>
              <h3>Address:</h3>
              <p>${result.data.address}</p>
              <h3>Date of Birth:</h3>
              <p>${result.data.date_of_birth}</p>
              <h3>Date of Admission:</h3>
              <p>${result.data.date_of_admission}</p>
              <h3>Class:</h3>
              <p>${result.data.class}</p>
              <h3>Aadhar No:</h3>
              <p>${result.data.aadhar_no}</p>
              <h3>Is CWSN:</h3>
              <p>${result.data.is_cwsn}</p>
              <h3>Father's Name:</h3>
              <p>${result.data.father_name}</p>
              <h3>Father's Contact:</h3>
              <p>${result.data.father_contact}</p>
              <h3>Mother's Name:</h3>
              <p>${result.data.mother_name}</p>
              <h3>Mother's Contact:</h3>
              <p>${result.data.mother_contact}</p>
              <h3>Is Hostler:</h3>
              <p>${result.data.is_hostler}</p>
              <h3>Guardian's Name:</h3>
              <p>${result.data.guardian_name}</p>
              <h3>Guardian's Address:</h3>
              <p>${result.data.guardian_address}</p>
              <h3>Guardian's Contact:</h3>
              <p>${result.data.guardian_contact}</p>
              <h3>Alternate Contact:</h3>
              <p>${result.data.alternate_contact}</p>
              <h3>Email:</h3>
              <p>${result.data.email}</p>
              <h3>Identification Marks:</h3>
              <p>${result.data.identification_marks}</p>
              <h3>Bank Name:</h3>
              <p>${result.data.bank_name}</p>
              <h3>Branch Name:</h3>
              <p>${result.data.branch_name}</p>
              <h3>IFSC Code:</h3>
              <p>${result.data.ifsc_code}</p>
              <h3>Account No:</h3>
              <p>${result.data.account_no}</p>
              <h3>Religion/Caste:</h3>
              <p>${result.data.religion_caste}</p>
              <h3>Category:</h3>
              <p>${result.data.category}</p>
              <h3>Father's Qualification:</h3>
              <p>${result.data.father_qualification}</p>
              <h3>Father's Occupation:</h3>
              <p>${result.data.father_occupation}</p>
              <h3>Mother's Qualification:</h3>
              <p>${result.data.mother_qualification}</p>
              <h3>Mother's Occupation:</h3>
              <p>${result.data.mother_occupation}</p>
              <h3>Annual Income:</h3>
              <p>${result.data.annual_income}</p>
              <h3>Height:</h3>
              <p>${result.data.height}</p>
              <h3>Weight:</h3>
              <p>${result.data.weight}</p>
              <h3>Blood Group:</h3>
              <p>${result.data.blood_group}</p>
              <h3>Special Diseases:</h3>
              <p>${result.data.special_diseases}</p>
              <h3>Vaccination Details:</h3>
              <p>${result.data.vaccination_details}</p>
            </div>
          `;
      } else {
        alert("Student not found! Enter details to add a new student.");
      }
    });
  }

  // Load all students on page load
  async function loadAllStudents() {
    try {
      const result = await window.electronAPI.getAllStudents();
      if (result.success) {
        populateStudentsTable(result.data);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error loading students:", error);
      alert("Failed to load students. Please try again.");
    }
  }

  // Populate the students table with data
  function populateStudentsTable(students) {
    studentsTableBody.innerHTML = ""; // Clear existing table data
    students.forEach((student) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${student.admission_no}</td>
        <td>${student.name}</td>
        <td>${student.address}</td>
        <td>${student.date_of_birth}</td>
        <td>${student.date_of_admission}</td>
        <td>${student.class}</td>
        <td>${student.aadhar_no}</td>
        <td>${student.is_cwsn}</td>
        <td>${student.father_name}</td>
        <td>${student.father_contact}</td>
        <td>${student.mother_name}</td>
        <td>${student.mother_contact}</td>
        <td>${student.is_hostler}</td>
        <td>${student.guardian_name}</td>
        <td>${student.guardian_address}</td>
        <td>${student.guardian_contact}</td>
        <td>${student.alternate_contact}</td>
        <td>${student.email}</td>
        <td>${student.identification_marks}</td>
        <td>${student.bank_name}</td>
        <td>${student.branch_name}</td>
        <td>${student.ifsc_code}</td>
        <td>${student.account_no}</td>
        <td>${student.religion_caste}</td>
        <td>${student.category}</td>
        <td>${student.father_qualification}</td>
        <td>${student.father_occupation}</td>
        <td>${student.mother_qualification}</td>
        <td>${student.mother_occupation}</td>
        <td>${student.annual_income}</td>
        <td>${student.height}</td>
        <td>${student.weight}</td>
        <td>${student.blood_group}</td>
        <td>${student.special_diseases}</td>
        <td>${student.vaccination_details}</td>
      `;
      studentsTableBody.appendChild(row);
    });
  }

  // Call the loadAllStudents function on page load
  loadAllStudents();
});
