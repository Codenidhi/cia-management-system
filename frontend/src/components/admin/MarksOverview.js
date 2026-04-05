import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMarksByCourse } from "../../store/slices/marksSlice";

const COURSES = [
  "Server Side Programming",
  "Client Side Programming",
  "Research Methodology",
  "Web Analytics",
];
const MAX = 30;
const PASS = 15;

export default function MarksOverview() {
  const dispatch = useDispatch();
  const { courseMarks, loading } = useSelector((s) => s.marks);
  const [course, setCourse] = useState(COURSES[0]);

  useEffect(() => {
    dispatch(fetchMarksByCourse(course));
  }, [course, dispatch]);

  const withMarks = courseMarks.filter((m) => m.total !== null && m.total !== "");
  const passed = withMarks.filter((m) => Number(m.total) >= PASS);
  const failed = withMarks.filter((m) => Number(m.total) < PASS);
  const avg = withMarks.length > 0
    ? (withMarks.reduce((s, m) => s + Number(m.total), 0) / withMarks.length).toFixed(1)
    : 0;
  const passPct = withMarks.length > 0 ? ((passed.length / withMarks.length) * 100).toFixed(1) : 0;

  const getColor = (total) => {
    const pct = (total / MAX) * 100;
    if (pct >= 70) return "#2e7d32";
    if (pct >= 50) return "#e65100";
    return "#c62828";
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 style={{ color: "#800000" }}>Marks Overview</h2>
        <select
          className="form-input form-select"
          style={{ width: "auto", minWidth: 220 }}
          value={course}
          onChange={(e) => setCourse(e.target.value)}
        >
          {COURSES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card"><div className="stat-value">{withMarks.length}</div><div className="stat-label">Marks Entered</div></div>
        <div className="stat-card"><div className="stat-value">{passed.length}</div><div className="stat-label">Passed</div></div>
        <div className="stat-card"><div className="stat-value">{failed.length}</div><div className="stat-label">Failed</div></div>
        <div className="stat-card"><div className="stat-value">{avg}</div><div className="stat-label">Class Average</div></div>
        <div className="stat-card"><div className="stat-value">{passPct}%</div><div className="stat-label">Pass Rate</div></div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>USN</th>
              <th>Student Name</th>
              <th style={{ textAlign: "center" }}>Marks</th>
              <th style={{ textAlign: "center" }}>Percentage</th>
              <th style={{ textAlign: "center" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: 30 }}>Loading...</td></tr>
            ) : courseMarks.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: 30, color: "#999" }}>No marks entered yet for this course</td></tr>
            ) : courseMarks.map((m, i) => {
              const total = Number(m.total || 0);
              const pct = ((total / MAX) * 100).toFixed(1);
              const isPassed = total >= PASS;
              return (
                <tr key={m.id}>
                  <td style={{ color: "#999" }}>{i + 1}</td>
                  <td><strong style={{ color: "#800000" }}>{m.usn}</strong></td>
                  <td style={{ fontWeight: 500 }}>{m.student_name}</td>
                  <td style={{ textAlign: "center" }}>
                    <strong style={{ fontSize: 16, color: getColor(total) }}>{total}</strong>
                    <span style={{ color: "#999", fontSize: 12 }}>/{MAX}</span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      <div style={{ width: 60, height: 8, background: "#eee", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: getColor(total), borderRadius: 4 }} />
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
    </div>
  );
}
