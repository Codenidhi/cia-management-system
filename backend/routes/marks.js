const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authMiddleware, requireRole } = require("../middleware/auth");

// GET /api/marks/:course - get marks for a course (faculty/admin)
router.get("/:course", authMiddleware, (req, res) => {
  const course = decodeURIComponent(req.params.course);
  db.query(
    "SELECT * FROM cia_marks WHERE course_name = ? ORDER BY usn",
    [course],
    (err, results) => {
      if (err) return res.status(500).json({ success: false, message: "DB error" });
      res.json({ success: true, data: results });
    }
  );
});

// GET /api/marks/student/:usn - get all marks for a student
router.get("/student/:usn", authMiddleware, (req, res) => {
  db.query(
    "SELECT cm.*, c.code, c.credits FROM cia_marks cm LEFT JOIN courses c ON cm.course_id = c.id WHERE cm.usn = ? ORDER BY cm.course_name",
    [req.params.usn],
    (err, results) => {
      if (err) return res.status(500).json({ success: false, message: "DB error" });
      res.json({ success: true, data: results });
    }
  );
});

// POST /api/marks - save marks (faculty/admin)
router.post("/", authMiddleware, requireRole("faculty", "admin"), (req, res) => {
  const { course, students } = req.body;
  if (!course || !students || students.length === 0) {
    return res.status(400).json({ success: false, message: "Course and students required" });
  }

  // Get course id
  db.query("SELECT * FROM courses WHERE name = ?", [course], (err, courseRows) => {
    if (err) return res.status(500).json({ success: false, message: "DB error" });

    const courseId = courseRows.length > 0 ? courseRows[0].id : 1;
    let completed = 0;
    let hasError = false;

    students.forEach((student) => {
      if (student.total === "" || student.total === null) {
        completed++;
        if (completed === students.length && !hasError) {
          return res.json({ success: true, message: "Marks saved successfully" });
        }
        return;
      }

      // Get student id
      db.query("SELECT * FROM students WHERE usn = ?", [student.usn], (err2, studentRows) => {
        if (err2 || studentRows.length === 0) {
          completed++;
          return;
        }
        const studentId = studentRows[0].id;

        db.query(
          `INSERT INTO cia_marks (student_id, course_id, course_name, usn, student_name, total, entered_by)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE total = VALUES(total), updated_at = NOW()`,
          [studentId, courseId, course, student.usn, student.name, student.total, req.user.id],
          (err3) => {
            if (err3) hasError = true;
            completed++;
            if (completed === students.length) {
              if (hasError) return res.status(500).json({ success: false, message: "Some marks failed to save" });
              res.json({ success: true, message: "Marks saved successfully" });
            }
          }
        );
      });
    });
  });
});

module.exports = router;
