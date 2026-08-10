import React from "react";

function StudentTable({ students, onEdit, onDelete }) {
  return (
    <div className="table-container">
      <h2>Students</h2>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Department</th>
            <th>Level</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {students.length === 0 ? (
            <tr>
              <td colSpan="5">No students found</td>
            </tr>
          ) : (
            students.map((student) => (
              <tr key={student.studentId}>
                <td>{student.name}</td>
                <td>{student.department}</td>
                <td>{student.level}</td>
                <td>{student.email}</td>
                <td>
                  <button onClick={() => onEdit(student)}>Edit</button>
                  <button onClick={() => onDelete(student.studentId)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default StudentTable;