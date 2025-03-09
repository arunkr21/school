const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const bcrypt = require("bcrypt");
const Database = require("./database.js");

const sqlite3 = require("better-sqlite3");
const db = new sqlite3("database.db", { verbose: console.log });

let mainWindow;
function createWindow() {
  mainWindow = new BrowserWindow({
    // fullscreen: true,
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "src", "pages", "login.html"));

  mainWindow.webContents.once("did-finish-load", () => {
    mainWindow.webContents.setZoomFactor(0.9); // 90% zoom
  });
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
