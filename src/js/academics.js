document.addEventListener("DOMContentLoaded", async () => {
  // const userData = window.api.getUserData();
  // if (!userData) {
  //   alert("User not found. Please log in.");
  //   return;
  // }
  // const assignedClass = userData.assigned_class;
  // const assignedClass = 8;

  // const subjects = await window.electronAPI.getSubjectsByClass(assignedClass);

  async function loadTable(subjects) {
    // Marks table
    const tableBody = document.querySelector("#subjectTable tbody");
    tableBody.innerHTML = "";
    subjects.forEach((subject) => {
      const row = document.createElement("tr");
      row.setAttribute("data-subject-id", subject.id);
      row.innerHTML = `
     <td>${subject.name}</td>
     <td><input type="text" class="ce-mark editable" data-term="1"></td>
     <td><input type="text" class="te-mark editable" data-term="1"></td>
     <td><input type="text" class="ce-mark editable" data-term="2"></td>
     <td><input type="text" class="te-mark editable" data-term="2"></td>
     <td><input type="text" class="ce-mark editable" data-term="3"></td>
     <td><input type="text" class="te-mark editable" data-term="3"></td>
     `;
      tableBody.appendChild(row);
    });
  }

  // ************************************************
  // Load Table
  // ************************************************
  document
    .querySelector("#searchStudentBtn")
    .addEventListener("click", async () => {
      const studentId = document.querySelector("#searchAdmissionNo").value;
      if (!studentId) {
        alert("Enter Admission Number");
        return;
      }

      // Load student info
      const studData = await window.electronAPI.searchStudent(studentId);
      if (studData.success) {
        const studInfo = document.getElementById("student-details");
        studInfo.innerHTML = `
                <div class="student-info-item">
            <div class="student-info-label">Student Name:</div>
            <div class="student-info-value" id="student-name">${studData.data.name}</div>
        </div>
        <div class="student-info-item">
            <div class="student-info-label">Student ID:</div>
            <div class="student-info-value" id="student-id">${studData.data.admission_no}</div>
        </div>
        <div class="student-info-item">
            <div class="student-info-label">Class:</div>
            <div class="student-info-value" id="student-class">${studData.data.class}</div>
        </div>
      `;
      } else {
        alert(studData.message);
        return;
      }

      // Load table
      const assignedClass = studData.data.class;
      const subjects = await window.electronAPI.getSubjectsByClass(
        assignedClass
      );
      loadTable(subjects);

      // Load marks
      const marksData = await window.electronAPI.getStudentMarks(
        studData.data.admission_no
      );
      document.querySelectorAll("#subjectTable tbody tr ").forEach((row) => {
        const subjectId = row.getAttribute("data-subject-id");
        // Load Remarks

        for (let term = 1; term <= 3; term++) {
          const ceInput = row.querySelector(`.ce-mark[data-term='${term}']`);
          const teInput = row.querySelector(`.te-mark[data-term='${term}']`);

          const mark = marksData.find(
            (m) => m.subject_id == subjectId && m.term == term
          );
          if (mark) {
            ceInput.value = mark.ce_mark || 0;
            teInput.value = mark.te_mark || 0;
          } else {
            ceInput.value = "";
            teInput.value = "";
          }
        }
      });

      // Load Remarks
      const remarks = await window.electronAPI.getStudentRemarks(studentId);

      const remarksContainer = document.querySelector("#remarksContainer");
      remarksContainer.innerHTML = "";

      document.getElementById("remarks-title").innerHTML = "Remarks";

      subjects.forEach((subject) => {
        const remarkValue =
          remarks.find((r) => r.subject === subject.name)?.remark || "";
        remarksContainer.innerHTML += `
          <div class="remarks-item">
            <div class="remarks-label">${subject.name} :</div>
            <input type="text" class="remarks-value" data-subject="${subject.name}" value="${remarkValue}">
          </div>
        `;
      });

      // Fetch existing achievements
      const achievements = await window.electronAPI.getStudentAchievements(
        studentId
      );
      document.querySelector("#hobby").value = achievements?.hobby || "";
      document.querySelector("#specialAbilities").value =
        achievements?.special_abilities || "";
      document.querySelector("#achievements").value =
        achievements?.achievements || "";
      document.querySelector("#scholarships").value =
        achievements?.scholarships || "";
      document.querySelector("#additionalNotes").value =
        achievements?.additional_notes || "";
    });

  // ************************************************
  // Save Data
  // ************************************************
  document.getElementById("save-btn").addEventListener("click", async () => {
    // const studentId = document.getElementById("searchAdmissionNo").value;
    const studentId = document.getElementById("student-id").textContent.trim();
    if (!studentId) {
      alert("Enter Admission Number");
      return;
    }

    // Save Marks
    const marksData = [];
    document.querySelectorAll("#subjectTable tbody tr").forEach((row) => {
      const subjectId = row.getAttribute("data-subject-id");
      for (let term = 1; term <= 3; term++) {
        const ceMark =
          row.querySelector(`.ce-mark[data-term='${term}']`).value || 0;
        const teMark =
          row.querySelector(`.te-mark[data-term='${term}']`).value || 0;
        marksData.push({
          student_id: studentId,
          subject_id: subjectId,
          term,
          ce_mark: ceMark,
          te_mark: teMark,
          grade: "",
        });
      }
    });
    await window.electronAPI.saveMarks(marksData);
    alert("Marks saved successfully.");

    // Save Remarks
    const remarkInputs = document.querySelectorAll(".remarks-value");
    const remarksData = Array.from(remarkInputs).map((input) => ({
      student_id: studentId,
      subject: input.dataset.subject,
      remark: input.value,
    }));
    const saveRemark = await window.electronAPI.saveStudentRemarks(remarksData);
    alert(saveRemark.message);

    // Save Achievements
    const achievementsData = {
      student_id: studentId,
      hobby: document.querySelector("#hobby").value,
      special_abilities: document.querySelector("#specialAbilities").value,
      achievements: document.querySelector("#achievements").value,
      scholarships: document.querySelector("#scholarships").value,
      additional_notes: document.querySelector("#additionalNotes").value,
    };
    await window.electronAPI.saveStudentAchievements(achievementsData);
    alert("Achievements updated successfully.");
  });
});
