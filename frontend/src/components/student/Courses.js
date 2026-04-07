import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import API_URL from "../../config";

export default function Courses() {
  const { user } = useSelector((s) => s.auth);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    setLoading(true);

    // The backend will automatically filter by programme_id from the JWT token
    axios
      .get(`${API_URL}/courses`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        if (r.data.success) setCourses(r.data.data || []);
        else setError("Could not load courses.");
      })
      .catch(() => setError("Could not load courses."))
      .finally(() => setLoading(false));
  }, []);

  const theory     = courses.filter((c) => !String(c.name || "").toLowerCase().includes("lab"));
  const practical  = courses.filter((c) =>  String(c.name || "").toLowerCase().includes("lab"));
  const totalCredits = courses.reduce((s, c) => s + (Number(c.credits) || 0), 0);

  if (loading) {
    return (
      <div className="card" style={{ textAlign: "center", padding: 60, color: "#800000" }}>
        Loading your courses…
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 style={{ color: "#800000" }}>
          📚 My Courses
          {user?.programme && (
            <span style={{ fontSize: 14, fontWeight: 400, color: "#666", marginLeft: 10 }}>
              — {user.programme}
            </span>
          )}
        </h2>
        {totalCredits > 0 && (
          <span style={{ fontSize: 13, color: "#666" }}>
            Total Credits: <strong style={{ color: "#800000" }}>{totalCredits}</strong>
          </span>
        )}
      </div>

      {error && (
        <div style={{ background: "#fff0f0", border: "1px solid #ffcccc", borderRadius: 8,
                      padding: "10px 16px", marginBottom: 16, color: "#cc0000" }}>
          {error}
        </div>
      )}

      {courses.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#aaa" }}>
          No courses found for your programme.
          <br />
          <small style={{ color: "#bbb" }}>
            Ask your admin to add courses for{" "}
            <strong>{user?.programme || "your programme"}</strong>.
          </small>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="stats-grid" style={{ marginBottom: 24 }}>
            <div className="stat-card">
              <div className="stat-value">{courses.length}</div>
              <div className="stat-label">Total Courses</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{theory.length}</div>
              <div className="stat-label">Theory</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{practical.length}</div>
              <div className="stat-label">Practical</div>
            </div>
            {totalCredits > 0 && (
              <div className="stat-card">
                <div className="stat-value">{totalCredits}</div>
                <div className="stat-label">Total Credits</div>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Course Code</th>
                  <th>Course Name</th>
                  <th style={{ textAlign: "center" }}>Semester</th>
                  <th style={{ textAlign: "center" }}>Type</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c, i) => {
                  const isLab = String(c.name || "").toLowerCase().includes("lab");
                  return (
                    <tr key={c.id || i}>
                      <td style={{ color: "#999" }}>{i + 1}</td>
                      <td>
                        <strong style={{ color: "#800000" }}>{c.code || "—"}</strong>
                      </td>
                      <td style={{ fontWeight: 500 }}>{c.name}</td>
                      <td style={{ textAlign: "center" }}>{c.semester || "—"}</td>
                      <td style={{ textAlign: "center" }}>
                        <span
                          style={{
                            background: isLab ? "#f0f4ff" : "#fff5f5",
                            color:      isLab ? "#1a56db" : "#800000",
                            padding: "2px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600,
                          }}
                        >
                          {isLab ? "Practical" : "Theory"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}