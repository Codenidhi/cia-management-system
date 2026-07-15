const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authMiddleware, requireRole } = require("../middleware/auth");

// GET /api/students
router.get("/", authMiddleware, (req, res) => {
  const courseId = req.query.course_id;

  let query, params;

  if (courseId) {
    // Faculty view — get students for this course's programme
    query = `
      SELECT s.id AS student_id, s.id AS id,
             s.name AS student_name, s.name AS name,
             s.usn, s.email, s.semester,
             p.name AS programme_name, s.programme_id
      FROM students s
      LEFT JOIN programmes p ON s.programme_id = p.id
      LEFT JOIN courses c ON c.programme_id = s.programme_id
      WHERE c.id = ?
      ORDER BY s.name
    `;
    params = [courseId];
  } else {
    // Admin view — all students
    query = `
      SELECT s.id AS student_id, s.id AS id,
             s.name AS student_name, s.name AS name,
             s.usn, s.email, s.semester,
             p.name AS programme_name, s.programme_id
      FROM students s
      LEFT JOIN programmes p ON s.programme_id = p.id
      ORDER BY s.name
    `;
    params = [];
  }

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "DB error: " + err.message });
    res.json({ success: true, data: results });
  });
});

// GET /api/students/:id
router.get("/:id", authMiddleware, (req, res) => {
  db.query(
    `SELECT s.id AS student_id, s.id AS id, s.name AS student_name,
            s.usn, s.email, s.semester, p.name AS programme_name
     FROM students s
     LEFT JOIN programmes p ON s.programme_id = p.id
     WHERE s.id = ?`,
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ success: false, message: "DB error" });
      if (results.length === 0) return res.status(404).json({ success: false, message: "Student not found" });
      res.json({ success: true, data: results[0] });
    }
  );
});

// POST /api/students (admin only)
router.post("/", authMiddleware, requireRole("admin"), (req, res) => {
  const name = req.body.student_name || req.body.name;
  const { usn, email, semester, programme_id, password } = req.body;

  if (!name || !usn || !email)
    return res.status(400).json({ success: false, message: "Name, USN and email are required" });

  db.query(
    "INSERT INTO students (name, usn, email, semester, programme_id) VALUES (?, ?, ?, ?, ?)",
    [name, usn, email, semester || 1, programme_id || null],
    (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY")
          return res.status(400).json({ success: false, message: "USN or email already exists" });
        return res.status(500).json({ success: false, message: "Error adding student: " + err.message });
      }

      const studentId = result.insertId;
      const loginPassword = password || "student123";

      db.query(
        "INSERT IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, 'student')",
        [name, email, loginPassword],
        (err2) => {
          if (err2) console.warn("Could not create user:", err2.message);
          res.json({
            success: true,
            message: `Student added. Login: ${email} / ${loginPassword}`,
            id: studentId,
            data: { student_id: studentId, id: studentId, student_name: name, usn, email, semester: semester || 1, programme_id: programme_id || null },
          });
        }
      );
    }
  );
});

// DELETE /api/students/:id (admin only)
router.delete("/:id", authMiddleware, requireRole("admin"), (req, res) => {
  db.query("DELETE FROM students WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Error deleting student" });
    res.json({ success: true });
  });
});

module.exports = router;

// PUT /api/students/:id (admin)
router.put("/:id", authMiddleware, requireRole("admin"), (req, res) => {
  const name = req.body.student_name || req.body.name;
  const { usn, email, semester, programme_id } = req.body;
  if (!name || !usn || !email)
    return res.status(400).json({ success: false, message: "Name, USN and email required" });
  db.query(
    "UPDATE students SET name=?, usn=?, email=?, semester=?, programme_id=? WHERE id=?",
    [name, usn, email, semester || 1, programme_id || null, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ success: false, message: "Error updating student" });
      res.json({ success: true, message: "Student updated successfully" });
    }
  );
});