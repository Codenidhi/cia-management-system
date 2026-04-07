const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authMiddleware, requireRole } = require("../middleware/auth");

// GET /api/marks?course=courseName — get marks for a course (faculty view)
router.get("/", authMiddleware, (req, res) => {
  const course = req.query.course;
  if (!course) {
    // Return all marks
    db.query(
      `SELECT cm.id AS marks_id, cm.student_id, s.usn, s.name AS student_name,
              cm.course_id, c.course_name, cc.type AS cia_type, cc.max_marks,
              cm.marks_obtained AS total
       FROM cia_marks_new cm
       JOIN students s        ON cm.student_id       = s.id
       JOIN courses c         ON cm.course_id        = c.id
       JOIN cia_components cc ON cm.cia_component_id = cc.id
       ORDER BY s.usn`,
      (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "DB error: " + err.message });
        res.json({ success: true, data: results });
      }
    );
    return;
  }

  db.query(
    `SELECT cm.id, s.usn, s.name AS student_name, cm.marks_obtained AS total,
            c.course_name, cc.type AS cia_type, cc.max_marks
     FROM cia_marks_new cm
     JOIN students s        ON cm.student_id       = s.id
     JOIN courses c         ON cm.course_id        = c.id
     JOIN cia_components cc ON cm.cia_component_id = cc.id
     WHERE c.course_name = ?
     ORDER BY s.usn`,
    [course],
    (err, results) => {
      if (err) return res.status(500).json({ success: false, message: "DB error: " + err.message });
      res.json({ success: true, data: results });
    }
  );
});

// GET /api/marks/student/:usn — get all marks for a student
router.get("/student/:usn", authMiddleware, (req, res) => {
  db.query(
    `SELECT cm.id AS marks_id, s.usn, s.name AS student_name,
            c.course_name, cc.type AS cia_type, cc.max_marks,
            cm.marks_obtained AS total
     FROM cia_marks_new cm
     JOIN students s        ON cm.student_id       = s.id
     JOIN courses c         ON cm.course_id        = c.id
     JOIN cia_components cc ON cm.cia_component_id = cc.id
     WHERE s.usn = ?
     ORDER BY c.course_name, cc.type`,
    [req.params.usn],
    (err, results) => {
      if (err) return res.status(500).json({ success: false, message: "DB error: " + err.message });
      res.json({ success: true, data: results });
    }
  );
});

// POST /api/marks — save marks for multiple students (faculty enters marks)
router.post("/", authMiddleware, requireRole("faculty", "admin"), (req, res) => {
  const { course, students } = req.body;
  if (!course || !students || students.length === 0) {
    return res.status(400).json({ success: false, message: "Course and students required" });
  }

  // Get course id
  db.query("SELECT id FROM courses WHERE course_name = ?", [course], (err, courseRows) => {
    if (err) return res.status(500).json({ success: false, message: "DB error" });

    const courseId = courseRows.length > 0 ? courseRows[0].id : null;
    if (!courseId) return res.status(400).json({ success: false, message: `Course '${course}' not found` });

    // Get first CIA component as default
    db.query("SELECT id, max_marks FROM cia_components LIMIT 1", (err2, ciaRows) => {
      if (err2) return res.status(500).json({ success: false, message: "DB error" });

      const ciaId   = ciaRows.length > 0 ? ciaRows[0].id       : 1;
      const maxMarks = ciaRows.length > 0 ? ciaRows[0].max_marks : 30;

      const withMarks = students.filter((s) => s.total !== "" && s.total !== null && s.total !== undefined);
      if (withMarks.length === 0) {
        return res.json({ success: true, message: "No marks to save" });
      }

      let completed = 0;
      let hasError  = false;

      withMarks.forEach((student) => {
        // Get student id by USN
        db.query("SELECT id FROM students WHERE usn = ?", [student.usn], (err3, studentRows) => {
          if (err3 || studentRows.length === 0) {
            completed++;
            if (completed === withMarks.length) {
              res.json({ success: true, message: "Marks saved (some students not found)" });
            }
            return;
          }

          const studentId = studentRows[0].id;

          // Insert or update marks in cia_marks_new
          db.query(
            `INSERT INTO cia_marks_new (student_id, course_id, cia_component_id, usn, student_name, marks_obtained, entered_by)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE marks_obtained = VALUES(marks_obtained)`,
            [studentId, courseId, ciaId, student.usn, student.name, student.total, req.user?.id || 1],
            (err4) => {
              if (err4) hasError = true;
              completed++;
              if (completed === withMarks.length) {
                if (hasError) {
                  return res.status(500).json({ success: false, message: "Some marks failed to save" });
                }
                res.json({ success: true, message: `${completed} marks saved successfully` });
              }
            }
          );
        });
      });
    });
  });
});

module.exports = router;