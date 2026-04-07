import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import API_URL from "../../config";

const MAX_MARKS = 30;
const PASS = 15;

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export default function CIAMarks() {
  const { user } = useSelector((s) => s.auth);

  const [courses, setCourses]           = useState([]);
  const [ciaComponents, setCiaComponents] = useState([]);
  const [students, setStudents]         = useState([]);

  const [selectedCourse, setSelectedCourse]   = useState("");
  const [selectedCIA, setSelectedCIA]         = useState("");
  const [marks, setMarks]                     = useState({});   // { studentId: value }

  const [loading, setLoading]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [saveMsg, setSaveMsg]   = useState("");
  const [error, setError]       = useState("");

  // ── 1. Load faculty's courses (filtered by faculty_id on backend) ──────────
  useEffect(() => {
    axios.get(`${API_URL}/courses`, { headers: getHeaders() })
      .then((r) => {
        if (r.data.success) setCourses(r.data.data || []);
      })
      .catch(() => setError("Could not load courses"));

    axios.get(`${API_URL}/cia-components`, { headers: getHeaders() })
      .then((r) => {
        if (r.data.success) setCiaComponents(r.data.data || []);
      })
      .catch(() => {});
  }, []);

  // ── 2. Load students when a course is selected (filtered by programme) ─────
  const loadStudents = useCallback((courseId) => {
    if (!courseId) { setStudents([]); setMarks({}); return; }
    setLoading(true);
    setError("");

    axios.get(`${API_URL}/students?course_id=${courseId}`, { headers: getHeaders() })
      .then((r) => {
        const list = r.data.data || [];
        setStudents(list);
        // Pre-populate marks input as empty
        const m = {};
        list.forEach((s) => (m[s.id] = ""));
        setMarks(m);
      })
      .catch(() => setError("Could not load students for this course"))
      .finally(() => setLoading(false));
  }, []);

  const handleCourseChange = (e) => {
    const id = e.target.value;
    setSelectedCourse(id);
    setSelectedCIA("");
    setSaveMsg("");
    loadStudents(id);
  };

  // ── 3. Save marks ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!selectedCourse || !selectedCIA) {
      setSaveMsg("⚠️ Please select a course and CIA component first.");
      return;
    }

    const entries = students
      .filter((s) => marks[s.id] !== "" && marks[s.id] !== undefined)
      .map((s) => ({ student_id: s.id, marks_obtained: Number(marks[s.id]) }));

    if (entries.length === 0) {
      setSaveMsg("⚠️ No marks entered.");
      return;
    }

    for (const e of entries) {
      if (isNaN(e.marks_obtained) || e.marks_obtained < 0 || e.marks_obtained > MAX_MARKS) {
        setSaveMsg(`⚠️ Marks must be 0–${MAX_MARKS}.`);
        return;
      }
    }

    setSaving(true);
    setSaveMsg("");

    try {
      // Save each student's marks (upsert on backend)
      await Promise.all(
        entries.map((e) =>
          axios.post(
            `${API_URL}/cia-marks/add`,
            {
              student_id:       e.student_id,
              course_id:        Number(selectedCourse),
              cia_component_id: Number(selectedCIA),
              marks_obtained:   e.marks_obtained,
            },
            { headers: getHeaders() }
          )
        )
      );
      setSaveMsg(`✅ Marks saved for ${entries.length} student(s)!`);
    } catch {
      setSaveMsg("❌ Error saving marks. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const selectedCourseObj = courses.find((c) => String(c.id) === String(selectedCourse));

  return (
    <div className="card">
      <div className="card-header">
        <h2 style={{ color: "#800000" }}>📝 Enter CIA Marks</h2>
        {user?.name && (
          <span style={{ fontSize: 13, color: "#666" }}>Faculty: <strong>{user.name}</strong></span>
        )}
      </div>

      {error && (
        <div style={{ background: "#fff0f0", border: "1px solid #ffcccc", borderRadius: 8,
                      padding: "10px 16px", marginBottom: 16, color: "#cc0000" }}>
          {error}
        </div>
      )}

      {/* Selectors */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        {/* Course */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ display: "block", fontSize: 13, color: "#555", marginBottom: 6, fontWeight: 600 }}>
            Select Course
          </label>
          <select
            value={selectedCourse}
            onChange={handleCourseChange}
            style={{ width: "100%", padding: "8px 12px", borderRadius: 8,
                     border: "1.5px solid #ddd", fontSize: 14 }}
          >
            <option value="">-- Choose course --</option>
            {courses.length === 0 && (
              <option disabled>No courses assigned to you</option>
            )}
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.programme_name ? `(${c.programme_name})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* CIA Component */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ display: "block", fontSize: 13, color: "#555", marginBottom: 6, fontWeight: 600 }}>
            CIA Component
          </label>
          <select
            value={selectedCIA}
            onChange={(e) => setSelectedCIA(e.target.value)}
            style={{ width: "100%", padding: "8px 12px", borderRadius: 8,
                     border: "1.5px solid #ddd", fontSize: 14 }}
          >
            <option value="">-- Choose CIA --</option>
            {ciaComponents.map((c) => (
              <option key={c.id} value={c.id}>
                {c.type} (Max: {c.max_marks})
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedCourseObj && (
        <div style={{ marginBottom: 12, fontSize: 13, color: "#555" }}>
          Programme: <strong style={{ color: "#800000" }}>{selectedCourseObj.programme_name || "—"}</strong>
          &nbsp;·&nbsp; Course Code: <strong>{selectedCourseObj.code || "—"}</strong>
          &nbsp;·&nbsp; Semester: <strong>{selectedCourseObj.semester || "—"}</strong>
        </div>
      )}

      {/* Students table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#800000" }}>Loading students…</div>
      ) : selectedCourse && students.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#888" }}>
          No students found for this course's programme.
          <br /><small>Make sure students are assigned to the correct programme.</small>
        </div>
      ) : students.length > 0 ? (
        <>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>USN</th>
                  <th>Name</th>
                  <th>Programme</th>
                  <th style={{ textAlign: "center" }}>Semester</th>
                  <th style={{ textAlign: "center" }}>Marks (0–{MAX_MARKS})</th>
                  <th style={{ textAlign: "center" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => {
                  const val = marks[s.id];
                  const num = val !== "" && val !== undefined ? Number(val) : null;
                  const pass = num !== null ? num >= PASS : null;
                  return (
                    <tr key={s.id}>
                      <td style={{ color: "#999" }}>{i + 1}</td>
                      <td><strong style={{ color: "#800000" }}>{s.usn}</strong></td>
                      <td style={{ fontWeight: 500 }}>{s.name}</td>
                      <td style={{ fontSize: 12, color: "#666" }}>{s.programme_name || "—"}</td>
                      <td style={{ textAlign: "center" }}>{s.semester}</td>
                      <td style={{ textAlign: "center" }}>
                        <input
                          type="number"
                          min={0}
                          max={MAX_MARKS}
                          value={val ?? ""}
                          onChange={(e) =>
                            setMarks((prev) => ({ ...prev, [s.id]: e.target.value }))
                          }
                          style={{
                            width: 70, textAlign: "center", padding: "6px 8px",
                            borderRadius: 6, border: "1.5px solid #ddd", fontSize: 14,
                          }}
                          placeholder="—"
                        />
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {pass === null ? (
                          <span style={{ color: "#bbb", fontSize: 12 }}>—</span>
                        ) : pass ? (
                          <span style={{ background: "#e6f4ea", color: "#2e7d32",
                                         padding: "2px 10px", borderRadius: 12, fontSize: 12 }}>
                            Pass
                          </span>
                        ) : (
                          <span style={{ background: "#fce8e8", color: "#c62828",
                                         padding: "2px 10px", borderRadius: 12, fontSize: 12 }}>
                            Fail
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 20 }}>
            <button
              onClick={handleSave}
              disabled={saving || !selectedCIA}
              style={{
                background: saving ? "#ccc" : "#800000",
                color: "white", border: "none", borderRadius: 8,
                padding: "10px 28px", cursor: saving ? "not-allowed" : "pointer",
                fontSize: 14, fontWeight: 600,
              }}
            >
              {saving ? "Saving…" : "💾 Save Marks"}
            </button>
            {saveMsg && (
              <span style={{ fontSize: 14, color: saveMsg.startsWith("✅") ? "#2e7d32" : "#c62828" }}>
                {saveMsg}
              </span>
            )}
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: 60, color: "#bbb" }}>
          ← Select a course to load students
        </div>
      )}
    </div>
  );
}