const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const Database = require("./database");

let mainWindow;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadFile("login.html");
});

ipcMain.handle("login-user", async (event, username, password) => {
  const role = await Database.authenticateUser(username, password);
  return role; // Returns "admin" or "staff" or null if authentication fails
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
