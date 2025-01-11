import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosConfig';

const TaskList = ({ projectId }) => {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`/tasks/project/${projectId}`);
        setTasks(response.data);
      } catch (err) {
        setError('Error fetching tasks');
      }
    };

    if (projectId) {
      fetchTasks();
    }
  }, [projectId]);

  const updateTaskStatus = async (taskId, status) => {
    try {
      await axios.put(`/tasks/${taskId}/status`, { status });
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status } : task
        )
      );
    } catch (err) {
      setError('Error updating task status');
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`/tasks/${taskId}`);
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    } catch (err) {
      setError('Error deleting task');
    }
  };

  return (
    <div>
      <h3>Tasks</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <p>
              <strong>{task.name}</strong> - {task.status}
            </p>
            <button onClick={() => updateTaskStatus(task.id, 'in_progress')}>
              Mark In Progress
            </button>
            <button onClick={() => updateTaskStatus(task.id, 'completed')}>
              Mark Completed
            </button>
            <button onClick={() => deleteTask(task.id)}>Delete Task</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;