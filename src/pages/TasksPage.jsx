// src/pages/TasksPage.jsx

import React, { useState, useRef } from "react";
import { Container, Row, Col, Card, Alert, Button } from "react-bootstrap";
import { useReactToPrint } from "react-to-print";

import TasksView from "../components/tasks/TasksView";
import ProjectsList from "../components/projects/ProjectsList";

/**
 * A professionally styled page for managing tasks, with print preview.
 * 
 * - Left column: Projects list (click to select a project).
 * - Right column: Tasks for the selected project, plus a Print button.
 */
function TasksPage() {
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  // Ref for the area we want to print (right column with tasks).
  const taskSectionRef = useRef();

  // Callback when a project is clicked in ProjectsList
  const handleProjectClick = (id) => {
    setSelectedProjectId(id);
  };

  // Hook from react-to-print to trigger printing
  const handlePrint = useReactToPrint({
    content: () => taskSectionRef.current,
    documentTitle: "ProjectTasks",
    pageStyle: `
      @page {
        size: A4;
        margin: 20mm;
      }
      /* Add any additional print-specific CSS here if desired */
      body {
        font-family: sans-serif;
      }
    `,
  });

  return (
    <Container fluid className="py-4 bg-light min-vh-100">
      <Row className="mb-4">
        <Col>
          <h1 className="text-primary">Task Management</h1>
          <p className="text-secondary">
            Select a project to view and manage its tasks. Then use the Print button to 
            preview or save the tasks as PDF.
          </p>
        </Col>
      </Row>

      <Row>
        {/* Left Column: Project Selection */}
        <Col md={4} lg={3} className="mb-4">
          <Card>
            <Card.Header className="bg-warning">
              <h5 className="mb-0">Projects</h5>
            </Card.Header>
            <Card.Body>
              <ProjectsList onProjectClick={handleProjectClick} />
            </Card.Body>
          </Card>
        </Col>

        {/* Right Column: Tasks for the selected project + Print button */}
        <Col md={8} lg={9}>
          {/* We'll wrap the entire tasks section in a <div ref={taskSectionRef}> */}
          <div ref={taskSectionRef}>
            {selectedProjectId ? (
              <Card>
                <Card.Header className="bg-info text-white">
                  <h5 className="mb-0">Tasks for Project #{selectedProjectId}</h5>
                </Card.Header>
                <Card.Body>
                  <TasksView projectId={selectedProjectId} />
                </Card.Body>
              </Card>
            ) : (
              <Alert variant="info">
                No project selected. Please choose a project first!
              </Alert>
            )}
          </div>

          {/* Print button (only show if a project is selected) */}
          {selectedProjectId && (
            <div className="mt-3">
              <Button variant="primary" onClick={handlePrint}>
                Print Tasks
              </Button>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default TasksPage;