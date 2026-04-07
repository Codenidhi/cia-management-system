const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authMiddleware, requireRole } = require("../middleware/auth");

// GET /api/faculty
router.get("/", authMiddleware, requireRole("admin"), (req, res) => {
  db.query(
    `SELECT 
       f.id              AS faculty_id,
       f.name            AS faculty_name,
       f.email,
       f.designation,
       f.department_id,
       d.name            AS department_name
     FROM faculty f
     LEFT JOIN departments d ON f.department_id = d.id
     ORDER BY f.name`,
    (err, results) => {
      if (err) return res.status(500).json({ success: false, message: "DB error: " + err.message });
      res.json({ success: true, data: results });
    }
  );
});

// POST /api/faculty
router.post("/", authMiddleware, requireRole("admin"), (req, res) => {
  const { faculty_name, email, department_id, designation, password } = req.body;
  const name = faculty_name || req.body.name;
  if (!name || !email)
    return res.status(400).json({ success: false, message: "Name and email required" });

  db.query(
    "INSERT INTO faculty (name, email, department_id, designation) VALUES (?, ?, ?, ?)",
    [name, email, department_id || null, designation || null],
    (err, result) => {
      if (err)
        return res.status(500).json({ success: false, message: "Error adding faculty: " + err.message });

      // Also add to users table for login
      if (password) {
        db.query(
          "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'faculty') ON DUPLICATE KEY UPDATE password=VALUES(password)",
          [name, email, password],
          () => {}
        );
      }

      // Fetch back with department name so frontend gets full object
      db.query(
        `SELECT f.id AS faculty_id, f.name AS faculty_name, f.email,
                f.designation, f.department_id, d.name AS department_name
         FROM faculty f
         LEFT JOIN departments d ON f.department_id = d.id
         WHERE f.id = ?`,
        [result.insertId],
        (err2, rows) => {
          if (err2 || rows.length === 0) {
            return res.json({
              success: true,
              data: {
                faculty_id:      result.insertId,
                faculty_name:    name,
                email,
                designation:     designation || null,
                department_id:   department_id || null,
                department_name: "",
              },
            });
          }
          res.json({ success: true, data: rows[0] });
        }
      );
    }
  );
});

// DELETE /api/faculty/:id
router.delete("/:id", authMiddleware, requireRole("admin"), (req, res) => {
  db.query("DELETE FROM faculty WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Error deleting" });
    res.json({ success: true });
  });
});

module.exports = router;