const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const Database = require("better-sqlite3");
const bcrypt = require("bcrypt");

// Initialize database
const dbPath = path.join(__dirname, "database.sqlite");
const db = new Database(dbPath);

function initDatabase() {
  // Create users table if it doesn't exist
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `
  ).run();

  // Create students table if it doesn't exist
  const aaa = db
    .prepare(
      `
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admission_number TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      date_of_birth TEXT NOT NULL,
      added_by INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (added_by) REFERENCES users (id)
    )
  `
    )
    .run();

  // Check if admin user exists, if not create default admin
  const adminExists = db
    .prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1")
    .get();

  if (!adminExists) {
    const hashedPassword = bcrypt.hashSync("admin123", 10);
    db.prepare(
      "INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)"
    ).run("admin", hashedPassword, "Administrator", "admin");
    console.log("Default admin user created");
  }

  console.log("Database initialized");
}

let mainWindow;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "src", "pages", "login.html"));
}

app.whenReady().then(() => {
  initDatabase();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// ====== IPC Handlers ======

// Authentication
ipcMain.handle("login", async (_, username, password) => {
  try {
    const user = db
      .prepare("SELECT * FROM users WHERE username = ?")
      .get(username);
    console.log("----", user);
    if (!user) {
      return { success: false, message: "User not found" };
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return { success: false, message: "Invalid password" };
    }

    // return user.role;
    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "An error occurred" };
  }
});

// ipcMain.handle("login-user", async (event, username, password) => {
//   const role = await Database.authenticateUser(username, password);
//   return role; // Returns "admin" or "staff" or null if authentication fails
// });
