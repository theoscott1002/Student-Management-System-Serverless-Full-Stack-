import React, { useEffect, useState } from "react";
import StudentForm from "./components/StudentForm";
import StudentTable from "./components/StudentTable";

const API_BASE = "https://htjhdxy1f2.execute-api.us-east-1.amazonaws.com/dev";

function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingStudent, setEditingStudent] = useState(null);
  const [message, setMessage] = useState("");

  const fetchStudents = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/students`);
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      setError("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const createStudent = async (student) => {
    try {
      await fetch(`${API_BASE}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(student),
      });
      setMessage("Student created successfully");
      fetchStudents();
    } catch {
      setError("Failed to create student");
    }
  };

  const updateStudent = async (id, student) => {
    try {
      await fetch(`${API_BASE}/students/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(student),
      });
      setMessage("Student updated successfully");
      setEditingStudent(null);
      fetchStudents();
    } catch {
      setError("Failed to update student");
    }
  };

  const deleteStudent = async (id) => {
    try {
      await fetch(`${API_BASE}/students/${id}`, {
        method: "DELETE",
      });
      setMessage("Student deleted");
      fetchStudents();
    } catch {
      setError("Failed to delete student");
    }
  };

  return (
    <div className="container">
      <h1>Student Management System</h1>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
      {loading && <p>Loading...</p>}

      <StudentForm
        onCreate={createStudent}
        onUpdate={updateStudent}
        editingStudent={editingStudent}
        setEditingStudent={setEditingStudent}
      />

      <StudentTable
        students={students}
        onEdit={setEditingStudent}
        onDelete={deleteStudent}
      />
    </div>
  );
}

export default App;