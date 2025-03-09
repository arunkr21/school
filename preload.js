const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  login: (username, password) =>
    ipcRenderer.invoke("login", username, password),
  insertStudent: (studentData, familyMembers) =>
    ipcRenderer.invoke("insertStudent", studentData, familyMembers),
  searchStudent: (admissionNo) =>
    ipcRenderer.invoke("searchStudent", admissionNo),
  addStaff: (staffData) => ipcRenderer.invoke("add-staff", staffData),
  getAllStaff: () => ipcRenderer.invoke("get-all-staff"),
});
