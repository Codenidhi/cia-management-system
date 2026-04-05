import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStudentMarks } from "../../store/slices/marksSlice";

const MAX = 30;
const PASS = 15;

export default function StudentDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { studentMarks, loading } = useSelector((s) => s.marks);

  useEffect(() => {
    if (user?.usn) dispatch(fetchStudentMarks(user.usn));
  }, [user, dispatch]);

  const totalSubjects = studentMarks.length;
  const passed = studentMarks.filter((m) => Number(m.total) >= PASS).length;
  const avgPct = totalSubjects > 0
    ? ((studentMarks.reduce((acc, m) => acc + Number(m.total || 0), 0) / (totalSubjects * MAX)) * 100).toFixed(1)
    : 0;

  const getColor = (total) => {
    const pct = (total / MAX) * 100;
    if (pct >= 70) return "#2e7d32";
    if (pct >= 50) return "#e65100";
    return "#c62828";
  };

  return (
    <div className="container">
      {/* Welcome */}
      <div className="welcome-card">
        <h1>Welcome, {user?.name}! 👋</h1>
        <p>View your MCA Continuous Internal Assessment marks below.</p>
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
            <div className="info-item-value">{user?.programme || "MCA"}</div>
          </div>
          <div className="info-item">
            <div className="info-item-label">Semester</div>
            <div className="info-item-value">{user?.semester || 1}</div>
          </div>
          <div className="info-item">
            <div className="info-item-label">Email</div>
            <div className="info-item-value" style={{ fontSize: 13 }}>{user?.email}</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{totalSubjects}</div>
          <div className="stat-label">Total Assessments</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{avgPct}%</div>
          <div className="stat-label">Average Percentage</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{passed}</div>
          <div className="stat-label">Subjects Passed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalSubjects - passed}</div>
          <div className="stat-label">Subjects Failed</div>
        </div>
      </div>

      {/* Marks Table */}
      <div className="card">
        <div className="card-header">
          <h2 style={{ color: "#800000" }}>My MCA CIA Marks</h2>
          <span style={{ fontSize: 13, color: "#666" }}>Passing: {PASS}/{MAX} marks</span>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#800000" }}>Loading marks...</div>
        ) : totalSubjects === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#999" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <div>No marks entered yet. Please check back later.</div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Course Name</th>
                  <th style={{ textAlign: "center" }}>Marks Obtained</th>
                  <th style={{ textAlign: "center" }}>Max Marks</th>
                  <th style={{ textAlign: "center" }}>Percentage</th>
                  <th style={{ textAlign: "center" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {studentMarks.map((m, i) => {
                  const total = Number(m.total || 0);
                  const pct = ((total / MAX) * 100).toFixed(1);
                  const isPassed = total >= PASS;
                  return (
                    <tr key={m.id}>
                      <td>{i + 1}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{m.course_name}</div>
                        {m.code && <div style={{ fontSize: 12, color: "#999" }}>{m.code}</div>}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <strong style={{ fontSize: 18, color: getColor(total) }}>{total}</strong>
                      </td>
                      <td style={{ textAlign: "center", color: "#666" }}>{MAX}</td>
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                          <div style={{
                            width: 60, height: 8, background: "#eee", borderRadius: 4, overflow: "hidden"
                          }}>
                            <div style={{
                              width: `${pct}%`, height: "100%",
                              background: getColor(total), borderRadius: 4,
                              transition: "width 0.5s"
                            }} />
                          </div>
                          <span style={{ fontSize: 13, color: getColor(total), fontWeight: 600 }}>{pct}%</span>
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

      {/* Note */}
      <div style={{ background: "#fff5f5", border: "1px solid #f0d0d0", borderLeft: "4px solid #800000", borderRadius: 8, padding: "14px 18px", fontSize: 13, color: "#800000" }}>
        <strong>ℹ️ Note:</strong> This page shows your CIA marks as entered by your faculty. For queries, contact your department.
      </div>
    </div>
  );
}
