const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");

const db = new sqlite3.Database("./database.sqlite");

// Function to insert a user (Admin or Staff)
async function insertUser(username, password, role) {
  const hashedPassword = await bcrypt.hash(password, 10);
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      [username, hashedPassword, role],
      function (err) {
        if (err) reject(err);
        resolve();
      }
    );
  });
}

// Function to authenticate user
async function authenticateUser(username, password) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM users WHERE username = ?",
      [username],
      async (err, row) => {
        if (err) reject(err);
        if (row && (await bcrypt.compare(password, row.password))) {
          resolve(row.role); // Return the role (admin or staff)
        } else {
          resolve(null); // Authentication failed
        }
      }
    );
  });
}

module.exports = { insertUser, authenticateUser };
