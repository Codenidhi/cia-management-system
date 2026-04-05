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
      if (err) {
        // Fallback if department_id column doesn't exist
        db.query("SELECT id AS faculty_id, name AS faculty_name, email, designation, department AS department_name FROM faculty ORDER BY name", (err2, r2) => {
          if (err2) return res.status(500).json({ success: false, message: "DB error" });
          res.json({ success: true, data: r2 });
        });
        return;
      }
      res.json({ success: true, data: results });
    }
  );
});

// POST /api/faculty
router.post("/", authMiddleware, requireRole("admin"), (req, res) => {
  const { faculty_name, email, designation, department_id, password } = req.body;
  const name = faculty_name || req.body.name;
  if (!name || !email) return res.status(400).json({ success: false, message: "Name and email required" });

  db.query(
    "INSERT INTO faculty (name, email, designation, department_id, password) VALUES (?,?,?,?,?)",
    [name, email, designation || null, department_id || null, password || null],
    (err, result) => {
      if (err) {
        // Fallback: simpler insert without department_id
        db.query(
          "INSERT INTO faculty (name, email, department) VALUES (?,?,?)",
          [name, email, req.body.department || "Computer Science"],
          (err2, r2) => {
            if (err2) return res.status(500).json({ success: false, message: "Error adding faculty: " + err2.message });
            res.json({ success: true, data: { faculty_id: r2.insertId, faculty_name: name, email } });
          }
        );
        return;
      }
      res.json({ success: true, data: { faculty_id: result.insertId, faculty_name: name, email, designation, department_id } });
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