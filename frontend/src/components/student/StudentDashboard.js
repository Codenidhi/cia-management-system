import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStudentMarks } from "../../store/slices/marksSlice";

const PASS = 40; // 40% passing threshold

export default function StudentDashboard() {
  const dispatch = useDispatch();
  const { user }  = useSelector((s) => s.auth);
  const { studentMarks, loading } = useSelector((s) => s.marks);

  useEffect(() => {
    if (user?.usn) dispatch(fetchStudentMarks(user.usn));
  }, [user, dispatch]);

  // Support both field names: total (old) and marks_obtained (new)
  const getMarks   = (m) => Number(m.marks_obtained ?? m.total ?? 0);
  const getMax     = (m) => Number(m.max_marks ?? 30);
  const getPercent = (m) => {
    const max = getMax(m);
    return max > 0 ? ((getMarks(m) / max) * 100).toFixed(1) : '0.0';
  };

  const totalSubjects = studentMarks.length;
  const passed = studentMarks.filter((m) => parseFloat(getPercent(m)) >= PASS).length;
  const avgPct = totalSubjects > 0
    ? (studentMarks.reduce((acc, m) => acc + parseFloat(getPercent(m)), 0) / totalSubjects).toFixed(1)
    : 0;

  const getColor = (pct) => {
    if (pct >= 70) return "#660000";
    if (pct >= 40) return "#8B0000";
    return "#4d0000";
  };

  return (
    <div className="container">
      {/* Welcome */}
      <div className="welcome-card">
        <h1>Welcome, {user?.name}! 👋</h1>
        <p>View your Continuous Internal Assessment marks below.</p>
      </div>

      {/* Student Info */}
      <div className="card">
        <h2 style={{ color: "#800000", marginBottom: 16 }}>Student Information</h2>
        <div className="info-grid">
          <div className="info-item">
            <div className="info-item-label">USN</div>
            <div className="info-item-value">{user?.usn || "—"}</div>
          </div>
          <div className="info-item">
            <div className="info-item-label">Programme</div>
            <div className="info-item-value">{user?.programme || "—"}</div>
          </div>
          <div className="info-item">
            <div className="info-item-label">Semester</div>
            <div className="info-item-value">{user?.semester || "—"}</div>
          </div>
          <div className="info-item">
            <div className="info-item-label">Email</div>
            <div className="info-item-value" style={{ fontSize: 13 }}>{user?.email}</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-value">{totalSubjects}</div><div className="stat-label">Total Assessments</div></div>
        <div className="stat-card"><div className="stat-value">{avgPct}%</div><div className="stat-label">Average Percentage</div></div>
        <div className="stat-card"><div className="stat-value">{passed}</div><div className="stat-label">Passed</div></div>
        <div className="stat-card"><div className="stat-value">{totalSubjects - passed}</div><div className="stat-label">Failed</div></div>
      </div>

      {/* Marks Table */}
      <div className="card">
        <div className="card-header">
          <h2 style={{ color: "#800000" }}>My CIA Marks</h2>
          <span style={{ fontSize: 13, color: "#666" }}>Pass threshold: {PASS}%</span>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#800000" }}>Loading marks...</div>
        ) : totalSubjects === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#999" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <div>No marks entered yet. Please check back after your faculty enters marks.</div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Course Name</th>
                  <th>CIA Type</th>
                  <th style={{ textAlign: "center" }}>Marks</th>
                  <th style={{ textAlign: "center" }}>Max</th>
                  <th style={{ textAlign: "center" }}>Percentage</th>
                  <th style={{ textAlign: "center" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {studentMarks.map((m, i) => {
                  const marks    = getMarks(m);
                  const max      = getMax(m);
                  const pct      = getPercent(m);
                  const isPassed = parseFloat(pct) >= PASS;
                  const color    = getColor(parseFloat(pct));
                  return (
                    <tr key={m.marks_id || m.id || i}>
                      <td>{i + 1}</td>
                      <td style={{ fontWeight: 600 }}>{m.course_name}</td>
                      <td>
                        <span style={{ background: '#fff5f5', color: '#8B0000', border: '1px solid rgba(139,0,0,0.3)', padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>
                          {m.cia_type || 'CIA'}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <strong style={{ fontSize: 18, color }}>{marks}</strong>
                      </td>
                      <td style={{ textAlign: "center", color: "#666" }}>{max}</td>
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                          <div style={{ width: 60, height: 8, background: "#ffe4e4", borderRadius: 4, overflow: "hidden" }}>
                            <div style={{ width: `${Math.min(parseFloat(pct), 100)}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.5s" }} />
                          </div>
                          <span style={{ fontSize: 13, color, fontWeight: 600 }}>{pct}%</span>
                        </div>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span className={isPassed ? "badge-pass" : "badge-fail"}>
                          {isPassed ? "✅ Pass" : "❌ Fail"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ background: "#fff5f5", border: "1px solid #f0d0d0", borderLeft: "4px solid #800000", borderRadius: 8, padding: "14px 18px", fontSize: 13, color: "#800000" }}>
        <strong>ℹ️ Note:</strong> Marks are entered by your faculty. For queries, contact your department.
      </div>
    </div>
  );
}