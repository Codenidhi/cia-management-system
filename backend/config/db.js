const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createPool({
  host:     process.env.DB_HOST || "localhost",
  user:     process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root@123",
  database: process.env.DB_NAME || "cia_new",
  port:     process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit:    2,
  queueLimit:         0,
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err.message);
  } else {
    console.log("✅ MySQL connected successfully");
    connection.release();
  }
});

module.exports = db;