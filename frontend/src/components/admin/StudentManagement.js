import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStudents, addStudent, deleteStudent } from "../../store/slices/studentsSlice";

const EMPTY_FORM = { usn: "", name: "", email: "", semester: "1" };

export default function StudentManagement() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((s) => s.students);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [message, setMessage] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => { dispatch(fetchStudents()); }, [dispatch]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const result = await dispatch(addStudent(form));
    if (addStudent.fulfilled.match(result)) {
      setMessage({ type: "success", text: "✅ Student added successfully!" });
      setForm(EMPTY_FORM);
      setShowForm(false);
      dispatch(fetchStudents());
    } else {
      setMessage({ type: "error", text: "❌ " + (result.payload || "Failed to add student") });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDelete = async (student) => {
    if (!window.confirm(`Delete ${student.name} (${student.usn})?`)) return;
    await dispatch(deleteStudent(student.id));
    setMessage({ type: "success", text: "✅ Student deleted" });
    setTimeout(() => setMessage(null), 2000);
  };

  const filtered = list.filter(
    (s) =>
      s.usn?.toLowerCase().includes(search.toLowerCase()) ||
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="card">
      <div className="card-header">
        <h2 style={{ color: "#800000" }}>Student Management</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "✕ Cancel" : "➕ Add Student"}
        </button>
      </div>

      {message && (
        <div className={`alert ${message.type === "success" ? "alert-success" : "alert-error"}`}>
          {message.text}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleAdd} style={{ background: "#fff5f5", border: "1px solid #f0d0d0", borderRadius: 10, padding: 24, marginBottom: 24 }}>
          <h3 style={{ color: "#800000", marginBottom: 16, fontSize: 18 }}>Add New Student</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">USN *</label>
              <input className="form-input" placeholder="1CA21MC001" value={form.usn}
                onChange={(e) => setForm({ ...form, usn: e.target.value })} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Full Name *</label>
              <input className="form-input" placeholder="Student Name" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email *</label>
              <input className="form-input" type="email" placeholder="student@college.edu" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Semester</label>
              <select className="form-input form-select" value={form.semester}
                onChange={(e) => setForm({ ...form, semester: e.target.value })}>
                {[1,2,3,4].map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Adding..." : "✅ Add Student"}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input
          className="form-input"
          style={{ maxWidth: 320 }}
          placeholder="🔍 Search by USN, name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card"><div className="stat-value">{list.length}</div><div className="stat-label">Total Students</div></div>
        <div className="stat-card"><div className="stat-value">{filtered.length}</div><div className="stat-label">Showing</div></div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>USN</th>
              <th>Name</th>
              <th>Email</th>
              <th style={{ textAlign: "center" }}>Semester</th>
              <th style={{ textAlign: "center" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: 30 }}>Loading students...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: 30, color: "#999" }}>No students found</td></tr>
            ) : filtered.map((s, i) => (
              <tr key={s.id}>
                <td style={{ color: "#999" }}>{i + 1}</td>
                <td><strong style={{ color: "#800000" }}>{s.usn}</strong></td>
                <td style={{ fontWeight: 500 }}>{s.name}</td>
                <td style={{ fontSize: 13, color: "#666" }}>{s.email}</td>
                <td style={{ textAlign: "center" }}>Sem {s.semester}</td>
                <td style={{ textAlign: "center" }}>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s)}>🗑️ Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
