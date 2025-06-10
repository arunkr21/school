const { app, BrowserWindow, ipcMain, dialog, Menu } = require("electron");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const Database = require("./database.js");
const DB_PATH = path.join(__dirname, "database.db");

const sqlite3 = require("better-sqlite3");
const db = new sqlite3("database.db", { verbose: console.log });

let mainWindow;
function createWindow() {
  mainWindow = new BrowserWindow({
    // fullscreen: true,
    width: 800,
    height: 600,
    // icon: path.join(__dirname, "src/assets/logo.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "src", "pages", "login.html"));
  Menu.setApplicationMenu(null);

  // mainWindow.webContents.once("did-finish-load", () => {
  //   mainWindow.webContents.setZoomFactor(0.9); // 90% zoom
  // });
}

app.whenReady().then(() => {
  Database.initDatabase();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// ====== IPC Handlers ======

// Authentication
ipcMain.handle("login", async (_, username, password) => {
  try {
    return Database.authenticateUser(username, password);
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "An error occurred" };
  }
});

// Handle searching for a student
ipcMain.handle("searchStudent", async (event, admissionNo) => {
  try {
    // Fetch student data
    const stmt = db.prepare("SELECT * FROM students WHERE admission_no = ?");
    const student = stmt.get(admissionNo); // Synchronous execution

    // Fetch family members associated with the student
    const familyStmt = db.prepare(
      "SELECT * FROM family_members WHERE student_id = ?"
    );
    const familyMembers = familyStmt.all(admissionNo); // Fetch all family members

    if (student) {
      return { success: true, data: student, family: familyMembers };
    } else {
      return { success: false, message: "Student not found." };
    }
  } catch (error) {
    console.error("Database Error:", error);
    throw error;
  }
});

// Handle adding a student
ipcMain.handle("insertStudent", (event, studentData, familyMembers) => {
  const studentStmt = db.prepare(
    `
    INSERT INTO students (
      admission_no, name, address, date_of_birth, date_of_admission, class, aadhar_no, is_cwsn,  father_name, father_contact, mother_name, mother_contact, is_hostler,  guardian_name, guardian_address, guardian_contact, alternate_contact, email, identification_marks,
      bank_name, branch_name, ifsc_code, account_no,
      religion_caste, category, father_qualification, father_occupation, mother_qualification, mother_occupation, annual_income,
      height, weight, blood_group, special_diseases, vaccination_details
    ) VALUES (
      @admission_no, @name, @address, @dob, @doa, @class, @aadhar, @cwsn,  @father, @contact_father, @mother, @contact_mother, @hostler,  @guardian, @guardian_address, @guardian_contact, @alternate_no, @email, @id_marks,
      @bank_name, @branch_name, @ifsc, @account_no,
      @religion, @category, @father_qualification, @father_occupation, @mother_qualification, @mother_occupation, @annual_income,
      @height, @weight, @blood_group, @special_diseases, @vaccination_details
    )
  `
  );
  const updateStudent = db.prepare(
    `
    UPDATE students SET
      name = @name, address =  @address, date_of_birth = @dob, date_of_admission = @doa, class = @class, aadhar_no = @aadhar, is_cwsn = @cwsn,  father_name = @father, father_contact = @contact_father, mother_name = @mother, mother_contact = @contact_mother, is_hostler = @hostler,  guardian_name = @guardian, guardian_address = @guardian_address, guardian_contact = @guardian_contact, alternate_contact = @alternate_no, email = @email, identification_marks = @id_marks,
      bank_name = @bank_name, branch_name = @branch_name, ifsc_code = @ifsc, account_no = @account_no,
      religion_caste = @religion, category = @category, father_qualification = @father_qualification, father_occupation = @father_occupation, mother_qualification = @mother_qualification, mother_occupation = @mother_occupation, annual_income = @annual_income,
      height =  @height, weight =  @weight, blood_group = @blood_group, special_diseases = @special_diseases, vaccination_details = @vaccination_details
     WHERE admission_no = @admission_no
  `
  );

  try {
    // Check if the student already exists
    const checkStmt = db.prepare(
      "SELECT * FROM students WHERE admission_no = ?"
    );
    const existingStudent = checkStmt.get(studentData.admission_no);

    if (existingStudent) {
      // If student exists, update the record
      updateStudent.run(studentData);

      //Update family members
      db.prepare("DELETE FROM family_members WHERE student_id = ?").run(
        studentData.admission_no
      ); // Remove old records

      const insertFamilyStmt = db.prepare(`
        INSERT INTO family_members (student_id, name, relationship, qualification, occupation) 
        VALUES (?, ?, ?, ?, ?)
    `);
      const insertFamilyTransaction = db.transaction((familyMembers) => {
        familyMembers.forEach((member) => {
          insertFamilyStmt.run(
            studentData.admission_no,
            member.name,
            member.relationship,
            member.qualification,
            member.occupation
          );
        });
      });

      insertFamilyTransaction(familyMembers);

      // const familyStmt = db.prepare(`
      //   UPDATE family_members SET  name = ?, relationship = ?, qualification = ?, occupation = ?

      //   WHERE student_id = ?
      // `);
      // const updateMany = db.transaction((members) => {
      //   for (const member of members) {
      //     familyStmt.run(
      //       member.name,
      //       member.relationship,
      //       member.qualification,
      //       member.occupation,
      //       studentData.admission_no
      //     );
      //   }
      // });
      // updateMany(familyMembers);

      return { success: true, message: "Student record updated successfully." };
    } else {
      // If student does not exist, insert a new record
      studentStmt.run(studentData);

      //Insert family members
      const familyStmt = db.prepare(`
      INSERT INTO family_members (student_id, name, relationship, qualification, occupation) 
      VALUES (?, ?, ?, ?, ?)
    `);
      const insertMany = db.transaction((members) => {
        for (const member of members) {
          familyStmt.run(
            studentData.admission_no,
            member.name,
            member.relationship,
            member.qualification,
            member.occupation
          );
        }
      });
      insertMany(familyMembers);

      return { success: true, message: "Student added successfully!" };
    }
  } catch (error) {
    console.error("------err"); //xxxxxxxxxxxxxxxxxxxxxxxxx
    console.error(error); //xxxxxxxxxxxxxxxxxxxxxxxxx
    return { success: false, message: "Error: " + error.message };
  }
});

// Add a new staff user
ipcMain.handle("add-staff", async (event, staffData) => {
  try {
    const { username, password, assignedClass } = staffData;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if staff already exists
    const checkStmt = db.prepare("SELECT * FROM users WHERE username = ?");
    const existingUser = checkStmt.get(username);

    if (existingUser) {
      return { success: false, message: "Staff username already exists." };
    }

    // Insert new staff user
    const insertStmt = db.prepare(`
          INSERT INTO users (username, password, role, assigned_class) 
          VALUES (?, ?, 'staff', ?)
      `);
    insertStmt.run(username, hashedPassword, assignedClass);

    return { success: true, message: "Staff added successfully." };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, message: "Database operation failed." };
  }
});

// Get all staff users
ipcMain.handle("get-all-staff", async () => {
  try {
    const stmt = db.prepare(
      "SELECT username, assigned_class FROM users WHERE role = 'staff'"
    );
    return stmt.all(); // Return all staff users
  } catch (error) {
    console.error("Database Error:", error);
    return [];
  }
});

// Delete a staff user
ipcMain.handle("delete-staff", async (event, username) => {
  try {
    // Check if staff exists
    const checkStmt = db.prepare("SELECT * FROM users WHERE username = ?");
    const existingUser = checkStmt.get(username);

    if (!existingUser) {
      return { success: false, message: "Staff user not found." };
    }

    // Delete staff user
    const deleteStmt = db.prepare("DELETE FROM users WHERE username = ?");
    deleteStmt.run(username);

    return { success: true, message: "Staff user deleted successfully." };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, message: "Database operation failed." };
  }
});

// Get marks by class
ipcMain.handle("getMarksByClass", async (event, className) => {
  try {
    const stmt = db.prepare(`
      SELECT name FROM subjects WHERE standard = ?
    `);
    const marks = stmt.all(className); // Fetch marks for the specified class

    return { success: true, data: marks };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, message: "Failed to retrieve marks." };
  }
});

