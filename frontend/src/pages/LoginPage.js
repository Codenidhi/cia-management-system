import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser, clearError } from "../store/slices/authSlice";

const ROLES = ["student", "faculty", "admin"];
const ROLE_LABELS = { student: "Student", faculty: "Faculty", admin: "Admin" };
const ROLE_ICONS  = { student: "🎓",      faculty: "👨‍🏫",      admin: "🔐"  };

const DEMO_CREDS = {
  student: { email: "asha@student.edu",    password: "student123" },
  faculty: { email: "ramesh@college.edu",  password: "faculty123" },
  admin:   { email: "admin@college.edu",   password: "admin123"   },
};

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate  = useNavigate();
  const { user, loading, error } = useSelector((s) => s.auth);

  const [role,     setRole]     = useState("student");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [flash,    setFlash]    = useState(null); // { msg, type }
  const [visible,  setVisible]  = useState(false);

  // navigate on login success
  useEffect(() => {
    if (user) {
      showFlash("Login successful! Redirecting…", "success");
      setTimeout(() => {
        navigate(
          user.role === "admin"    ? "/admin"   :
          user.role === "faculty"  ? "/faculty" : "/student"
        );
      }, 800);
    }
  }, [user, navigate]);

  // show redux error as flash
  useEffect(() => {
    if (error) showFlash(error, "error");
  }, [error]);

  // reset on role change
  useEffect(() => {
    dispatch(clearError());
    setEmail("");
    setPassword("");
    setFlash(null);
    setVisible(false);
  }, [role, dispatch]);

  const showFlash = (msg, type) => {
    setFlash({ msg, type });
    setVisible(true);
    // auto-hide after 4 seconds
    setTimeout(() => setVisible(false), 4000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim())    { showFlash("Please enter your email address.", "warning"); return; }
    if (!password.trim()) { showFlash("Please enter your password.", "warning"); return; }
    dispatch(loginUser({ email, password, role }));
  };

  const fillDemo = () => {
    setEmail(DEMO_CREDS[role].email);
    setPassword(DEMO_CREDS[role].password);
    setFlash(null);
    setVisible(false);
  };

  const flashStyles = {
    success: { bg: "#e6f4ea", border: "#a8d5b5", color: "#1e6b3c", icon: "✅" },
    error:   { bg: "#fce8e8", border: "#f5b7b7", color: "#8B0000", icon: "❌" },
    warning: { bg: "#fff8e1", border: "#ffe082", color: "#7a5800", icon: "⚠️" },
  };

  const f = flash ? flashStyles[flash.type] : null;

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div style={{ fontSize: 48, marginBottom: 8 }}>🎓</div>
          <h1>CIA Management System</h1>
          <p>Postgraduate Centre</p>
        </div>

        {/* Role Tabs */}
        <div className="login-tabs">
          {ROLES.map((r) => (
            <button
              key={r}
              className={`login-tab ${role === r ? "active" : ""}`}
              onClick={() => setRole(r)}
            >
              {ROLE_ICONS[r]} {ROLE_LABELS[r]}
            </button>
          ))}
        </div>

        {/* ── FLASH MESSAGE ── */}
        {flash && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              padding: "12px 16px",
              marginBottom: 16,
              background: f.bg,
              border: `1px solid ${f.border}`,
              borderLeft: `4px solid ${f.color}`,
              borderRadius: 8,
              color: f.color,
              fontSize: 14,
              fontWeight: 500,
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(-8px)",
              transition: "opacity 0.35s ease, transform 0.35s ease",
              lineHeight: 1.4,
            }}
          >
            <span style={{ fontSize: 18, flexShrink: 0 }}>{f.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, marginBottom: 2 }}>
                {flash.type === "error"   ? "Login Failed"   :
                 flash.type === "warning" ? "Missing Field"  :
                 flash.type === "success" ? "Success"        : "Notice"}
              </div>
              <div style={{ fontSize: 13, opacity: 0.9 }}>{flash.msg}</div>
            </div>
            <button
              onClick={() => setVisible(false)}
              style={{ background: "none", border: "none", cursor: "pointer",
                       color: f.color, fontSize: 18, lineHeight: 1, flexShrink: 0, opacity: 0.7 }}
            >
              ×
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder={`Enter ${ROLE_LABELS[role]} email`}
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (flash?.type !== "success") setVisible(false); }}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (flash?.type !== "success") setVisible(false); }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: "100%", padding: "12px", fontSize: 15, marginTop: 4 }}
          >
            {loading ? "Signing in…" : `Sign In as ${ROLE_LABELS[role]}`}
          </button>
        </form>

        {/* Demo credentials */}
        <div style={{ marginTop: 20, padding: 14, background: "#fff5f5",
                      borderRadius: 8, border: "1px solid #f0d0d0" }}>
          <div style={{ fontSize: 12, color: "#800000", fontWeight: 600, marginBottom: 8 }}>
            🔑 Demo Credentials
          </div>
          <div style={{ fontSize: 12, color: "#666", lineHeight: 1.7 }}>
            <div>📧 <b>{DEMO_CREDS[role].email}</b></div>
            <div>🔒 <b>{DEMO_CREDS[role].password}</b></div>
          </div>
          <button
            onClick={fillDemo}
            style={{ marginTop: 8, padding: "5px 14px", background: "#800000",
                     color: "white", border: "none", borderRadius: 5,
                     cursor: "pointer", fontSize: 12 }}
          >
            Auto-fill Demo
          </button>
        </div>
      </div>
    </div>
  );
}