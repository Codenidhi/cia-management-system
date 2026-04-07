const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authMiddleware, requireRole } = require("../middleware/auth");

router.get("/", authMiddleware, (req, res) => {
  db.query(
    `SELECT p.id AS programme_id, p.name AS programme_name,
            p.department_id, d.name AS department_name,
            p.duration, p.total_semesters, p.status
     FROM programmes p
     LEFT JOIN departments d ON p.department_id = d.id
     ORDER BY p.name`,
    (err, results) => {
      if (err) return res.status(500).json({ success: false, message: "DB error" });
      res.json({ success: true, data: results });
    }
  );
});

router.post("/", authMiddleware, requireRole("admin"), (req, res) => {
  const name = req.body.programme_name || req.body.name;
  const { department_id, duration, total_semesters } = req.body;
  const status = req.body.status || "Active";
  if (!name) return res.status(400).json({ success: false, message: "Programme name required" });

  db.query(
    "INSERT INTO programmes (name, department_id, duration, total_semesters, status) VALUES (?,?,?,?,?)",
    [name, department_id || null, duration || 2, total_semesters || 4, status],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, message: "Error adding: " + err.message });
      db.query(
        `SELECT p.id AS programme_id, p.name AS programme_name, p.department_id,
                d.name AS department_name, p.duration, p.total_semesters, p.status
         FROM programmes p LEFT JOIN departments d ON p.department_id = d.id
         WHERE p.id = ?`,
        [result.insertId],
        (err2, rows) => {
          if (err2 || !rows || rows.length === 0)
            return res.json({ success: true, data: { programme_id: result.insertId, programme_name: name, status } });
          res.json({ success: true, data: rows[0] });
        }
      );
    }
  );
});

router.put("/:id", authMiddleware, requireRole("admin"), (req, res) => {
  const name   = req.body.programme_name || req.body.name;
  const status = req.body.status || "Active"; // ← default to Active if not sent
  const { department_id, duration, total_semesters } = req.body;

  db.query(
    "UPDATE programmes SET name=?, department_id=?, duration=?, total_semesters=?, status=? WHERE id=?",
    [name, department_id || null, duration, total_semesters, status, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ success: false, message: "Error updating" });
      db.query(
        `SELECT p.id AS programme_id, p.name AS programme_name, p.department_id,
                d.name AS department_name, p.duration, p.total_semesters, p.status
         FROM programmes p LEFT JOIN departments d ON p.department_id = d.id
         WHERE p.id = ?`,
        [req.params.id],
        (err2, rows) => {
          if (err2 || !rows || rows.length === 0) return res.json({ success: true });
          res.json({ success: true, data: rows[0] });
        }
      );
    }
  );
});

router.delete("/:id", authMiddleware, requireRole("admin"), (req, res) => {
  db.query("DELETE FROM programmes WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Error deleting" });
    res.json({ success: true });
  });
});

module.exports = router;