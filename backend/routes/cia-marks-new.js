const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authMiddleware, requireRole } = require("../middleware/auth");

router.get("/", authMiddleware, requireRole("admin", "faculty"), (req, res) => {
  db.query(
    `SELECT cm.id, cm.student_id, cm.course_id, cm.cia_component_id,
            cm.marks_obtained, cm.usn, cm.student_name,
            c.course_name, cc.type AS cia_type, cc.max_marks
     FROM cia_marks_new cm
     LEFT JOIN courses c ON cm.course_id = c.id
     LEFT JOIN cia_components cc ON cm.cia_component_id = cc.id
     ORDER BY cm.usn, c.course_name`,
    (err, results) => {
      if (err) return res.status(500).json({ success: false, message: "DB error" });
      res.json({ success: true, data: results });
    }
  );
});

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
         entered_by = VALUES(entered_by)`,
      [student_id, course_id, cia_component_id, s.usn, s.name, marks_obtained, req.user.id],
      (err2, result) => {
        if (err2) return res.status(500).json({ success: false, message: "Error: " + err2.message });
        res.json({ success: true, id: result.insertId || null });
      }
    );
  });
});

router.put("/:id", authMiddleware, requireRole("admin", "faculty"), (req, res) => {
  const { marks_obtained } = req.body;
  db.query("UPDATE cia_marks_new SET marks_obtained = ? WHERE id = ?",
    [marks_obtained, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ success: false, message: "Error updating" });
      res.json({ success: true });
    }
  );
});

router.get("/student/:usn", authMiddleware, (req, res) => {
  db.query(
    `SELECT cm.id, cm.marks_obtained, cm.usn,
            c.course_name, cc.type AS cia_type, cc.max_marks
     FROM cia_marks_new cm
     LEFT JOIN courses c ON cm.course_id = c.id
     LEFT JOIN cia_components cc ON cm.cia_component_id = cc.id
     WHERE cm.usn = ?
     ORDER BY c.course_name, cc.type`,
    [req.params.usn],
    (err, results) => {
      if (err) return res.status(500).json({ success: false, message: "DB error" });
      res.json({ success: true, data: results });
    }
  );
});

module.exports = router;