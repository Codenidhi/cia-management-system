import { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../../config";

const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });
const EMPTY = { name: "", email: "", department: "Computer Science" };

export default function FacultyManagement() {
  const [list,        setList]        = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [showForm,    setShowForm]    = useState(false);
  const [form,        setForm]        = useState(EMPTY);
  const [message,     setMessage]     = useState(null);
  const [editFaculty, setEditFaculty] = useState(null);

  const load = () => {
    setLoading(true);
    axios.get(`${API_URL}/faculty`, { headers: getHeaders() })
      .then((r) => setList(r.data.data || []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAdd = (e) => {
    e.preventDefault();
    setLoading(true);
    axios.post(`${API_URL}/faculty`, form, { headers: getHeaders() })
      .then(() => {
        setMessage({ type: "success", text: "✅ Faculty added successfully!" });
        setForm(EMPTY);
        setShowForm(false);
        load();
      })
      .catch((err) => setMessage({ type: "error", text: "❌ " + (err.response?.data?.message || "Failed") }))
      .finally(() => setLoading(false));
    setTimeout(() => setMessage(null), 3000);
  };

  const handleEditSave = async () => {
    try {
      await axios.put(`${API_URL}/faculty/${editFaculty.faculty_id || editFaculty.id}`, {
        name: editFaculty.faculty_name || editFaculty.name,
        email: editFaculty.email,
        department: editFaculty.department_name || editFaculty.department,
      }, { headers: getHeaders() });
      setMessage({ type: "success", text: "✅ Faculty updated successfully!" });
      setEditFaculty(null);
      load();
    } catch (err) {
      setMessage({ type: "error", text: "❌ " + (err.response?.data?.message || "Failed to update") });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDelete = async (f) => {
    if (!window.confirm(`Delete ${f.faculty_name || f.name}?`)) return;
    try {
      await axios.delete(`${API_URL}/faculty/${f.faculty_id || f.id}`, { headers: getHeaders() });
      setMessage({ type: "success", text: "✅ Faculty deleted" });
      load();
    } catch (err) {
      setMessage({ type: "error", text: "❌ " + (err.response?.data?.message || "Failed to delete") });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 style={{ color: "#800000" }}>Faculty Management</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "✕ Cancel" : "➕ Add Faculty"}
        </button>
      </div>

      {message && (
        <div className={`alert ${message.type === "success" ? "alert-success" : "alert-error"}`}>
          {message.text}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleAdd} style={{ background: "#fff5f5", border: "1px solid #f0d0d0", borderRadius: 10, padding: 24, marginBottom: 24 }}>
          <h3 style={{ color: "#800000", marginBottom: 16, fontSize: 18 }}>Add New Faculty</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Full Name *</label>
              <input className="form-input" placeholder="Dr. Name" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email *</label>
              <input className="form-input" type="email" placeholder="faculty@college.edu" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Department</label>
              <input className="form-input" placeholder="Computer Science" value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })} />
            </div>
          </div>
          <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Adding..." : "✅ Add Faculty"}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {/* Edit Modal */}
      {editFaculty && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: 12, padding: 32, width: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <h3 style={{ color: "#800000", marginBottom: 20 }}>✏️ Edit Faculty</h3>
            <div style={{ display: "grid", gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={editFaculty.faculty_name || editFaculty.name}
                  onChange={(e) => setEditFaculty({ ...editFaculty, faculty_name: e.target.value, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={editFaculty.email}
                  onChange={(e) => setEditFaculty({ ...editFaculty, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <input className="form-input" value={editFaculty.department_name || editFaculty.department}
                  onChange={(e) => setEditFaculty({ ...editFaculty, department_name: e.target.value, department: e.target.value })} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button className="btn btn-primary" onClick={handleEditSave}>💾 Save Changes</button>
              <button className="btn btn-outline" onClick={() => setEditFaculty(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card"><div className="stat-value">{list.length}</div><div className="stat-label">Total Faculty</div></div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr><th>#</th><th>Name</th><th>Email</th><th>Department</th><th style={{ textAlign: "center" }}>Actions</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: "center", padding: 30 }}>Loading...</td></tr>
            ) : list.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: "center", padding: 30, color: "#999" }}>No faculty found</td></tr>
            ) : list.map((f, i) => (
              <tr key={f.faculty_id || f.id}>
                <td style={{ color: "#999" }}>{i + 1}</td>
                <td style={{ fontWeight: 600 }}>{f.faculty_name || f.name}</td>
                <td style={{ fontSize: 13, color: "#666" }}>{f.email}</td>
                <td>{f.department_name || f.department}</td>
                <td style={{ textAlign: "center", display: "flex", gap: 6, justifyContent: "center" }}>
                  <button className="btn btn-primary btn-sm" onClick={() => setEditFaculty({ ...f })}>✏️ Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(f)}>🗑️ Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}