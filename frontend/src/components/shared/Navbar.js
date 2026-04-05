import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../store/slices/authSlice";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  if (!user) return null;

  const roleLabel = { admin: "Admin 🔐", faculty: "Faculty 👨‍🏫", student: "Student 🎓" };
  const dashLabel = { admin: "Admin Dashboard", faculty: "Faculty Dashboard", student: "Student Dashboard" };

  return (
    <nav style={{
      background: "linear-gradient(135deg, #8B0000 0%, #660000 100%)",
      color: "white",
      padding: "15px 30px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      boxShadow: "0 4px 20px rgba(139,0,0,0.3)",
      position: "sticky",
      top: 0,
      zIndex: 999,
    }}>
      {/* Brand — single icon */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <span style={{ fontSize: 28 }}>🎓</span>
        <span style={{ fontSize: 22, fontWeight: 600, fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
          CIA Management - {dashLabel[user.role] || 'Dashboard'}
        </span>
      </div>

      {/* Right: user pill + logout */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ textAlign: "right", fontSize: "0.85rem" }}>
          <div style={{ fontWeight: 600 }}>{user.name}</div>
          <div style={{
            background: "rgba(255,255,255,0.2)",
            padding: "2px 10px",
            borderRadius: 12,
            fontSize: 11,
            marginTop: 2,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}>
            {roleLabel[user.role] || user.role}
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: "10px 24px",
            background: "white",
            color: "#8B0000",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
          onMouseOver={e => { e.currentTarget.style.background = "#fff5f5"; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseOut={e  => { e.currentTarget.style.background = "white";   e.currentTarget.style.transform = "translateY(0)"; }}
        >
          → Logout
        </button>
      </div>
    </nav>
  );
}