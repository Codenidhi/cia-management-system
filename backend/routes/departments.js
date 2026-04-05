const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authMiddleware, requireRole } = require("../middleware/auth");

// GET /api/departments
router.get("/", authMiddleware, (req, res) => {
  db.query(
    `SELECT 
       id          AS department_id,
       name        AS department_name,
       hod         AS hod_name,
       status
     FROM departments ORDER BY name`,
    (err, results) => {
      if (err) return res.status(500).json({ success: false, message: "DB error" });
      res.json({ success: true, data: results });
    }
  );
});

// POST /api/departments
router.post("/", authMiddleware, requireRole("admin"), (req, res) => {
  const { department_name, hod_name, status } = req.body;
  const name = department_name || req.body.name;
  const hod  = hod_name        || req.body.hod || null;
  if (!name) return res.status(400).json({ success: false, message: "Department name required" });

  db.query(
    "INSERT INTO departments (name, hod, status) VALUES (?, ?, ?)",
    [name, hod, status || "Active"],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, message: "Error adding department" });
      res.json({
        success: true,
        data: {
          department_id:   result.insertId,
          department_name: name,
          hod_name:        hod || '',
          status:          status || 'Active',
        }
      });
    }
  );
});

// PUT /api/departments/:id
router.put("/:id", authMiddleware, requireRole("admin"), (req, res) => {
  const { department_name, hod_name, status } = req.body;
  const name = department_name || req.body.name;
  const hod  = hod_name        || req.body.hod || null;

  db.query(
    "UPDATE departments SET name=?, hod=?, status=? WHERE id=?",
    [name, hod, status, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ success: false, message: "Error updating" });
      res.json({
        success: true,
        data: {
          department_id:   parseInt(req.params.id),
          department_name: name,
          hod_name:        hod || '',
          status,
        }
      });
    }
  );
});

// DELETE /api/departments/:id
router.delete("/:id", authMiddleware, requireRole("admin"), (req, res) => {
  db.query("DELETE FROM departments WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Error deleting" });
    res.json({ success: true });
  });
});

module.exports = router;