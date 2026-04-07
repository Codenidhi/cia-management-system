const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const db = require("../config/db");

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.json({ success: false, message: "All fields are required" });
  }

  // Get user with student/faculty extra info via JOIN
  const query = `
    SELECT 
      u.id, u.name, u.email, u.role, u.password,
      s.usn,
      s.semester,
      p.name AS programme
    FROM users u
    LEFT JOIN students s  ON u.email = s.email
    LEFT JOIN programmes p ON s.programme_id = p.id
    WHERE u.email = ? AND u.role = ?
  `;

  db.query(query, [email, role], (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.json({ success: false, message: "Database error" });
    }

    if (results.length === 0) {
      return res.json({ success: false, message: "Invalid email/password/role" });
    }

    const user = results[0];

    // Plain text password check
    if (user.password !== password) {
      return res.json({ success: false, message: "Invalid email/password/role" });
    }

    // Build token payload with all needed fields
    const payload = {
      id:         user.id,
      name:       user.name,
      email:      user.email,
      role:       user.role,
      usn:        user.usn        || null,
      semester:   user.semester   || null,
      programme:  user.programme  || null,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || "cia_management_super_secret_key_2024",
      { expiresIn: "24h" }
    );

    // Don't send password back
    const { password: _, ...safeUser } = user;

    res.json({ success: true, user: { ...safeUser, ...payload }, token });
  });
});

module.exports = router;