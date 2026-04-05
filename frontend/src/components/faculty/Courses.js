import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

const STATIC_COURSES = [
  { code: "SSP101", name: "Server Side Programming", semester: 1, credits: 4, type: "Theory" },
  { code: "CSP101", name: "Client Side Programming", semester: 1, credits: 4, type: "Theory" },
  { code: "RM101", name: "Research Methodology", semester: 1, credits: 3, type: "Theory" },
  { code: "WA101", name: "Web Analytics", semester: 1, credits: 3, type: "Theory" },
  { code: "SSP101L", name: "Server Side Programming Lab", semester: 1, credits: 2, type: "Practical" },
  { code: "CSP101L", name: "Client Side Programming Lab", semester: 1, credits: 2, type: "Practical" },
];

export default function Courses() {
  const [courses, setCourses] = useState(STATIC_COURSES);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get(`${API}/courses`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => { if (res.data.success && res.data.data.length > 0) setCourses(res.data.data); })
      .catch(() => {});
  }, []);

  const theory = courses.filter((c) => c.type === "Theory");
  const practical = courses.filter((c) => c.type === "Practical");
  const totalCredits = courses.reduce((s, c) => s + (c.credits || 0), 0);

  return (
    <div className="card">
      <div className="card-header">
        <h2 style={{ color: "#800000" }}>My Courses — Semester 1</h2>
        <span style={{ fontSize: 13, color: "#666" }}>Total Credits: <strong style={{ color: "#800000" }}>{totalCredits}</strong></span>
      </div>

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
        <div className="stat-card">
          <div className="stat-value">{totalCredits}</div>
          <div className="stat-label">Total Credits</div>
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Course Code</th>
              <th>Course Name</th>
              <th style={{ textAlign: "center" }}>Semester</th>
              <th style={{ textAlign: "center" }}>Credits</th>
              <th style={{ textAlign: "center" }}>Type</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c, i) => (
              <tr key={c.code || i}>
                <td style={{ color: "#999" }}>{i + 1}</td>
                <td><strong style={{ color: "#800000" }}>{c.code}</strong></td>
                <td style={{ fontWeight: 500 }}>{c.name}</td>
                <td style={{ textAlign: "center" }}>{c.semester}</td>
                <td style={{ textAlign: "center" }}><strong>{c.credits}</strong></td>
                <td style={{ textAlign: "center" }}>
                  <span className={c.type === "Theory" ? "badge-theory" : "badge-practical"}>
                    {c.type}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
