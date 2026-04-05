const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const db = require("../config/db");

// ✅ POST /api/auth/login
router.post("/login", (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.json({ success: false, message: "All fields are required" });
  }

  db.query(
    "SELECT * FROM users WHERE email = ? AND role = ?",
    [email, role],
    (err, results) => {
      if (err) {
        console.error("DB error:", err);
        return res.json({ success: false, message: "Database error" });
      }

      if (results.length === 0) {
        return res.json({ success: false, message: "Invalid email/password/role" });
      }

      const user = results[0];

      // ✅ Plain text comparison (passwords updated in DB)
      if (user.password !== password) {
        return res.json({ success: false, message: "Invalid email/password/role" });
      }

      // ✅ Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        process.env.JWT_SECRET || "cia_management_super_secret_key_2024",
        { expiresIn: "24h" }
      );

      // ✅ Don't send password back to frontend
      const { password: _, ...safeUser } = user;

      res.json({ success: true, user: safeUser, token });
    }
  );
});

module.exports = router;