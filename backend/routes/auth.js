const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "cia_management_super_secret_key_2024";

router.post("/login", (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role)
    return res.json({ success: false, message: "All fields are required" });

  db.query(
    "SELECT * FROM users WHERE email = ? AND role = ?",
    [email, role],
    (err, results) => {
      if (err) return res.json({ success: false, message: "Database error" });
      if (results.length === 0)
        return res.json({ success: false, message: "Invalid email/password/role" });

      const user = results[0];
      if (user.password !== password)
        return res.json({ success: false, message: "Invalid email/password/role" });

      const { password: _, ...safeUser } = user;

      // For students: get usn, semester, programme_id from students table
      if (role === "student") {
        db.query(
          `SELECT s.usn, s.semester, s.programme_id, p.name AS programme
           FROM students s
           LEFT JOIN programmes p ON s.programme_id = p.id
           WHERE s.email = ?`,
          [email],
          (err2, sRows) => {
            const extra = sRows && sRows[0] ? sRows[0] : {};
            const token = jwt.sign(
              {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name,
                usn: extra.usn || null,
                semester: extra.semester || 1,
                programme_id: extra.programme_id || null,
                programme: extra.programme || null,
              },
              JWT_SECRET,
              { expiresIn: "24h" }
            );
            res.json({
              success: true,
              token,
              user: {
                ...safeUser,
                usn: extra.usn || null,
                semester: extra.semester || 1,
                programme_id: extra.programme_id || null,
                programme: extra.programme || null,
              },
            });
          }
        );
        return;
      }

      // For faculty: get faculty.id so it can be used to filter courses
      if (role === "faculty") {
        db.query(
          "SELECT id, designation, department_id FROM faculty WHERE email = ?",
          [email],
          (err2, fRows) => {
            const fac = fRows && fRows[0] ? fRows[0] : {};
            const token = jwt.sign(
              {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name,
                faculty_id: fac.id || null,
                designation: fac.designation || null,
                department_id: fac.department_id || null,
              },
              JWT_SECRET,
              { expiresIn: "24h" }
            );
            res.json({
              success: true,
              token,
              user: {
                ...safeUser,
                faculty_id: fac.id || null,
                designation: fac.designation || null,
              },
            });
          }
        );
        return;
      }

      // Admin: simple token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: "24h" }
      );
      res.json({ success: true, token, user: safeUser });
    }
  );
});

module.exports = router;