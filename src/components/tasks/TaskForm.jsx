import React, { useState } from 'react';
import axios from '../../utils/axiosConfig';

const TaskForm = ({ projectId, onTaskCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    due_date: '',
    assigned_to: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/tasks', {
        ...formData,
        project_id: projectId,
      });
      onTaskCreated(response.data); // Callback to update task list
      setFormData({ name: '', description: '', due_date: '', assigned_to: '' });
    } catch (err) {
      setError('Error creating task');
    }
  };

  return (
    <div>
      <h3>Create Task</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Task Name"
          value={formData.name}
          onChange={handleChange}
        />
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
        />
        <input
          type="date"
          name="due_date"
          value={formData.due_date}
          onChange={handleChange}
        />
        <input
          type="text"
          name="assigned_to"
          placeholder="Assigned To (User ID)"
          value={formData.assigned_to}
          onChange={handleChange}
        />
        <button type="submit">Add Task</button>
      </form>
    </div>
  );
};

export default TaskForm;