// src/pages/ProjectsAndTasksPage.jsx

import React, { useState } from 'react';
import ProjectsList from '../components/projects/ProjectsList';
import TasksView from '../components/tasks/TasksView';

function ProjectsAndTasksPage() {
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const handleProjectClick = (projectId) => {
    setSelectedProjectId(projectId);
  };

  return (
    <div>
      <h1>Projects & Tasks</h1>
      <div style={{ display: 'flex', gap: '2rem' }}>
        {/* Left side: Projects list */}
        <div>
          <ProjectsList onProjectClick={handleProjectClick} />
        </div>

        {/* Right side: Tasks for the selected project */}
        <div>
          {selectedProjectId ? (
            <TasksView projectId={selectedProjectId} />
          ) : (
            <p>Select a project to view tasks.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectsAndTasksPage;