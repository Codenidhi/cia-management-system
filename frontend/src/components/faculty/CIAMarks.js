import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMarksByCourse, saveMarks, clearSaveStatus } from "../../store/slices/marksSlice";

const COURSES = [
  "Server Side Programming",
  "Client Side Programming",
  "Research Methodology",
  "Web Analytics",
];
const MAX_MARKS = 30;
const PASSING_MARKS = 15;

const DUMMY_STUDENTS = [
  { usn: "1CA21MC001", name: "Asha Sharma", total: "" },
  { usn: "1CA21MC002", name: "Ravi Verma", total: "" },
  { usn: "1CA21MC003", name: "Meena Patel", total: "" },
  { usn: "1CA21MC004", name: "Arun Singh", total: "" },
  { usn: "1CA21MC005", name: "Priya Nair", total: "" },
];

export default function CIAMarks() {
  const dispatch = useDispatch();
  const { courseMarks, loading, saveStatus } = useSelector((s) => s.marks);

  const [course, setCourse] = useState(COURSES[0]);
  const [students, setStudents] = useState(DUMMY_STUDENTS);
  const [showStats, setShowStats] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    dispatch(fetchMarksByCourse(course));
  }, [course, dispatch]);

  useEffect(() => {
    if (courseMarks.length > 0) {
      const mapped = DUMMY_STUDENTS.map((s) => {
        const found = courseMarks.find((m) => m.usn === s.usn);
        return { ...s, total: found ? String(found.total) : "" };
      });
      setStudents(mapped);
    } else {
      setStudents(DUMMY_STUDENTS.map((s) => ({ ...s, total: "" })));
    }
  }, [courseMarks]);

  useEffect(() => {
    if (saveStatus === "success") {
      setMessage({ type: "success", text: "✅ Marks saved successfully!" });
      dispatch(clearSaveStatus());
      setTimeout(() => setMessage(null), 3000);
    } else if (saveStatus === "error") {
      setMessage({ type: "error", text: "❌ Failed to save marks. Check backend." });
      dispatch(clearSaveStatus());
    }
  }, [saveStatus, dispatch]);

  const handleChange = (index, value) => {
    if (value !== "" && (isNaN(Number(value)) || Number(value) < 0 || Number(value) > MAX_MARKS)) return;
    const updated = [...students];
    updated[index] = { ...updated[index], total: value };
    setStudents(updated);
  };

  const handleDelete = (index) => {
    if (window.confirm(`Delete ${students[index].name} from list?`)) {
      setStudents(students.filter((_, i) => i !== index));
      setMessage({ type: "success", text: "✅ Student removed" });
    }
  };

  const handleSave = () => {
    const withMarks = students.filter((s) => s.total !== "");
    if (withMarks.length === 0) {
      setMessage({ type: "error", text: "❌ Enter marks for at least one student." });
      return;
    }
    dispatch(saveMarks({ course, students }));
  };

  const exportCSV = () => {
    const rows = [
      ["USN", "Name", "Total Marks", "Status"],
      ...students.map((s) => {
        const t = Number(s.total) || 0;
        const status = s.total !== "" ? (t >= PASSING_MARKS ? "Pass" : "Fail") : "Not Entered";
        return [s.usn, s.name, t, status];
      }),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${course.replace(/\s+/g, "_")}_CIA_Marks.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const withMarks = students.filter((s) => s.total !== "");
  const passed = withMarks.filter((s) => Number(s.total) >= PASSING_MARKS);
  const failed = withMarks.filter((s) => Number(s.total) < PASSING_MARKS);
  const passPct = withMarks.length > 0 ? ((passed.length / withMarks.length) * 100).toFixed(1) : 0;

  return (
    <div className="card">
      <h2 style={{ color: "#800000", marginBottom: 20 }}>Enter CIA Marks</h2>

      {/* Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <label className="form-label" style={{ marginBottom: 0 }}>Course:</label>
          <select
            className="form-input form-select"
            style={{ width: "auto", minWidth: 220 }}
            value={course}
            onChange={(e) => setCourse(e.target.value)}
          >
            {COURSES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", gap: 10 }} className="no-print">
          <button className="btn btn-outline btn-sm" onClick={exportCSV}>📥 Export CSV</button>
          <button className="btn btn-outline btn-sm" onClick={() => window.print()}>🖨️ Print</button>
        </div>
      </div>

      {message && (
        <div className={`alert ${message.type === "success" ? "alert-success" : "alert-error"}`}>
          {message.text}
        </div>
      )}

      {/* Stats */}
      {withMarks.length > 0 && (
        <div className="stats-grid" style={{ marginBottom: 16 }}>
          <div className="stat-card">
            <div className="stat-value">{passed.length}</div>
            <div className="stat-label">Passed</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{failed.length}</div>
            <div className="stat-label">Failed</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{passPct}%</div>
            <div className="stat-label">Pass Rate</div>
          </div>
        </div>
      )}

      {withMarks.length > 0 && (
        <button
          className="btn btn-outline btn-sm no-print"
          style={{ marginBottom: 16 }}
          onClick={() => setShowStats((s) => !s)}
        >
          📊 {showStats ? "Hide" : "Show"} Pass/Fail Details
        </button>
      )}

      {showStats && withMarks.length > 0 && (
        <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
          {[{ label: "✅ Passed", list: passed }, { label: "❌ Failed", list: failed }].map(({ label, list }) => (
            <div key={label} className="card" style={{ flex: 1, minWidth: 260, margin: 0, padding: 18 }}>
              <h3 style={{ color: "#800000", marginBottom: 12, fontSize: 16 }}>{label} ({list.length})</h3>
              {list.length === 0 ? (
                <p style={{ color: "#999", fontStyle: "italic", fontSize: 13 }}>None</p>
              ) : (
                <table style={{ fontSize: 13 }}>
                  <thead>
                    <tr>
                      <th>USN</th><th>Name</th><th style={{ textAlign: "center" }}>Marks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.sort((a, b) => Number(b.total) - Number(a.total)).map((s) => (
                      <tr key={s.usn}>
                        <td>{s.usn}</td>
                        <td>{s.name}</td>
                        <td style={{ textAlign: "center" }}><strong>{s.total}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Marks Table */}
      <div className="table-wrapper" style={{ marginBottom: 20 }}>
        <table>
          <thead>
            <tr>
              <th>USN</th>
              <th>Student Name</th>
              <th style={{ textAlign: "center" }}>Total Marks (/{MAX_MARKS})</th>
              <th style={{ textAlign: "center" }}>Status</th>
              <th style={{ textAlign: "center" }} className="no-print">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: "center", padding: 30, color: "#800000" }}>Loading...</td></tr>
            ) : students.map((s, i) => {
              const total = Number(s.total);
              const hasMarks = s.total !== "" && s.total !== null;
              return (
                <tr key={s.usn}>
                  <td style={{ color: "#800000", fontWeight: 500 }}>{s.usn}</td>
                  <td style={{ fontWeight: 500 }}>{s.name}</td>
                  <td style={{ textAlign: "center" }}>
                    <input
                      type="number"
                      min={0}
                      max={MAX_MARKS}
                      step={0.5}
                      placeholder="Enter marks"
                      value={s.total}
                      onChange={(e) => handleChange(i, e.target.value)}
                      className="marks-input"
                    />
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {hasMarks && (
                      <span className={total >= PASSING_MARKS ? "badge-pass" : "badge-fail"}>
                        {total >= PASSING_MARKS ? "✅ Pass" : "❌ Fail"}
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: "center" }} className="no-print">
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(i)}
                      title="Remove student"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button
        className="btn btn-primary no-print"
        onClick={handleSave}
        disabled={loading}
        style={{ padding: "12px 32px", fontSize: 15 }}
      >
        {loading ? "Saving..." : "💾 Save All Marks"}
      </button>

      {/* Instructions */}
      <div style={{ marginTop: 24, background: "#fff5f5", border: "1px solid #f0d0d0", borderLeft: "4px solid #800000", borderRadius: 8, padding: "16px 20px", fontSize: 13 }} className="no-print">
        <strong style={{ color: "#800000" }}>💡 Instructions:</strong>
        <ul style={{ marginTop: 8, marginLeft: 18, lineHeight: 2, color: "#555" }}>
          <li>Enter total marks (0–{MAX_MARKS}) per student</li>
          <li>Passing marks: <strong>{PASSING_MARKS}/{MAX_MARKS}</strong> (50%)</li>
          <li>Status updates automatically as you type</li>
          <li>Click <strong>Save All Marks</strong> to persist to database</li>
          <li>Use Export CSV to download marks sheet</li>
        </ul>
      </div>
    </div>
  );
}
