const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authMiddleware, requireRole } = require("../middleware/auth");

// GET /api/courses
// - faculty: only courses assigned to them (faculty_id match)
// - student: only courses for their programme
// - admin:   all courses
router.get("/", authMiddleware, (req, res) => {
  const { role, email, programme_id: studentProgrammeId } = req.user;

  if (role === "faculty") {
    // Look up faculty.id via email, then filter courses by faculty_id
    db.query("SELECT id FROM faculty WHERE email = ?", [email], (err, fac) => {
      if (err) return res.status(500).json({ success: false, message: "DB error" });
      if (!fac || fac.length === 0)
        return res.json({ success: true, data: [] });

      db.query(
        `SELECT c.id, c.course_name AS name, c.course_code AS code,
                c.semester, c.programme_id, c.faculty_id,
                p.name AS programme_name
         FROM courses c
         LEFT JOIN programmes p ON c.programme_id = p.id
         WHERE c.faculty_id = ?
         ORDER BY c.semester, c.course_name`,
        [fac[0].id],
        (err2, results) => {
          if (err2) return res.status(500).json({ success: false, message: "DB error" });
          res.json({ success: true, data: results });
        }
      );
    });
    return;
  }

  if (role === "student") {
    // Use programme_id from JWT token (set at login)
    const progId = req.query.programme_id || studentProgrammeId;
    if (!progId) return res.json({ success: true, data: [] });

    db.query(
      `SELECT c.id, c.course_name AS name, c.course_code AS code,
              c.semester, c.programme_id,
              p.name AS programme_name
       FROM courses c
       LEFT JOIN programmes p ON c.programme_id = p.id
       WHERE c.programme_id = ?
       ORDER BY c.semester, c.course_name`,
      [progId],
      (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "DB error" });
        res.json({ success: true, data: results });
      }
    );
    return;
  }

  // Admin: all courses with programme and faculty info
  db.query(
    `SELECT c.id, c.course_name AS name, c.course_code AS code,
            c.semester, c.programme_id, c.faculty_id,
            p.name AS programme_name,
            f.name AS faculty_name
     FROM courses c
     LEFT JOIN programmes p ON c.programme_id = p.id
     LEFT JOIN faculty f ON c.faculty_id = f.id
     ORDER BY p.name, c.semester, c.course_name`,
    (err, results) => {
      if (err) return res.status(500).json({ success: false, message: "DB error" });
      res.json({ success: true, data: results });
    }
  );
});

// POST /api/courses  (admin only)
router.post("/", authMiddleware, requireRole("admin"), (req, res) => {
  const { course_name, course_code, semester, programme_id, faculty_id } = req.body;
  const name = course_name || req.body.name;
  const code = course_code || req.body.code || null;
  if (!name) return res.status(400).json({ success: false, message: "Course name required" });

  db.query(
    "INSERT INTO courses (course_name, course_code, semester, programme_id, faculty_id) VALUES (?,?,?,?,?)",
    [name, code, semester || 1, programme_id || null, faculty_id || null],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, message: "Error adding course" });
      res.json({
        success: true,
        data: {
          id: result.insertId,
          name,
          code,
          semester: semester || 1,
          programme_id: programme_id || null,
          faculty_id: faculty_id || null,
        },
      });
    }
  );
});

// PUT /api/courses/:id  (admin only)
router.put("/:id", authMiddleware, requireRole("admin"), (req, res) => {
  const { course_name, course_code, semester, programme_id, faculty_id } = req.body;
  const name = course_name || req.body.name;
  const code = course_code || req.body.code || null;

  db.query(
    "UPDATE courses SET course_name=?, course_code=?, semester=?, programme_id=?, faculty_id=? WHERE id=?",
    [name, code, semester, programme_id || null, faculty_id || null, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ success: false, message: "Error updating" });
      res.json({ success: true });
    }
  );
});

// DELETE /api/courses/:id  (admin only)
router.delete("/:id", authMiddleware, requireRole("admin"), (req, res) => {
  db.query("DELETE FROM courses WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Error deleting" });
    res.json({ success: true });
  });
});

module.exports = router;