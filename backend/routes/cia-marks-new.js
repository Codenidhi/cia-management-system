const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authMiddleware, requireRole } = require("../middleware/auth");

// GET /api/cia-marks — admin/faculty view
router.get("/", authMiddleware, requireRole("admin", "faculty"), (req, res) => {
  db.query(
    `SELECT cm.id          AS marks_id,
            cm.student_id,
            cm.course_id,
            cm.cia_component_id,
            cm.marks_obtained,
            cm.usn,
            cm.student_name,
            c.course_name,
            cc.type        AS cia_type,
            cc.max_marks
     FROM cia_marks_new cm
     LEFT JOIN courses c        ON cm.course_id        = c.id
     LEFT JOIN cia_components cc ON cm.cia_component_id = cc.id
     ORDER BY cm.usn, c.course_name`,
    (err, results) => {
      if (err) { console.error("GET marks:", err); return res.status(500).json({ success: false, message: "DB error" }); }
      res.json({ success: true, data: results });
    }
  );
});

// POST /api/cia-marks/add — upsert marks
router.post("/add", authMiddleware, requireRole("admin", "faculty"), (req, res) => {
  const { student_id, course_id, cia_component_id, marks_obtained } = req.body;

  if (!student_id || !course_id || !cia_component_id || marks_obtained === undefined) {
    return res.status(400).json({ success: false, message: "All fields required" });
  }

  db.query("SELECT id, usn, name FROM students WHERE id = ?", [student_id], (err, students) => {
    if (err || !students || students.length === 0)
      return res.status(400).json({ success: false, message: "Student not found" });

    const s = students[0];
    db.query(
      `INSERT INTO cia_marks_new
         (student_id, course_id, cia_component_id, usn, student_name, marks_obtained, entered_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         marks_obtained = VALUES(marks_obtained),
         entered_by     = VALUES(entered_by)`,
      [student_id, course_id, cia_component_id, s.usn, s.name, marks_obtained, req.user.id],
      (err2, result) => {
        if (err2) {
          console.error("INSERT marks:", err2);
          return res.status(500).json({ success: false, message: "Error saving: " + err2.message });
        }
        res.json({ success: true, id: result.insertId || null });
      }
    );
  });
});

// PUT /api/cia-marks/:id — edit marks (admin)
router.put("/:id", authMiddleware, requireRole("admin", "faculty"), (req, res) => {
  const { marks_obtained } = req.body;
  const id = req.params.id;

  if (marks_obtained === undefined)
    return res.status(400).json({ success: false, message: "marks_obtained required" });

  db.query(
    "UPDATE cia_marks_new SET marks_obtained = ? WHERE id = ?",
    [marks_obtained, id],
    (err) => {
      if (err) { console.error("UPDATE marks:", err); return res.status(500).json({ success: false, message: "Error updating" }); }
      // Return updated row so frontend state updates correctly
      db.query(
        `SELECT cm.id AS marks_id, cm.student_id, cm.course_id, cm.cia_component_id,
                cm.marks_obtained, cm.usn, cm.student_name,
                c.course_name, cc.type AS cia_type, cc.max_marks
         FROM cia_marks_new cm
         LEFT JOIN courses c         ON cm.course_id        = c.id
         LEFT JOIN cia_components cc ON cm.cia_component_id = cc.id
         WHERE cm.id = ?`,
        [id],
        (err2, rows) => {
          if (err2 || !rows || rows.length === 0)
            return res.json({ success: true, data: { marks_id: parseInt(id), marks_obtained } });
          res.json({ success: true, data: rows[0] });
        }
      );
    }
  );
});

// GET /api/cia-marks/student/:usn — student view
router.get("/student/:usn", authMiddleware, (req, res) => {
  db.query(
    `SELECT cm.id          AS marks_id,
            cm.marks_obtained,
            cm.usn,
            c.course_name,
            cc.type        AS cia_type,
            cc.max_marks
     FROM cia_marks_new cm
     LEFT JOIN courses c         ON cm.course_id        = c.id
     LEFT JOIN cia_components cc ON cm.cia_component_id = cc.id
     WHERE cm.usn = ?
     ORDER BY c.course_name, cc.type`,
    [req.params.usn],
    (err, results) => {
      if (err) { console.error("student marks:", err); return res.status(500).json({ success: false, message: "DB error" }); }
      res.json({ success: true, data: results });
    }
  );
});

module.exports = router;