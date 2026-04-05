// backend/routes/debug.js
// Step 1: copy to backend/routes/debug.js
// Step 2: add to server.js -> app.use("/api/debug", require("./routes/debug"));
// Step 3: visit http://localhost:5000/api/debug/schema
// Step 4: DELETE this file once done

const express = require("express");
const router  = express.Router();

let db;
try { db = require("../config/db"); }
catch(e) { try { db = require("../config/database"); } catch(e2) {} }

router.get("/schema", async (req, res) => {
  if (!db) return res.status(500).json({ error: "Cannot import db — check path" });
  const tables = ["departments","programmes","students","faculty","courses","cia_components","cia_marks"];
  const out = {};
  for (const t of tables) {
    try {
      const [rows] = await db.query("SELECT * FROM ?? LIMIT 1", [t]);
      out[t] = { columns: rows[0] ? Object.keys(rows[0]) : [], sample: rows[0] || null };
    } catch(e) { out[t] = { error: e.message }; }
  }
  res.json(out);
});

module.exports = router;