// Get all students
ipcMain.handle("get-all-students", async () => {
  try {
    const stmt = db.prepare("SELECT * FROM students");
    const students = stmt.all(); // Fetch all students
    console.log(students);
    return { success: true, data: students };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, message: "Failed to retrieve students." };
  }
});

// Fetch student marks
ipcMain.handle("get-student-marks", (event, studentId) => {
  try {
    const stmt = db.prepare("SELECT * FROM student_marks WHERE student_id = ?");
    return stmt.all(studentId);
  } catch (error) {
    return error;
  }
});

// Fetch subjects for assigned class
ipcMain.handle("get-subjects", (event, assignedClass) => {
  try {
    const stmt = db.prepare("SELECT * FROM subjects WHERE standard = ?");
    const result = stmt.all(assignedClass);
    console.log(result);
    return result;
  } catch (error) {
    console.log("ajihs");
    return error;
  }
});

// Save or update marks
ipcMain.handle("save-marks", (event, marksData) => {
  const stmt = db.prepare(`
      INSERT INTO student_marks (student_id, subject_id, term, ce_mark, te_mark, grade)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(student_id, subject_id, term) DO UPDATE SET 
          ce_mark = excluded.ce_mark,
          te_mark = excluded.te_mark,
          grade = excluded.grade
  `);
  marksData.forEach((data) =>
    stmt.run(
      data.student_id,
      data.subject_id,
      data.term,
      data.ce_mark,
      data.te_mark,
      data.grade
    )
  );
  return { success: true };
});

