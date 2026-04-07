const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authMiddleware } = require("../middleware/auth");

// GET /api/cia-components
router.get("/", authMiddleware, (req, res) => {
  db.query(
    `SELECT 
       id,
       type,
       max_marks,
       weightage,
       assessment_type
     FROM cia_components 
     ORDER BY id`,
    (err, results) => {
      if (err) return res.status(500).json({ success: false, message: "DB error: " + err.message });
      res.json({ success: true, data: results });
    }
  );
});

module.exports = router;