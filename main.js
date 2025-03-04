const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const bcrypt = require("bcrypt");
const Database = require("./database.js");

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

// ipcMain.handle("login-user", async (event, username, password) => {
//   const role = await Database.authenticateUser(username, password);
//   return role; // Returns "admin" or "staff" or null if authentication fails
// });
