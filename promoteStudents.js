// promoteStudents.js

function promoteEligibleStudents(db) {
  const students = db.prepare(`SELECT admission_no, class FROM students`).all();

  students.forEach(student => {
    const currentClass = parseInt(student.class);
    const admissionNo = student.admission_no;

    if (isNaN(currentClass)) return;

    // Fetch final term grades for this student's current class
    const grades = db.prepare(`
      SELECT grade FROM student_marks
      JOIN subjects ON student_marks.subject_id = subjects.id
      WHERE student_id = ? AND term = 3 AND subjects.standard = ?
    `).all(admissionNo, currentClass);

    if (grades.length === 0) return;

    // All grades must be D or better
    const passed = grades.every(g => {
      const grade = g.grade ? g.grade.toUpperCase() : null;
      return grade && ['A', 'B', 'C', 'D'].includes(grade);
    });

    if (!passed) return;

    if (currentClass < 10) {
      const nextClass = currentClass + 1;

      // Promote student
      db.prepare(`UPDATE students SET class = ? WHERE admission_no = ?`)
        .run(nextClass, admissionNo);

      console.log(`✅ Student ${admissionNo} promoted from class ${currentClass} to ${nextClass}`);

      // Find new class teacher
      const newTeacher = db.prepare(`
        SELECT id FROM users WHERE role = 'staff' AND assigned_class = ?
      `).get(nextClass);

      if (newTeacher) {
        console.log(`📘 Student ${admissionNo} is now under teacher ID ${newTeacher.id}`);

        // OPTIONAL: insert or update into student_teacher_map (uncomment if table exists)
        /*
        db.prepare(`
          INSERT OR REPLACE INTO student_teacher_map (student_id, teacher_id, academic_year)
          VALUES (?, ?, ?)
        `).run(admissionNo, newTeacher.id, '2024–25');
        */
      }

    } else if (currentClass === 10) {
      // Mark student as passed out
      db.prepare(`UPDATE students SET class = 'Passed Out' WHERE admission_no = ?`)
        .run(admissionNo);

      console.log(`🎓 Student ${admissionNo} has successfully passed out after class 10`);
    }
  });
}

module.exports = { promoteEligibleStudents };
