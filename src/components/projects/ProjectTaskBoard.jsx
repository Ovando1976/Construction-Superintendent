// src/components/projects/ProjectTaskBoard.jsx
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Row, Col, Card } from 'react-bootstrap';

/**
 * A production-level board might:
 * - Fetch tasks from an API
 * - Support real-time updates (WebSockets or Firestore)
 * - Have role-based access (only certain roles can move tasks)
 */

const columnsFromBackend = {
  todo: {
    name: 'To Do',
    items: [],
  },
  inProgress: {
    name: 'In Progress',
    items: [],
  },
  done: {
    name: 'Done',
    items: [],
  },
};

const ProjectTaskBoard = ({ tasks = [] }) => {
  // Transform the incoming tasks into columns
  // For instance, each task has a `status` property: 'todo', 'inProgress', or 'done'.
  const [columns, setColumns] = useState(columnsFromBackend);

  // On mount or whenever `tasks` changes, distribute tasks into columns
  useEffect(() => {
    const newColumns = JSON.parse(JSON.stringify(columnsFromBackend));
    tasks.forEach((task) => {
      const status = task.status || 'todo';
      if (newColumns[status]) {
        newColumns[status].items.push(task);
      } else {
        // fallback if status is unknown
        newColumns.todo.items.push(task);
      }
    });
    setColumns(newColumns);
  }, [tasks]);

  // Handle drag & drop
  const onDragEnd = (result) => {
    const { destination, source } = result;
    // If the user drops outside a valid droppable, or in the same spot, do nothing
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    // Create a deep copy of columns
    const updatedColumns = JSON.parse(JSON.stringify(columns));
    // Remove item from source
    const [removedTask] = updatedColumns[source.droppableId].items.splice(source.index, 1);
    // Insert into destination
    updatedColumns[destination.droppableId].items.splice(destination.index, 0, removedTask);

    // Update the removed task's status (so the UI stays consistent even after a refresh)
    removedTask.status = destination.droppableId;

    // You might also want to PATCH your API here to persist the status update.
    // e.g. api.patch(`/tasks/${removedTask.id}`, { status: removedTask.status });

    setColumns(updatedColumns);
  };

  return (
    <Row>
      <DragDropContext onDragEnd={onDragEnd}>
        {Object.entries(columns).map(([columnId, columnData]) => (
          <Col key={columnId} xs={12} md={4}>
            <Card className="mb-3">
              <Card.Header>
                <strong>{columnData.name}</strong>
              </Card.Header>
              <Droppable droppableId={columnId}>
                {(provided) => (
                  <div
                    className="p-2"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    style={{ minHeight: '200px' }}
                  >
                    {columnData.items.map((task, index) => (
                      <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                        {(dragProvided, snapshot) => (
                          <Card
                            className={`mb-2 ${snapshot.isDragging ? 'border-primary' : ''}`}
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                          >
                            <Card.Body>
                              <Card.Title>{task.title}</Card.Title>
                              <Card.Text>Status: {task.status}</Card.Text>
                              {/* Additional details (assignees, due date, etc.) */}
                            </Card.Body>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </Card>
          </Col>
        ))}
      </DragDropContext>
    </Row>
  );
};

export default ProjectTaskBoard;