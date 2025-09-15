// server.js
const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ---- MySQL connection ----
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "dusktilldawn11",
  database: "college_system",
  multipleStatements: true
});

db.connect(err => {
  if (err) throw err;
  console.log("✅ MySQL connected");
});

// ---- Create tables if not exist ----
const tableCreationQueries = `
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reg_no VARCHAR(50) UNIQUE,
  name VARCHAR(100),
  email VARCHAR(100),
  class_name VARCHAR(50),
  password VARCHAR(50) DEFAULT 'pass123'
);

CREATE TABLE IF NOT EXISTS teachers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  emp_id VARCHAR(50) UNIQUE,
  name VARCHAR(100),
  email VARCHAR(100),
  password VARCHAR(50) DEFAULT 'pass123'
);

CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  domain VARCHAR(100),
  guide VARCHAR(100),
  progress INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_reg VARCHAR(50),
  project_id INT,
  percent INT DEFAULT 0
);
`;

// Run all table creation queries
db.query(tableCreationQueries, (err) => {
  if (err) {
    console.error("❌ Error creating tables:", err);
  } else {
    console.log("✅ Tables are ready");
  }
});

// ---- Routes ----

// Register student
app.post("/api/students", (req, res) => {
  const { reg_no, name, email, class_name } = req.body;
  const sql = `
    INSERT INTO students (reg_no, name, email, class_name)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email), class_name=VALUES(class_name)
  `;
  db.query(sql, [reg_no, name, email, class_name], (err) => {
    if (err) return res.status(500).send(err);
    res.send({ message: "Student saved" });
  });
});

// Register teacher
app.post("/api/teachers", (req, res) => {
  const { emp_id, name, email } = req.body;
  const sql = `
    INSERT INTO teachers (emp_id, name, email)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email)
  `;
  db.query(sql, [emp_id, name, email], (err) => {
    if (err) return res.status(500).send(err);
    res.send({ message: "Teacher saved" });
  });
});

// Login
app.post("/api/login", (req, res) => {
  const { id, role, password } = req.body;
  if (password !== "pass123") {
    return res.status(401).json({ success: false, message: "Wrong password" });
  }

  const table = role === "teacher" ? "teachers" : "students";
  const field = role === "teacher" ? "emp_id" : "reg_no";
  const sql = `SELECT * FROM ${table} WHERE ${field} = ?`;

  db.query(sql, [id], (err, rows) => {
    if (err) return res.status(500).send(err);
    if (rows.length === 0) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, user: rows[0] });
  });
});

// List students
app.get("/api/students", (_, res) => {
  db.query("SELECT * FROM students", (err, rows) => {
    if (err) return res.status(500).send(err);
    res.json(rows);
  });
});

// ---- Start Server ----
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
