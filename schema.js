const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const Database = require("better-sqlite3");
const bcrypt = require("bcrypt");
const db = new Database("database.db", { verbose: console.log });

function createTables() {
  return new Promise((resolve, reject) => {
    const schemaSQL = fs.readFileSync(
      path.join(__dirname, "schema.sql"),
      "utf8"
    );
    this.db.exec(schemaSQL, (err) => {
      if (err) {
        console.error("Error creating tables", err);
        reject(err);
        return;
      }
      console.log("Tables created successfully");
      resolve();
    });
  });
}

module.exports = { createTables };
