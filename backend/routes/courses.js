const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authMiddleware } = require("../middleware/auth");

// GET /api/courses
router.get("/", authMiddleware, (req, res) => {
  db.query(
    `SELECT 
       c.id           AS course_id,
       c.course_code,
       c.course_name,
       c.semester,
       c.programme_id,
       p.name         AS programme_name,
       c.faculty_id,
       f.name         AS faculty_name
     FROM courses c
     LEFT JOIN programmes p ON c.programme_id = p.id
     LEFT JOIN faculty f    ON c.faculty_id   = f.id
     ORDER BY c.semester, c.course_name`,
    (err, results) => {
      if (err) return res.status(500).json({ success: false, message: "DB error: " + err.message });
      res.json({ success: true, data: results });
    }
  );
});

// POST /api/courses
router.post("/", authMiddleware, (req, res) => {
  const { course_code, course_name, programme_id, semester, faculty_id } = req.body;
  // support both course_code and code field names
  const code = course_code || req.body.code;
  const name = course_name || req.body.name;
  if (!name) return res.status(400).json({ success: false, message: "Course name required" });

  db.query(
    "INSERT INTO courses (course_code, course_name, programme_id, semester, faculty_id) VALUES (?,?,?,?,?)",
    [code || null, name, programme_id || null, semester || 1, faculty_id || null],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, message: "Error adding course: " + err.message });
      res.json({
        success: true,
        data: {
          course_id:    result.insertId,
          course_code:  code || '',
          course_name:  name,
          semester:     semester || 1,
          programme_id: programme_id || null,
          faculty_id:   faculty_id || null,
        }
      });
    }
  );
});

// DELETE /api/courses/:id
router.delete("/:id", authMiddleware, (req, res) => {
  db.query("DELETE FROM courses WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Error deleting" });
    res.json({ success: true });
  });
});

module.exports = router;