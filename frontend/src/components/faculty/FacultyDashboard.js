import { useState } from "react";
import { useSelector } from "react-redux";
import CIAMarks from "./CIAMarks";
import Courses from "./Courses";

export default function FacultyDashboard() {
  const [view, setView] = useState("marks");
  const { user } = useSelector((s) => s.auth);

  const tabs = [
    { id: "marks",   label: "📝 Enter CIA Marks" },
    { id: "courses", label: "📚 My Courses" },
  ];

  return (
    <div className="container">
      <div className="welcome-card">
        <h1>Faculty Panel 👨‍🏫</h1>
        <p>Welcome, {user?.name}. Enter CIA marks and manage your courses below.</p>
      </div>

      <div className="tab-bar">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`tab-btn ${view === t.id ? "active" : ""}`}
            onClick={() => setView(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {view === "marks"   && <CIAMarks />}
      {view === "courses" && <Courses />}
    </div>
  );
}