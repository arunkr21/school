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
  deleteStaff: (username) => ipcRenderer.invoke("delete-staff", username),
  getMarksByClass: (userClass) =>
    ipcRenderer.invoke("getMarksByClass", userClass),
  getAllStudents: () => ipcRenderer.invoke("get-all-students"),
  getSubjectsByClass: (assignedClass) =>
    ipcRenderer.invoke("get-subjects", assignedClass),
  getStudentMarks: (studentId) =>
    ipcRenderer.invoke("get-student-marks", studentId),
  saveMarks: (marksData) => ipcRenderer.invoke("save-marks", marksData),
  getStudentAchievements: (studentId) =>
    ipcRenderer.invoke("get-student-achievements", studentId),
  saveStudentAchievements: (achievementsData) =>
    ipcRenderer.invoke("save-student-achievements", achievementsData),
  getStudentRemarks: (studentId) =>
    ipcRenderer.invoke("get-student-remarks", studentId),
  saveStudentRemarks: (remarksData) =>
    ipcRenderer.invoke("save-student-remarks", remarksData),
});
