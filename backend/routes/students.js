const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authMiddleware, requireRole } = require("../middleware/auth");

// GET /api/students
// - ?course_id=X  → returns students in that course's programme (for faculty)
// - no filter     → all students (admin)
router.get("/", authMiddleware, requireRole("admin", "faculty"), (req, res) => {
  const { course_id } = req.query;

  if (course_id) {
    // Get programme_id from the course, then get matching students
    db.query(
      "SELECT programme_id FROM courses WHERE id = ?",
      [course_id],
      (err, courses) => {
        if (err) return res.status(500).json({ success: false, message: "DB error" });
        if (!courses || courses.length === 0)
          return res.json({ success: true, data: [] });

        const programme_id = courses[0].programme_id;
        db.query(
          `SELECT s.id, s.usn, s.name, s.email, s.semester, s.programme_id,
                  p.name AS programme_name
           FROM students s
           LEFT JOIN programmes p ON s.programme_id = p.id
           WHERE s.programme_id = ?
           ORDER BY s.usn`,
          [programme_id],
          (err2, results) => {
            if (err2) return res.status(500).json({ success: false, message: "DB error" });
            res.json({ success: true, data: results });
          }
        );
      }
    );
    return;
  }

  // Admin: all students
  db.query(
    `SELECT s.id, s.usn, s.name, s.email, s.semester, s.programme_id,
            p.name AS programme_name
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
    "SELECT * FROM students WHERE usn = ?",
    [req.params.usn],
    (err, results) => {
      if (err) return res.status(500).json({ success: false, message: "DB error" });
      if (results.length === 0)
        return res.status(404).json({ success: false, message: "Student not found" });
      res.json({ success: true, data: results[0] });
    }
  );
});

// POST /api/students  (admin)
// Auto-creates a user account so the student can log in immediately
router.post("/", authMiddleware, requireRole("admin"), (req, res) => {
  const { usn, name, email, semester, programme_id } = req.body;
  if (!usn || !name || !email)
    return res.status(400).json({ success: false, message: "USN, name and email required" });

  // 1. Insert into students table
  db.query(
    "INSERT INTO students (usn, name, email, semester, programme_id) VALUES (?, ?, ?, ?, ?)",
    [usn, name, email, semester || 1, programme_id || null],
    (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY")
          return res.status(400).json({ success: false, message: "USN or email already exists" });
        return res.status(500).json({ success: false, message: "Error adding student" });
      }

      const studentId = result.insertId;

      // 2. Auto-create user account (password = student123, or usn as fallback)
      db.query(
        "INSERT IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, 'student')",
        [name, email, "student123"],
        (err2) => {
          // If user creation fails we still return success — student row exists
          if (err2) console.warn("Could not create user for student:", err2.message);
          res.json({
            success: true,
            message: "Student added. Login: " + email + " / student123",
            id: studentId,
          });
        }
      );
    }
  );
});

// PUT /api/students/:id  (admin)
router.put("/:id", authMiddleware, requireRole("admin"), (req, res) => {
  const { name, email, semester, programme_id } = req.body;
  db.query(
    "UPDATE students SET name=?, email=?, semester=?, programme_id=? WHERE id=?",
    [name, email, semester, programme_id || null, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ success: false, message: "Error updating student" });
      res.json({ success: true });
    }
  );
});

// DELETE /api/students/:id  (admin)
router.delete("/:id", authMiddleware, requireRole("admin"), (req, res) => {
  db.query("DELETE FROM students WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Error deleting student" });
    res.json({ success: true });
  });
});

module.exports = router;