const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authMiddleware, requireRole } = require("../middleware/auth");

router.get("/", authMiddleware, (req, res) => {
  const role  = req.user ? req.user.role  : null;
  const email = req.user ? req.user.email : null;

  if (role === "faculty") {
    db.query("SELECT id FROM faculty WHERE email = ?", [email], (err, fac) => {
      if (err) { console.error("faculty lookup:", err); return res.status(500).json({ success: false, message: "DB error" }); }
      if (!fac || fac.length === 0) return res.json({ success: true, data: [] });
      const facultyId = fac[0].id;
      db.query(
        `SELECT c.id, c.course_name AS name, c.course_code AS code,
                c.semester, c.programme_id, c.faculty_id,
                p.name AS programme_name
         FROM courses c LEFT JOIN programmes p ON c.programme_id = p.id
         WHERE c.faculty_id = ? ORDER BY c.semester, c.course_name`,
        [facultyId],
        (err2, results) => {
          if (err2) { console.error("faculty courses:", err2); return res.status(500).json({ success: false, message: "DB error" }); }
          return res.json({ success: true, data: results || [] });
        }
      );
    });
    return;
  }

  if (role === "student") {
    const progId = req.user.programme_id || null;
    if (!progId) return res.json({ success: true, data: [] });
    db.query(
      `SELECT c.id, c.course_name AS name, c.course_code AS code,
              c.semester, c.programme_id, p.name AS programme_name
       FROM courses c LEFT JOIN programmes p ON c.programme_id = p.id
       WHERE c.programme_id = ? ORDER BY c.semester, c.course_name`,
      [progId],
      (err, results) => {
        if (err) { console.error("student courses:", err); return res.status(500).json({ success: false, message: "DB error" }); }
        return res.json({ success: true, data: results || [] });
      }
    );
    return;
  }

  // Admin
  db.query(
    `SELECT c.id, c.course_name AS name, c.course_code AS code,
            c.semester, c.programme_id, c.faculty_id,
            p.name AS programme_name, f.name AS faculty_name
     FROM courses c
     LEFT JOIN programmes p ON c.programme_id = p.id
     LEFT JOIN faculty f ON c.faculty_id = f.id
     ORDER BY p.name, c.semester, c.course_name`,
    (err, results) => {
      if (err) { console.error("admin courses:", err); return res.status(500).json({ success: false, message: "DB error" }); }
      return res.json({ success: true, data: results || [] });
    }
  );
});

router.post("/", authMiddleware, requireRole("admin"), (req, res) => {
  const name = req.body.course_name || req.body.name;
  const code = req.body.course_code || req.body.code || null;
  const { semester, programme_id, faculty_id } = req.body;
  if (!name) return res.status(400).json({ success: false, message: "Course name required" });
  db.query(
    "INSERT INTO courses (course_name, course_code, semester, programme_id, faculty_id) VALUES (?,?,?,?,?)",
    [name, code, semester || 1, programme_id || null, faculty_id || null],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, message: "Error adding course" });
      res.json({ success: true, data: { id: result.insertId, name, code, semester, programme_id, faculty_id } });
    }
  );
});

router.put("/:id", authMiddleware, requireRole("admin"), (req, res) => {
  const name = req.body.course_name || req.body.name;
  const code = req.body.course_code || req.body.code || null;
  const { semester, programme_id, faculty_id } = req.body;
  db.query(
    "UPDATE courses SET course_name=?, course_code=?, semester=?, programme_id=?, faculty_id=? WHERE id=?",
    [name, code, semester, programme_id || null, faculty_id || null, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ success: false, message: "Error updating" });
      res.json({ success: true });
    }
  );
});

router.delete("/:id", authMiddleware, requireRole("admin"), (req, res) => {
  db.query("DELETE FROM courses WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Error deleting" });
    res.json({ success: true });
  });
});

module.exports = router;