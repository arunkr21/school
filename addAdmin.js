const Database = require("./database");

async function addUsers() {
  try {
    await Database.insertUser("admin", "admin123", "admin");
    await Database.insertUser("staff1", "staff123", "staff");
    console.log("Users added successfully!");
    process.exit();
  } catch (err) {
    console.error("Error adding users:", err);
    process.exit(1);
  }
}

addUsers();
