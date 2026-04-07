import React, { useEffect, useState } from "react";
import axios from "axios";

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5000/api/students",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setStudents(res.data.data);
    } catch (error) {
      console.error("Error fetching students", error);
    }
  };

  // 🔍 Search Filter
  const filteredStudents = students.filter((student) => {
    const searchText = search.toLowerCase();

    return (
      student.student_name?.toLowerCase().includes(searchText) ||
      student.usn?.toLowerCase().includes(searchText) ||
      student.email?.toLowerCase().includes(searchText) ||
      student.programme_name?.toLowerCase().includes(searchText) ||
      ("sem" + student.semester).toLowerCase().includes(searchText) ||
      String(student.semester).includes(searchText)
    );
  });

  return (
    <div style={{ padding: "20px" }}>
      <h2>Students List</h2>

      {/* Search Box */}
      <input
        type="text"
        placeholder="Search by name, USN, sem3, MCA..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: "10px",
          width: "300px",
          marginBottom: "20px",
          border: "1px solid gray",
        }}
      />

      {/* Table */}
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>USN</th>
            <th>Name</th>
            <th>Email</th>
            <th>Semester</th>
            <th>Programme</th>
          </tr>
        </thead>

        <tbody>
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <tr key={student.student_id}>
                <td>{student.usn}</td>
                <td>{student.student_name}</td>
                <td>{student.email}</td>
                <td>Sem {student.semester}</td>
                <td>{student.programme_name}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No students found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StudentList;