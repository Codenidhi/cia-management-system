import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStudentMarks } from "../../store/slices/marksSlice";
import Courses from "./Courses";

export default function StudentDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { studentMarks, loading } = useSelector((s) => s.marks);
  const [view, setView] = useState("marks");

  useEffect(() => {
    if (user?.usn) dispatch(fetchStudentMarks(user.usn));
  }, [dispatch, user]);

  const tabs = [
    { id: "marks",   label: "📊 My CIA Marks" },
    { id: "courses", label: "📚 My Courses"   },
    { id: "profile", label: "👤 My Profile"   },
  ];

  return (
    <div className="container">
      <div className="welcome-card">
        <h1>Student Portal 🎓</h1>
        <p>
          Welcome, <strong>{user?.name}</strong>.
          {user?.programme && <> &nbsp;|&nbsp; Programme: <strong>{user.programme}</strong></>}
          {user?.usn       && <> &nbsp;|&nbsp; USN: <strong>{user.usn}</strong></>}
        </p>
      </div>

      <div className="tab-bar">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`tab-btn ${view === t.id ? "active" : ""}`}
            onClick={() => setView(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {view === "marks"   && <MarksView marks={studentMarks} loading={loading} />}
      {view === "courses" && <Courses />}
      {view === "profile" && <ProfileView user={user} />}
    </div>
  );
}

/* ── Marks Tab ─────────────────────────────────────────────────── */
function MarksView({ marks, loading }) {
  if (loading) {
    return (
      <div className="card" style={{ textAlign: "center", padding: 60, color: "#800000" }}>
        Loading your marks…
      </div>
    );
  }

  if (!marks || marks.length === 0) {
    return (
      <div className="card" style={{ textAlign: "center", padding: 60, color: "#aaa" }}>
        No marks entered yet. Check back after your faculty submits CIA marks.
      </div>
    );
  }

  // Helper: get marks_obtained whether backend sends "marks_obtained" or legacy "total"
  const getMo  = (m) => Number(m.marks_obtained ?? m.total ?? 0);
  const getMax = (m) => Number(m.max_marks || 30);
  const isPassed = (m) => {
    const mo  = getMo(m);
    const max = getMax(m);
    return max > 0 && mo >= Math.ceil(max * 0.5);
  };

  // Group marks by course
  const byCourse = marks.reduce((acc, m) => {
    const key = m.course_name || "Unknown";
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  const totalMarks = marks.reduce((s, m) => s + getMo(m), 0);
  const totalMax   = marks.reduce((s, m) => s + getMax(m), 0);
  const overallPct = totalMax > 0 ? Math.round((totalMarks / totalMax) * 100) : 0;
  const passCount  = marks.filter(isPassed).length;
  const failCount  = marks.length - passCount;

  return (
    <div className="card">
      <div className="card-header">
        <h2 style={{ color: "#800000" }}>📊 My CIA Marks</h2>
        <span style={{ fontSize: 13, color: "#666" }}>
          Overall: <strong style={{ color: "#800000" }}>{overallPct}%</strong>
        </span>
      </div>

      {/* Summary stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-value">{marks.length}</div>
          <div className="stat-label">Total Assessments</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: "#2e7d32" }}>{passCount}</div>
          <div className="stat-label">Passed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: "#c62828" }}>{failCount}</div>
          <div className="stat-label">Failed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{overallPct}%</div>
          <div className="stat-label">Overall %</div>
        </div>
      </div>

      {/* Per-course breakdown */}
      {Object.entries(byCourse).map(([course, courseMarks]) => {
        const cTotal = courseMarks.reduce((s, m) => s + getMo(m), 0);
        const cMax   = courseMarks.reduce((s, m) => s + getMax(m), 0);
        const cPct   = cMax > 0 ? Math.round((cTotal / cMax) * 100) : 0;

        return (
          <div key={course} style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between",
                          alignItems: "center", marginBottom: 10 }}>
              <h3 style={{ color: "#800000", fontSize: 15 }}>{course}</h3>
              <span style={{ fontSize: 13, color: "#555" }}>
                {cTotal}/{cMax} &nbsp;({cPct}%)
              </span>
            </div>

            {/* Progress bar */}
            <div style={{ height: 8, background: "#f0e0e0", borderRadius: 4, marginBottom: 12 }}>
              <div style={{
                height: "100%", borderRadius: 4,
                width: `${cPct}%`,
                background: cPct >= 50 ? "#2e7d32" : "#c62828",
                transition: "width 0.4s",
              }} />
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>CIA Component</th>
                    <th style={{ textAlign: "center" }}>Marks</th>
                    <th style={{ textAlign: "center" }}>Max</th>
                    <th style={{ textAlign: "center" }}>%</th>
                    <th style={{ textAlign: "center" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {courseMarks.map((m, i) => {
                    const mo  = getMo(m);
                    const max = getMax(m);
                    const pct = max > 0 ? Math.round((mo / max) * 100) : 0;
                    const pass = isPassed(m);
                    return (
                      <tr key={m.marks_id || i}>
                        <td style={{ fontWeight: 500 }}>
                          {m.cia_type || m.type || `CIA-${i + 1}`}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <strong style={{ color: pass ? "#2e7d32" : "#c62828" }}>{mo}</strong>
                        </td>
                        <td style={{ textAlign: "center", color: "#888" }}>{max}</td>
                        <td style={{ textAlign: "center" }}>{pct}%</td>
                        <td style={{ textAlign: "center" }}>
                          <span style={{
                            background: pass ? "#e6f4ea" : "#fce8e8",
                            color:      pass ? "#2e7d32" : "#c62828",
                            padding: "2px 10px", borderRadius: 12,
                            fontSize: 12, fontWeight: 600,
                          }}>
                            {pass ? "✅ Pass" : "❌ Fail"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Profile Tab ───────────────────────────────────────────────── */
function ProfileView({ user }) {
  const fields = [
    { label: "Full Name",  value: user?.name },
    { label: "Email",      value: user?.email },
    { label: "USN",        value: user?.usn },
    { label: "Programme",  value: user?.programme },
    { label: "Semester",   value: user?.semester },
    { label: "Role",       value: user?.role },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h2 style={{ color: "#800000" }}>👤 My Profile</h2>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 480 }}>
        {fields.map(({ label, value }) => (
          <div key={label} style={{ display: "flex", alignItems: "center",
                                    borderBottom: "1px solid #f5e0e0", paddingBottom: 12 }}>
            <span style={{ width: 140, fontSize: 13, color: "#888", fontWeight: 600 }}>
              {label}
            </span>
            <span style={{ fontSize: 14, color: "#333", fontWeight: 500 }}>
              {value || "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}