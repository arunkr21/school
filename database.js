// const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const Database = require("better-sqlite3");
const db = new Database("database.db", { verbose: console.log });

// Initialize database
function initDatabase() {
  // Users table (for admin and staff)
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'staff')),
      assigned_class TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `
  ).run();

  // Students table
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS students (
      admission_no INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT,
      date_of_birth TEXT,
      date_of_admission TEXT,
      class TEXT,
      aadhar_no TEXT,
      is_cwsn TEXT CHECK(is_cwsn IN ('Yes', 'No')),
      father_name TEXT,
      father_contact TEXT,
      mother_name TEXT,
      mother_contact TEXT,
      is_hostler TEXT CHECK(is_hostler IN ('Yes', 'No')),
      guardian_name TEXT,
      guardian_address TEXT,
      guardian_contact TEXT,
      alternate_contact TEXT,
      email TEXT,
      identification_marks TEXT,
      

      bank_name TEXT,
      branch_name TEXT,
      ifsc_code TEXT,
      account_no TEXT,

      religion_caste TEXT,
      category TEXT,
      father_qualification TEXT,
      father_occupation TEXT,
      mother_qualification TEXT,
      mother_occupation TEXT,
      annual_income INTEGER,

      height INTEGER,
      weight INTEGER,
      blood_group TEXT,
      special_diseases TEXT,
      vaccination_details TEXT,
      
      
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `
  ).run();

  // Family members table
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS family_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      name TEXT,
      relationship TEXT,
      qualification TEXT,
      occupation TEXT,
      FOREIGN KEY (student_id) REFERENCES students (admission_no) ON DELETE CASCADE
    )
  `
  ).run();

  // Achievements and interests table
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      type TEXT, -- hobby, achievement, scholarship, etc.
      description TEXT,
      year INTEGER,
      FOREIGN KEY (student_id) REFERENCES students (admission_no) ON DELETE CASCADE
    )
  `
  ).run();

  // Subjects table
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      standard INTEGER NOT NULL CHECK (standard BETWEEN 1 AND 10),
      UNIQUE(name, standard)
    )
  `
  ).run();

  // Student marks table
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS student_marks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      subject_id INTEGER,
      term INTEGER CHECK (term IN (1, 2, 3)), -- Term 1, 2, or 3
      ce_mark REAL, -- Continuous Evaluation mark
      te_mark REAL, -- Term Examination mark
      grade TEXT,
      FOREIGN KEY (student_id) REFERENCES students (admission_no) ON DELETE CASCADE,
      FOREIGN KEY (subject_id) REFERENCES subjects (id),
      UNIQUE(student_id, subject_id, term)
    )
  `
  ).run();

  // Insert default subjects for each standard
  db.prepare(
    `
    INSERT OR IGNORE INTO subjects (name, standard) VALUES

      ('English', 1),
      ('Mathematics', 1),
      ('Environmental Science', 1),
      ('Regional Language', 1),

      ('English', 2),
      ('Mathematics', 2),
      ('Environmental Science', 2),
      ('Regional Language', 2),

      ('English', 3),
      ('Mathematics', 3),
      ('Environmental Science', 3),
      ('Regional Language', 3),

      ('English', 4),
      ('Mathematics', 4),
      ('Environmental Science', 4),
      ('Regional Language', 4),

      ('English', 5),
      ('Mathematics', 5),
      ('Environmental Science', 5),
      ('Regional Language', 5),

      ('English', 6),
      ('Mathematics', 6),
      ('Science', 6),
      ('Social Science', 6),
      ('Regional Language', 6),

      ('English', 7),
      ('Mathematics', 7),
      ('Science', 7),
      ('Social Science', 7),
      ('Regional Language', 7),

      ('English', 8),
      ('Mathematics', 8),
      ('Science', 8),
      ('Social Science', 8),
      ('Regional Language', 8),

      ('English', 9),
      ('Mathematics', 9),
      ('Science', 9),
      ('Social Science', 9),
      ('Regional Language', 9),

      ('English', 10),
      ('Mathematics', 10),
      ('Science', 10),
      ('Social Science', 10),
      ('Regional Language', 10);
    `
  ).run();

  // Check if admin user exists, if not create default admin
  const adminExists = db
    .prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1")
    .get();

  if (!adminExists) {
    const hashedPassword = bcrypt.hashSync("admin123", 10);
    db.prepare(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)"
    ).run("admin", hashedPassword, "admin");
    console.log("Default admin user created");
  }

  console.log("Database initialized");
}

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
}

module.exports = { initDatabase, insertUser, authenticateUser };

// id INTEGER PRIMARY KEY AUTOINCREMENT,
//       admission_number TEXT NOT NULL UNIQUE,
//       name TEXT NOT NULL,
//       address TEXT,
//       date_of_birth TEXT,
//       date_of_admission TEXT,
//       class INTEGER CHECK (class BETWEEN 1 AND 10),
//       aadhar_number TEXT,
//       is_cwsn INTEGER DEFAULT 0, -- Boolean (0 or 1)
//       parent_name TEXT,
//       parent_contact TEXT,
//       is_hostler INTEGER DEFAULT 0, -- Boolean (0 or 1)
//       guardian_name TEXT,
//       guardian_address TEXT,
//       guardian_contact TEXT,
//       email TEXT,
//       identification_marks TEXT,

//       bank_name TEXT,
//       bank_branch TEXT,
//       bank_ifsc TEXT,
//       bank_account TEXT,

//       religion TEXT,
//       caste TEXT,
//       category TEXT,
//       parent_qualification TEXT,
//       parent_occupation TEXT,
//       annual_income REAL,

//       blood_group TEXT,
//       height REAL,
//       weight REAL,
//       special_disease TEXT,
//       vaccination_details TEXT,
