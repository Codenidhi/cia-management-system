const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authMiddleware, requireRole } = require("../middleware/auth");

// GET /api/cia-marks  — admin view of all marks
router.get("/", authMiddleware, requireRole("admin", "faculty"), (req, res) => {
  db.query(
    `SELECT 
       cm.id               AS marks_id,
       cm.student_id,
       s.usn,
       s.name              AS student_name,
       cm.course_id,
       c.name              AS course_name,
       cm.cia_component_id AS cia_id,
       cc.type             AS cia_type,
       cm.marks_obtained,
       cc.max_marks
     FROM cia_marks_new cm
     JOIN students s       ON cm.student_id       = s.id
     JOIN courses c        ON cm.course_id         = c.id
     JOIN cia_components cc ON cm.cia_component_id = cc.id
     ORDER BY s.usn, c.name`,
    (err, results) => {
      if (err) return res.status(500).json({ success: false, message: "DB error: " + err.message });
      res.json({ success: true, data: results });
    }
  );
});

// POST /api/cia-marks  — add marks (admin or faculty)
router.post("/", authMiddleware, requireRole("admin", "faculty"), (req, res) => {
  const { student_id, course_id, cia_id, marks_obtained } = req.body;
  // Support both cia_id and cia_component_id field names
  const componentId = cia_id || req.body.cia_component_id;

  if (!student_id || !course_id || !componentId || marks_obtained === undefined) {
    return res.status(400).json({ success: false, message: "student_id, course_id, cia_id, marks_obtained all required" });
  }

  db.query("SELECT * FROM students WHERE id=?", [student_id], (err, students) => {
    if (err || students.length === 0)
      return res.status(400).json({ success: false, message: "Student not found" });

    const s = students[0];
    db.query(
      `INSERT INTO cia_marks_new (student_id, course_id, cia_component_id, usn, student_name, marks_obtained, entered_by)
       VALUES (?,?,?,?,?,?,?)`,
      [student_id, course_id, componentId, s.usn, s.name, marks_obtained, req.user?.id || 1],
      (err2, result) => {
        if (err2) return res.status(500).json({ success: false, message: "Error adding marks: " + err2.message });

        // Return full row so frontend state updates correctly
        db.query(
          `SELECT cm.id AS marks_id, cm.student_id, s.usn, s.name AS student_name,
                  cm.course_id, c.name AS course_name,
                  cm.cia_component_id AS cia_id, cc.type AS cia_type,
                  cm.marks_obtained, cc.max_marks
           FROM cia_marks_new cm
           JOIN students s        ON cm.student_id       = s.id
           JOIN courses c         ON cm.course_id        = c.id
           JOIN cia_components cc ON cm.cia_component_id = cc.id
           WHERE cm.id = ?`,
          [result.insertId],
          (err3, rows) => {
            if (err3 || rows.length === 0)
              return res.json({ success: true, data: { marks_id: result.insertId } });
            res.json({ success: true, data: rows[0] });
          }
        );
      }
    );
  });
});

// Keep /add as alias for backwards compat
router.post("/add", authMiddleware, requireRole("admin", "faculty"), (req, res, next) => {
  req.url = "/";
  next("route");
});

// PUT /api/cia-marks/:id  — edit marks
router.put("/:id", authMiddleware, requireRole("admin", "faculty"), (req, res) => {
  const { marks_obtained } = req.body;
  db.query(
    "UPDATE cia_marks_new SET marks_obtained=? WHERE id=?",
    [marks_obtained, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ success: false, message: "Error updating" });
      res.json({ success: true, data: { marks_id: parseInt(req.params.id), marks_obtained } });
    }
  );
});

// GET /api/cia-marks/student/:usn  — student view
router.get("/student/:usn", authMiddleware, (req, res) => {
  db.query(
    `SELECT cm.id AS marks_id, s.usn, s.name AS student_name,
            c.name AS course_name, c.code,
            cc.type AS cia_type, cc.max_marks, cc.weightage,
            cm.marks_obtained
     FROM cia_marks_new cm
     JOIN courses c         ON cm.course_id        = c.id
     JOIN cia_components cc ON cm.cia_component_id = cc.id
     JOIN students s        ON cm.student_id       = s.id
     WHERE cm.usn = ?
     ORDER BY c.name, cc.type`,
    [req.params.usn],
    (err, results) => {
      if (err) return res.status(500).json({ success: false, message: "DB error" });
      res.json({ success: true, data: results });
    }
  );
});

module.exports = router;