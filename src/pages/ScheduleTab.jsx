import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  ListGroup,
} from "react-bootstrap";

// React Big Calendar
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";

// Initialize localizer for react-big-calendar
const localizer = momentLocalizer(moment);

function ScheduleTab() {
  // Task state: each task has { id, name, status, start, end }
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    name: "",
    status: "Pending",
    start: "",
    end: "",
  });

  // Handle input changes for newTask object
  const handleChange = (e) => {
    setNewTask({ ...newTask, [e.target.name]: e.target.value });
  };

  // Add a new task to both the list and the calendar
  const addTask = (e) => {
    e.preventDefault();
    if (newTask.name.trim()) {
      setTasks((prevTasks) => [
        ...prevTasks,
        {
          id: prevTasks.length + 1,
          name: newTask.name,
          status: newTask.status,
          // Convert date/time strings into actual Date objects for the calendar
          start: new Date(newTask.start),
          end: new Date(newTask.end),
        },
      ]);
      // Reset form
      setNewTask({ name: "", status: "Pending", start: "", end: "" });
    }
  };

  // Update the status of a task in the list
  const updateTaskStatus = (taskId, status) => {
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === taskId ? { ...t, status } : t))
    );
  };

  // Convert tasks to events for react-big-calendar
  const events = tasks.map((task) => ({
    id: task.id,
    title: `${task.name} (${task.status})`,
    start: task.start,
    end: task.end,
    allDay: false, // or true if you prefer all-day events
  }));

  return (
    <Container fluid className="py-4 bg-light min-vh-100">
      <Row className="mb-4">
        <Col>
          <h1 className="text-primary">Schedule Management</h1>
          <p className="text-secondary">
            Add tasks, assign status, and view them on a Google-like calendar
            for an overview of your construction timeline.
          </p>
        </Col>
      </Row>

      <Row>
        {/* LEFT COLUMN: Add Task + Task List */}
        <Col lg={4} className="mb-4">
          <Card>
            <Card.Header className="bg-warning">
              <Card.Title className="mb-0">Add a New Task</Card.Title>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={addTask}>
                <Form.Group className="mb-3" controlId="formTaskName">
                  <Form.Label>Task Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Enter a new task"
                    value={newTask.name}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formTaskStart">
                  <Form.Label>Start Date/Time</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="start"
                    value={newTask.start}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formTaskEnd">
                  <Form.Label>End Date/Time</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="end"
                    value={newTask.end}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Button variant="primary" type="submit">
                  Add Task
                </Button>
              </Form>
            </Card.Body>
          </Card>

          {/* TASK LIST */}
          {tasks.length > 0 && (
            <Card className="mt-4">
              <Card.Header className="bg-info text-white">
                <Card.Title className="mb-0">Task List</Card.Title>
              </Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  {tasks.map((task) => (
                    <ListGroup.Item
                      key={task.id}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <strong>{task.name}</strong> ({task.status})
                      </div>
                      <div>
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={() => updateTaskStatus(task.id, "In Progress")}
                          className="me-2"
                        >
                          In Progress
                        </Button>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => updateTaskStatus(task.id, "Completed")}
                        >
                          Completed
                        </Button>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          )}
        </Col>

        {/* RIGHT COLUMN: Calendar */}
        <Col lg={8}>
          <Card>
            <Card.Header className="bg-secondary text-white">
              <Card.Title className="mb-0">Schedule Calendar</Card.Title>
            </Card.Header>
            <Card.Body style={{ height: "700px" }}>
              {/* React Big Calendar */}
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                defaultView="week"
                style={{ height: "100%" }}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ScheduleTab;