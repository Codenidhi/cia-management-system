import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { saveMarks, clearSaveStatus, fetchMarksByCourse } from "../../store/slices/marksSlice";
import axios from "axios";
import API_URL from "../../config";

const MAX_MARKS    = 30;
const PASSING_MARKS = 15;

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});

export default function CIAMarks() {
  const dispatch = useDispatch();
  const { courseMarks, loading, saveStatus } = useSelector((s) => s.marks);

  const [courses,   setCourses]   = useState([]);
  const [course,    setCourse]    = useState("");
  const [students,  setStudents]  = useState([]);
  const [marks,     setMarks]     = useState({}); // { [usn]: value }
  const [message,   setMessage]   = useState(null);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Load courses from API on mount
  useEffect(() => {
    axios.get(`${API_URL}/courses`, { headers: getHeaders() })
      .then((res) => {
        const list = res.data.data || [];
        setCourses(list);
        if (list.length > 0) setCourse(list[0].course_name || list[0].name);
      })
      .catch(() => {});
  }, []);

  // Load real students from API on mount
  useEffect(() => {
    setLoadingStudents(true);
    axios.get(`${API_URL}/students`, { headers: getHeaders() })
      .then((res) => {
        const list = (res.data.data || []).map((s) => ({
          usn:  s.usn,
          name: s.student_name || s.name,
          id:   s.student_id   || s.id,
        }));
        setStudents(list);
      })
      .catch(() => setStudents([]))
      .finally(() => setLoadingStudents(false));
  }, []);

  // When course changes, fetch existing marks so faculty sees what was already entered
  useEffect(() => {
    if (course) dispatch(fetchMarksByCourse(course));
  }, [course, dispatch]);

  // Pre-fill marks input with already-saved values
  useEffect(() => {
    if (courseMarks.length === 0) { setMarks({}); return; }
    const pre = {};
    courseMarks.forEach((m) => { if (m.usn) pre[m.usn] = String(m.total ?? ""); });
    setMarks(pre);
  }, [courseMarks]);

  // Show save status alerts
  useEffect(() => {
    if (saveStatus === "success") {
      setMessage({ type: "success", text: "✅ Marks saved! Students can now view them on their dashboard." });
      dispatch(clearSaveStatus());
      setTimeout(() => setMessage(null), 4000);
    } else if (saveStatus === "error") {
      setMessage({ type: "error", text: "❌ Failed to save marks. Check backend." });
      dispatch(clearSaveStatus());
    }
  }, [saveStatus, dispatch]);

  const handleChange = (usn, value) => {
    if (value !== "" && (isNaN(Number(value)) || Number(value) < 0 || Number(value) > MAX_MARKS)) return;
    setMarks((prev) => ({ ...prev, [usn]: value }));
  };

  const handleSave = () => {
    const withMarks = students
      .map((s) => ({ ...s, total: marks[s.usn] ?? "" }))
      .filter((s) => s.total !== "");

    if (withMarks.length === 0) {
      setMessage({ type: "error", text: "❌ Enter marks for at least one student." });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    dispatch(saveMarks({ course, students: students.map((s) => ({ ...s, total: marks[s.usn] ?? "" })) }));
  };

  const exportCSV = () => {
    const rows = [
      ["USN", "Name", "Total Marks", "Status"],
      ...students.map((s) => {
        const t      = Number(marks[s.usn] || 0);
        const status = marks[s.usn] != null && marks[s.usn] !== ""
          ? (t >= PASSING_MARKS ? "Pass" : "Fail")
          : "Not Entered";
        return [s.usn, s.name, t, status];
      }),
    ];
    const csv  = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `${(course || "course").replace(/\s+/g, "_")}_CIA_Marks.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filled = students.filter((s) => marks[s.usn] != null && marks[s.usn] !== "");
  const passed  = filled.filter((s) => Number(marks[s.usn]) >= PASSING_MARKS);
  const failed  = filled.filter((s) => Number(marks[s.usn]) <  PASSING_MARKS);
  const passPct = filled.length > 0 ? ((passed.length / filled.length) * 100).toFixed(1) : 0;

  return (
    <div className="card">
      <h2 style={{ color: "#800000", marginBottom: 20 }}>Enter CIA Marks</h2>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <label className="form-label" style={{ marginBottom: 0 }}>Course:</label>
          <select
            className="form-input form-select"
            style={{ width: "auto", minWidth: 220 }}
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            disabled={courses.length === 0}
          >
            {courses.length === 0 && <option value="">Loading courses…</option>}
            {courses.map((c) => {
              const name = c.course_name || c.name;
              return <option key={c.course_id || c.id || name} value={name}>{name}</option>;
            })}
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

      {filled.length > 0 && (
        <div className="stats-grid" style={{ marginBottom: 16 }}>
          <div className="stat-card"><div className="stat-value">{passed.length}</div><div className="stat-label">Passed</div></div>
          <div className="stat-card"><div className="stat-value">{failed.length}</div><div className="stat-label">Failed</div></div>
          <div className="stat-card"><div className="stat-value">{passPct}%</div><div className="stat-label">Pass Rate</div></div>
        </div>
      )}

      <div className="table-wrapper" style={{ marginBottom: 20 }}>
        <table>
          <thead>
            <tr>
              <th>USN</th>
              <th>Student Name</th>
              <th style={{ textAlign: "center" }}>Total Marks (/{MAX_MARKS})</th>
              <th style={{ textAlign: "center" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {(loading || loadingStudents) ? (
              <tr><td colSpan={4} style={{ textAlign: "center", padding: 30, color: "#800000" }}>Loading…</td></tr>
            ) : students.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: "center", padding: 30, color: "#999" }}>
                No students found. Add students from the Admin panel first.
              </td></tr>
            ) : students.map((s) => {
              const val     = marks[s.usn] ?? "";
              const total   = Number(val);
              const hasMark = val !== "" && val != null;
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
                      value={val}
                      onChange={(e) => handleChange(s.usn, e.target.value)}
                      className="marks-input"
                    />
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {hasMark && (
                      <span className={total >= PASSING_MARKS ? "badge-pass" : "badge-fail"}>
                        {total >= PASSING_MARKS ? "✅ Pass" : "❌ Fail"}
                      </span>
                    )}
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
        disabled={loading || loadingStudents}
        style={{ padding: "12px 32px", fontSize: 15 }}
      >
        {loading ? "Saving…" : "💾 Save All Marks"}
      </button>
    </div>
  );
}