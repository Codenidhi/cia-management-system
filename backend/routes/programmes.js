const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authMiddleware, requireRole } = require("../middleware/auth");

// GET /api/programmes
router.get("/", authMiddleware, (req, res) => {
  db.query(
    `SELECT 
       p.id              AS programme_id,
       p.name            AS programme_name,
       p.department_id,
       d.name            AS department_name,
       p.duration,
       p.total_semesters,
       p.status
     FROM programmes p
     LEFT JOIN departments d ON p.department_id = d.id
     ORDER BY p.name`,
    (err, results) => {
      if (err) return res.status(500).json({ success: false, message: "DB error: " + err.message });
      res.json({ success: true, data: results });
    }
  );
});

// POST /api/programmes
router.post("/", authMiddleware, requireRole("admin"), (req, res) => {
  const { programme_name, department_id, duration, total_semesters, status } = req.body;
  const name = programme_name || req.body.name;
  if (!name) return res.status(400).json({ success: false, message: "Programme name required" });

  db.query(
    "INSERT INTO programmes (name, department_id, duration, total_semesters, status) VALUES (?,?,?,?,?)",
    [name, department_id || null, duration || 2, total_semesters || 4, status || "Active"],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, message: "Error adding programme: " + err.message });

      // Fetch back with department name
      db.query(
        `SELECT p.id AS programme_id, p.name AS programme_name, p.department_id,
                d.name AS department_name, p.duration, p.total_semesters, p.status
         FROM programmes p LEFT JOIN departments d ON p.department_id = d.id
         WHERE p.id = ?`,
        [result.insertId],
        (err2, rows) => {
          if (err2 || rows.length === 0)
            return res.json({ success: true, data: { programme_id: result.insertId, programme_name: name } });
          res.json({ success: true, data: rows[0] });
        }
      );
    }
  );
});

// PUT /api/programmes/:id
router.put("/:id", authMiddleware, requireRole("admin"), (req, res) => {
  const { programme_name, department_id, duration, total_semesters, status } = req.body;
  const name = programme_name || req.body.name;

  db.query(
    "UPDATE programmes SET name=?, department_id=?, duration=?, total_semesters=?, status=? WHERE id=?",
    [name, department_id, duration, total_semesters, status, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ success: false, message: "Error updating" });

      db.query(
        `SELECT p.id AS programme_id, p.name AS programme_name, p.department_id,
                d.name AS department_name, p.duration, p.total_semesters, p.status
         FROM programmes p LEFT JOIN departments d ON p.department_id = d.id
         WHERE p.id = ?`,
        [req.params.id],
        (err2, rows) => {
          if (err2 || rows.length === 0) return res.json({ success: true });
          res.json({ success: true, data: rows[0] });
        }
      );
    }
  );
});

// DELETE /api/programmes/:id
router.delete("/:id", authMiddleware, requireRole("admin"), (req, res) => {
  db.query("DELETE FROM programmes WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Error deleting" });
    res.json({ success: true });
  });
});

module.exports = router;