const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authMiddleware, requireRole } = require("../middleware/auth");

// GET /api/faculty
router.get("/", authMiddleware, requireRole("admin"), (req, res) => {
  db.query(
    `SELECT f.id          AS faculty_id,
            f.name        AS faculty_name,
            f.email,
            f.designation,
            f.department_id,
            d.name        AS department_name
     FROM faculty f
     LEFT JOIN departments d ON f.department_id = d.id
     ORDER BY f.name`,
    (err, results) => {
      if (err) return res.status(500).json({ success: false, message: "DB error" });
      res.json({ success: true, data: results });
    }
  );
});

// POST /api/faculty (admin) — accepts faculty_name OR name
router.post("/", authMiddleware, requireRole("admin"), (req, res) => {
  const name        = req.body.faculty_name || req.body.name;
  const { email, designation, department_id, password } = req.body;

  if (!name || !email)
    return res.status(400).json({ success: false, message: "Name and email required" });

  db.query(
    "INSERT INTO faculty (name, email, designation, department_id) VALUES (?, ?, ?, ?)",
    [name, email, designation || null, department_id || null],
    (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY")
          return res.status(400).json({ success: false, message: "Email already exists" });
        return res.status(500).json({ success: false, message: "Error adding faculty: " + err.message });
      }

      const facultyId = result.insertId;
      const loginPassword = password || "faculty123";

      // Auto-create user account so faculty can login
      db.query(
        "INSERT IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, 'faculty')",
        [name, email, loginPassword],
        (err2) => {
          if (err2) console.warn("Could not create user for faculty:", err2.message);
          res.json({
            success: true,
            message: `Faculty added. Login: ${email} / ${loginPassword}`,
            id: facultyId,
            data: {
              faculty_id:     facultyId,
              faculty_name:   name,
              email,
              designation:    designation || null,
              department_id:  department_id || null,
            },
          });
        }
      );
    }
  );
});

// DELETE /api/faculty/:id (admin)
router.delete("/:id", authMiddleware, requireRole("admin"), (req, res) => {
  db.query("DELETE FROM faculty WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Error deleting faculty" });
    res.json({ success: true });
  });
});

module.exports = router;