// Get student achievements
ipcMain.handle("get-student-achievements", (event, studentId) => {
  const stmt = db.prepare("SELECT * FROM achievements WHERE student_id = ?");
  return stmt.get(studentId) || {};
});

// Save or Update Achievements
ipcMain.handle("save-student-achievements", (event, data) => {
  const stmt = db.prepare(`
      INSERT INTO achievements (student_id, hobby, special_abilities, achievements, scholarships, additional_notes)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(student_id) DO UPDATE SET 
          hobby = excluded.hobby,
          special_abilities = excluded.special_abilities,
          achievements = excluded.achievements,
          scholarships = excluded.scholarships,
          additional_notes = excluded.additional_notes
  `);

  stmt.run(
    data.student_id,
    data.hobby,
    data.special_abilities,
    data.achievements,
    data.scholarships,
    data.additional_notes
  );
  return { success: true };
});

// Get student remarks
ipcMain.handle("get-student-remarks", (event, studentId) => {
  const stmt = db.prepare(
    `
        SELECT s.name AS subject, r.remark 
        FROM student_remarks r
        JOIN subjects s ON r.subject_id = s.id
        WHERE r.student_id = ?
    `
  );
  return stmt.all(studentId);
});

// Save or Update Remarks
ipcMain.handle("save-student-remarks", (event, remarksData) => {
  try {
    console.log(remarksData);
    const stmt = db.prepare(`
      INSERT INTO student_remarks (student_id, subject_id, remark)
        VALUES (?, ?, ?)
        ON CONFLICT(student_id, subject_id) 
        DO UPDATE SET remark = excluded.remark
  `);

    const insertTransaction = db.transaction((data) => {
      data.forEach((row) =>
        stmt.run(row.student_id, row.subject_id, row.remark)
      );
    });

    insertTransaction(remarksData);
    return { success: true, message: "Remarks updated successfully." };
  } catch (error) {
    console.log(error);
    return { success: false, message: error };
  }
});

// Export Database
ipcMain.handle("export-database", async () => {
  try {
    // Ask user for save location
    const { filePath } = await dialog.showSaveDialog({
      title: "Save Database Backup",
      defaultPath: path.join(app.getPath("desktop"), "database.db"),
      buttonLabel: "Export",
      filters: [{ name: "SQLite Database", extensions: ["sqlite", "db"] }],
    });

    if (!filePath) {
      return { success: false, message: "Export canceled." };
    }

    // Copy database file to selected location
    const sourcePath = path.join(__dirname, "database.db"); // Update if your DB is elsewhere
    fs.copyFileSync(sourcePath, filePath);

    return { success: true, message: "Database exported successfully!" };
  } catch (error) {
    console.error("Database Export Error:", error);
    return { success: false, message: error.message };
  }
});

// Import Database
ipcMain.handle("import-database", async () => {
  try {
    const { filePaths } = await dialog.showOpenDialog({
      title: "Select Database File to Import",
      buttonLabel: "Import",
      filters: [{ name: "SQLite Database", extensions: ["sqlite", "db"] }],
      properties: ["openFile"],
    });

    if (!filePaths || filePaths.length === 0) {
      return { success: false, message: "Import canceled." };
    }

    const selectedFile = filePaths[0];

    // Replace the existing database with the selected file
    fs.copyFileSync(selectedFile, DB_PATH);

    return {
      success: true,
      message:
        "Database imported successfully! Restart the app to apply changes.",
    };
  } catch (error) {
    console.error("Database Import Error:", error);
    return { success: false, message: error.message };
  }
});
