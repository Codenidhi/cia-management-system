const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authMiddleware, requireRole } = require("../middleware/auth");

// GET /api/courses
router.get("/", authMiddleware, (req, res) => {
  db.query(
    `SELECT 
       c.id             AS course_id,
       c.code           AS course_code,
       c.name           AS course_name,
       c.semester,
       c.programme_id,
       p.name           AS programme_name,
       c.faculty_id,
       f.name           AS faculty_name
     FROM courses c
     LEFT JOIN programmes p ON c.programme_id = p.id
     LEFT JOIN faculty f    ON c.faculty_id   = f.id
     ORDER BY c.semester, c.name`,
    (err, results) => {
      if (err) {
        // Fallback: plain select
        db.query("SELECT id AS course_id, code AS course_code, name AS course_name, semester FROM courses ORDER BY name", (err2, r2) => {
          if (err2) return res.status(500).json({ success: false, message: "DB error" });
          res.json({ success: true, data: r2 });
        });
        return;
      }
      res.json({ success: true, data: results });
    }
  );
});

// POST /api/courses
router.post("/", authMiddleware, requireRole("admin"), (req, res) => {
  const { course_code, course_name, programme_id, semester, faculty_id } = req.body;
  const code = course_code || req.body.code;
  const name = course_name || req.body.name;
  if (!code || !name) return res.status(400).json({ success: false, message: "Course code and name required" });

  db.query(
    "INSERT INTO courses (code, name, programme_id, semester, faculty_id) VALUES (?,?,?,?,?)",
    [code, name, programme_id || null, semester || 1, faculty_id || null],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, message: "Error adding course: " + err.message });
      res.json({ success: true, data: { course_id: result.insertId, course_code: code, course_name: name, semester, programme_id, faculty_id } });
    }
  );
});

// DELETE /api/courses/:id
router.delete("/:id", authMiddleware, requireRole("admin"), (req, res) => {
  db.query("DELETE FROM courses WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Error deleting" });
    res.json({ success: true });
  });
});

module.exports = router;