const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use((req, res, next) => { console.log(`${req.method} ${req.path}`); next(); });

app.get("/", (req, res) => res.json({ message: "CIA Management System API ✅" }));

// ✅ All routes
app.use("/api/auth",           require("./routes/auth"));
app.use("/api/marks",          require("./routes/marks"));
app.use("/api/students",       require("./routes/students"));
app.use("/api/faculty",        require("./routes/faculty"));
app.use("/api/courses",        require("./routes/courses"));
app.use("/api/departments",    require("./routes/departments"));
app.use("/api/programmes",     require("./routes/programmes"));
app.use("/api/cia-components", require("./routes/cia-components"));
app.use("/api/cia-marks",      require("./routes/cia-marks-new"));

app.get("/", (req, res) => {
  res.send("CIA Backend Running Successfully 🚀");
});

// 404
app.use((req, res) =>
  res.status(404).json({ success: false, message: `Route ${req.path} not found` })
);

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

// Render port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});