const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authMiddleware, requireRole } = require("../middleware/auth");

// GET /api/students
router.get("/", authMiddleware, requireRole("admin", "faculty"), (req, res) => {
  db.query(
    `SELECT 
       s.id           AS student_id,
       s.usn,
       s.name         AS student_name,
       s.email,
       s.semester,
       s.programme_id,
       p.name         AS programme_name
     FROM students s
     LEFT JOIN programmes p ON s.programme_id = p.id
     ORDER BY s.usn`,
    (err, results) => {
      if (err) return res.status(500).json({ success: false, message: "DB error" });
      res.json({ success: true, data: results });
    }
  );
});

// GET /api/students/:usn
router.get("/:usn", authMiddleware, (req, res) => {
  db.query(
    `SELECT s.id AS student_id, s.usn, s.name AS student_name, s.email, s.semester,
            s.programme_id, p.name AS programme_name
     FROM students s LEFT JOIN programmes p ON s.programme_id = p.id
     WHERE s.usn = ?`,
    [req.params.usn],
    (err, results) => {
      if (err) return res.status(500).json({ success: false, message: "DB error" });
      if (results.length === 0) return res.status(404).json({ success: false, message: "Student not found" });
      res.json({ success: true, data: results[0] });
    }
  );
});

// POST /api/students
router.post("/", authMiddleware, requireRole("admin"), (req, res) => {
  const { student_name, usn, email, semester, programme_id, dob, password } = req.body;
  const name = student_name || req.body.name;
  if (!usn || !name) return res.status(400).json({ success: false, message: "USN and name required" });

  db.query(
    "INSERT INTO students (usn, name, email, semester, programme_id, dob, password) VALUES (?,?,?,?,?,?,?)",
    [usn, name, email || null, semester || 1, programme_id || null, dob || null, password || null],
    (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") return res.status(400).json({ success: false, message: "USN already exists" });
        // If columns don't exist, try simpler insert
        db.query(
          "INSERT INTO students (usn, name, email, semester) VALUES (?,?,?,?)",
          [usn, name, email || null, semester || 1],
          (err2, result2) => {
            if (err2) return res.status(500).json({ success: false, message: "Error adding student: " + err2.message });
            res.json({ success: true, data: { student_id: result2.insertId, usn, student_name: name, email, semester } });
          }
        );
        return;
      }
      res.json({ success: true, data: { student_id: result.insertId, usn, student_name: name, email, semester } });
    }
  );
});

// DELETE /api/students/:id
router.delete("/:id", authMiddleware, requireRole("admin"), (req, res) => {
  db.query("DELETE FROM students WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Error deleting" });
    res.json({ success: true });
  });
});

module.exports = router;