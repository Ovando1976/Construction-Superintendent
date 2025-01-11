// src/pages/ScheduleConflictPage.jsx
import React, { useState } from 'react';
import { Container, Row, Col, Card, ListGroup, Button } from 'react-bootstrap';
import moment from 'moment';

function ScheduleConflictPage() {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      name: 'Pour Concrete',
      assignedTo: 'WorkerA',
      start: moment('2024-12-01 08:00'),
      end: moment('2024-12-01 12:00'),
    },
    {
      id: 2,
      name: 'Install Rebar',
      assignedTo: 'WorkerA',
      start: moment('2024-12-01 09:00'),
      end: moment('2024-12-01 11:00'),
    },
    {
      id: 3,
      name: 'Trenching',
      assignedTo: 'WorkerB',
      start: moment('2024-12-01 10:00'),
      end: moment('2024-12-01 14:00'),
    },
  ]);

  const checkConflicts = () => {
    const conflicts = [];
    // Basic approach: compare each pair of tasks
    for (let i = 0; i < tasks.length; i++) {
      for (let j = i + 1; j < tasks.length; j++) {
        if (tasks[i].assignedTo === tasks[j].assignedTo) {
          // Check if time ranges overlap
          if (
            tasks[i].start.isBefore(tasks[j].end) &&
            tasks[i].end.isAfter(tasks[j].start)
          ) {
            conflicts.push({
              taskA: tasks[i],
              taskB: tasks[j],
            });
          }
        }
      }
    }
    if (conflicts.length === 0) {
      alert('No conflicts found!');
    } else {
      let msg = 'Conflicts Detected:\n';
      conflicts.forEach((c) => {
        msg += `- ${c.taskA.name} overlaps with ${c.taskB.name} (Assigned to ${c.taskA.assignedTo})\n`;
      });
      alert(msg);
    }
  };

  return (
    <Container fluid className="py-4 bg-light min-vh-100">
      <Row>
        <Col>
          <Card>
            <Card.Header className="bg-warning">
              <Card.Title className="mb-0">Task Schedule</Card.Title>
            </Card.Header>
            <Card.Body>
              <ListGroup>
                {tasks.map((t) => (
                  <ListGroup.Item key={t.id}>
                    <strong>{t.name}</strong> - {t.assignedTo} <br />
                    {t.start.format('YYYY-MM-DD HH:mm')} to{' '}
                    {t.end.format('YYYY-MM-DD HH:mm')}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
            <Card.Footer>
              <Button variant="danger" onClick={checkConflicts}>
                Check Resource Conflicts
              </Button>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ScheduleConflictPage;