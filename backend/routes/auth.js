const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "cia_management_super_secret_key_2024";

router.post("/login", (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role)
    return res.json({ success: false, message: "All fields are required" });

  // Use LOWER() so "Admin" and "admin" both match
  db.query(
    "SELECT * FROM users WHERE LOWER(email) = LOWER(?) AND LOWER(role) = LOWER(?)",
    [email, role],
    (err, results) => {
      if (err) {
        console.error("Login DB error:", err);
        return res.json({ success: false, message: "Database error" });
      }

      if (results.length === 0) {
        // Extra debug: check if user exists at all with that email
        db.query("SELECT id, email, role FROM users WHERE LOWER(email) = LOWER(?)", [email], (err2, anyUser) => {
          if (anyUser && anyUser.length > 0) {
            console.log(`Login fail — user found but role mismatch. DB role: "${anyUser[0].role}", requested: "${role}"`);
            return res.json({ success: false, message: "Invalid email/password/role" });
          }
          console.log(`Login fail — no user found with email: ${email}`);
          return res.json({ success: false, message: "Invalid email/password/role" });
        });
        return;
      }

      const user = results[0];

      // Password check — plain text comparison (upgrade to bcrypt later)
      if (user.password !== password) {
        console.log(`Login fail — wrong password for: ${email}`);
        return res.json({ success: false, message: "Invalid email/password/role" });
      }

      const { password: _, ...safeUser } = user;

      // ── STUDENT ──────────────────────────────────────────────────
      if (role.toLowerCase() === "student") {
        db.query(
          `SELECT s.usn, s.semester, s.programme_id, p.name AS programme
           FROM students s
           LEFT JOIN programmes p ON s.programme_id = p.id
           WHERE LOWER(s.email) = LOWER(?)`,
          [email],
          (err2, sRows) => {
            const extra = sRows && sRows[0] ? sRows[0] : {};
            const token = jwt.sign(
              {
                id:           user.id,
                email:        user.email,
                role:         "student",
                name:         user.name,
                usn:          extra.usn          || null,
                semester:     extra.semester     || 1,
                programme_id: extra.programme_id || null,
                programme:    extra.programme    || null,
              },
              JWT_SECRET,
              { expiresIn: "24h" }
            );
            return res.json({
              success: true,
              token,
              user: {
                ...safeUser,
                role:         "student",
                usn:          extra.usn          || null,
                semester:     extra.semester     || 1,
                programme_id: extra.programme_id || null,
                programme:    extra.programme    || null,
              },
            });
          }
        );
        return;
      }

      // ── FACULTY ──────────────────────────────────────────────────
      if (role.toLowerCase() === "faculty") {
        db.query(
          "SELECT id, designation, department_id FROM faculty WHERE LOWER(email) = LOWER(?)",
          [email],
          (err2, fRows) => {
            const fac = fRows && fRows[0] ? fRows[0] : {};
            const token = jwt.sign(
              {
                id:            user.id,
                email:         user.email,
                role:          "faculty",
                name:          user.name,
                faculty_id:    fac.id            || null,
                designation:   fac.designation   || null,
                department_id: fac.department_id || null,
              },
              JWT_SECRET,
              { expiresIn: "24h" }
            );
            return res.json({
              success: true,
              token,
              user: {
                ...safeUser,
                role:        "faculty",
                faculty_id:  fac.id          || null,
                designation: fac.designation || null,
              },
            });
          }
        );
        return;
      }

      // ── ADMIN ────────────────────────────────────────────────────
      const token = jwt.sign(
        { id: user.id, email: user.email, role: "admin", name: user.name },
        JWT_SECRET,
        { expiresIn: "24h" }
      );
      return res.json({
        success: true,
        token,
        user: { ...safeUser, role: "admin" },
      });
    }
  );
});

// ── Helper route: check what users exist (remove after debugging) ──
// GET /api/auth/check-users
router.get("/check-users", (req, res) => {
  db.query("SELECT id, name, email, role FROM users ORDER BY role", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ users: results });
  });
});

module.exports = router;