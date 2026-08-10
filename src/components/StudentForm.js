import React, { useEffect, useState } from "react";

function StudentForm({
  onCreate,
  onUpdate,
  editingStudent,
  setEditingStudent,
}) {
  const [form, setForm] = useState({
    name: "",
    department: "",
    level: "",
    email: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (editingStudent) {
      setForm(editingStudent);
    }
  }, [editingStudent]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.name || !form.department || !form.level || !form.email) {
      setError("All fields are required");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingStudent) {
      onUpdate(editingStudent.studentId, form);
    } else {
      onCreate(form);
    }

    setForm({ name: "", department: "", level: "", email: "" });
    setEditingStudent(null);
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>{editingStudent ? "Update Student" : "Add Student"}</h2>

      {error && <p className="error">{error}</p>}

      <input
        name="name"
        placeholder="Name"
        value={form.name}
        onChange={handleChange}
      />
      <input
        name="department"
        placeholder="Department"
        value={form.department}
        onChange={handleChange}
      />
      <input
        name="level"
        placeholder="Level"
        value={form.level}
        onChange={handleChange}
      />
      <input
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
      />

      <button type="submit">
        {editingStudent ? "Update" : "Create"}
      </button>
    </form>
  );
}

export default StudentForm;