import React, { useEffect, useState } from "react";
import axios from "axios";

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/students", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Handles both res.data and res.data.data
      const data = Array.isArray(res.data) ? res.data : res.data.data;
      setStudents(data || []);
    } catch (error) {
      console.error("Error fetching students", error);
      setError("Failed to load students. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    const searchText = search.toLowerCase().trim();
    if (!searchText) return true;

    return (
      student.student_name?.toLowerCase().includes(searchText) ||
      student.usn?.toLowerCase().includes(searchText) ||
      student.email?.toLowerCase().includes(searchText) ||
      student.programme_name?.toLowerCase().includes(searchText) ||
      `sem${student.semester}`.includes(searchText) ||     // matches "sem1"
      `sem ${student.semester}`.includes(searchText) ||    // matches "sem 1"
      String(student.semester).includes(searchText)        // matches "1"
    );
  });

  return (
    <div style={{ padding: "20px" }}>
      <h2>Students List</h2>

      {/* Search Box */}
      <input
        type="text"
        placeholder="Search by name, USN, email, sem1, MCA..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: "10px",
          width: "300px",
          marginBottom: "20px",
          border: "1px solid gray",
          borderRadius: "4px",
        }}
      />

      {/* Loading State */}
      {loading && <p>Loading students...</p>}

      {/* Error State */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Table */}
      {!loading && !error && (
        <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead style={{ backgroundColor: "#f2f2f2" }}>
            <tr>
              <th>#</th>
              <th>USN</th>
              <th>Name</th>
              <th>Email</th>
              <th>Semester</th>
              <th>Programme</th>
            </tr>
          </thead>

          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student, idx) => (
                <tr key={student.student_id}>
                  <td>{idx + 1}</td>
                  <td>{student.usn}</td>
                  <td>{student.student_name}</td>
                  <td>{student.email}</td>
                  <td>Sem {student.semester}</td>
                  <td>{student.programme_name}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", color: "#888" }}>
                  No students found for "{search}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Result Count */}
      {!loading && students.length > 0 && (
        <p style={{ marginTop: "10px", color: "#555", fontSize: "14px" }}>
          Showing {filteredStudents.length} of {students.length} students
        </p>
      )}
    </div>
  );
};

export default StudentList;