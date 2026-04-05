const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authMiddleware, requireRole } = require("../middleware/auth");

// GET /api/cia-components
router.get("/", authMiddleware, (req, res) => {
  db.query(
    `SELECT 
       id              AS cia_id,
       type            AS cia_type,
       max_marks,
       weightage,
       assessment_type
     FROM cia_components ORDER BY type`,
    (err, results) => {
      if (err) return res.status(500).json({ success: false, message: "DB error" });
      res.json({ success: true, data: results });
    }
  );
});

// POST /api/cia-components
router.post("/", authMiddleware, requireRole("admin"), (req, res) => {
  const { cia_type, max_marks, weightage, assessment_type } = req.body;
  const type = cia_type || req.body.type;
  if (!type || !max_marks) return res.status(400).json({ success: false, message: "CIA type and max_marks required" });

  db.query(
    "INSERT INTO cia_components (type, max_marks, weightage, assessment_type) VALUES (?,?,?,?)",
    [type, max_marks, weightage || 0, assessment_type || "Written"],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, message: "Error adding: " + err.message });
      res.json({
        success: true,
        data: {
          cia_id:          result.insertId,
          cia_type:        type,
          max_marks:       parseFloat(max_marks),
          weightage:       parseFloat(weightage) || 0,
          assessment_type: assessment_type || "Written",
        }
      });
    }
  );
});

// PUT /api/cia-components/:id
router.put("/:id", authMiddleware, requireRole("admin"), (req, res) => {
  const { cia_type, max_marks, weightage, assessment_type } = req.body;
  const type = cia_type || req.body.type;

  db.query(
    "UPDATE cia_components SET type=?, max_marks=?, weightage=?, assessment_type=? WHERE id=?",
    [type, max_marks, weightage, assessment_type, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ success: false, message: "Error updating" });
      res.json({
        success: true,
        data: {
          cia_id: parseInt(req.params.id),
          cia_type: type,
          max_marks: parseFloat(max_marks),
          weightage: parseFloat(weightage),
          assessment_type,
        }
      });
    }
  );
});

// DELETE /api/cia-components/:id
router.delete("/:id", authMiddleware, requireRole("admin"), (req, res) => {
  db.query("DELETE FROM cia_components WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Error deleting" });
    res.json({ success: true });
  });
});

module.exports = router;