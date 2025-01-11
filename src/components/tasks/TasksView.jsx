import React, { useState } from 'react';
import TaskList from './TaskList';
import TaskForm from './TaskForm';

const TasksView = ({ projectId }) => {
  const [tasks, setTasks] = useState([]);

  const handleTaskCreated = (newTask) => {
    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  return (
    <div>
      <TaskForm projectId={projectId} onTaskCreated={handleTaskCreated} />
      <TaskList projectId={projectId} />
    </div>
  );
};

export default TasksView;