const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  loginUser: (username, password) =>
    ipcRenderer.invoke("login-user", username, password),
});
