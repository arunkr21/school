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

// Insert student into the database
ipcMain.handle("insertStudent", (event, studentData) => {
  const stmt = db.prepare(
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
  try {
    stmt.run(studentData);
    return { success: true, message: "Student added successfully!" };
  } catch (error) {
    return { success: false, message: "Error: " + error.message };
  }
});
