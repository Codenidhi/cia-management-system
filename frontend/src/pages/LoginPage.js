import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser, clearError } from "../store/slices/authSlice";

const ROLES = ["student", "faculty", "admin"];
const ROLE_LABELS = { student: "Student", faculty: "Faculty", admin: "Admin" };
const ROLE_ICONS = { student: "🎓", faculty: "👨‍🏫", admin: "🔐" };

const DEMO_CREDS = {
  student: { email: "asha@student.edu", password: "student123" },
  faculty: { email: "ramesh@college.edu", password: "faculty123" },
  admin: { email: "admin@college.edu", password: "admin123" },
};

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((s) => s.auth);

  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (user) {
      navigate(user.role === "admin" ? "/admin" : user.role === "faculty" ? "/faculty" : "/student");
    }
  }, [user, navigate]);

  useEffect(() => {
    dispatch(clearError());
    setEmail("");
    setPassword("");
  }, [role, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password, role }));
  };

  const fillDemo = () => {
    setEmail(DEMO_CREDS[role].email);
    setPassword(DEMO_CREDS[role].password);
  };

  return (
    <div className="login-page">
      <div className="login-card">
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

        {error && <div className="alert alert-error">❌ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder={`Enter ${ROLE_LABELS[role]} email`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}
            style={{ width: "100%", padding: "12px", fontSize: 15, marginTop: 4 }}>
            {loading ? "Signing in..." : `Sign In as ${ROLE_LABELS[role]}`}
          </button>
        </form>

        {/* Demo credentials helper */}
        <div style={{ marginTop: 20, padding: "14px", background: "#fff5f5", borderRadius: 8, border: "1px solid #f0d0d0" }}>
          <div style={{ fontSize: 12, color: "#800000", fontWeight: 600, marginBottom: 8 }}>
            🔑 Demo Credentials
          </div>
          <div style={{ fontSize: 12, color: "#666", lineHeight: 1.7 }}>
            <div>📧 <b>{DEMO_CREDS[role].email}</b></div>
            <div>🔒 <b>{DEMO_CREDS[role].password}</b></div>
          </div>
          <button
            onClick={fillDemo}
            style={{ marginTop: 8, padding: "5px 14px", background: "#800000", color: "white", border: "none", borderRadius: 5, cursor: "pointer", fontSize: 12 }}
          >
            Auto-fill Demo
          </button>
        </div>
      </div>
    </div>
  );
}
