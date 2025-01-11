// src/pages/HomeDashboard.jsx
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { PieChart, Pie, Cell, Legend } from 'recharts';
import axios from '../utils/axiosConfig';

function Dashboard() {
  const [tasksData, setTasksData] = useState([]);
  const [equipmentUsage, setEquipmentUsage] = useState([]);

  useEffect(() => {
    // Example: fetch tasks from backend
    axios.get('/tasks/summary').then((res) => {
      // Suppose the backend returns an array of { status: 'Completed', count: 10 } etc.
      setTasksData(res.data);
    });

    // Similarly for equipment usage
    axios.get('/equipment/usage').then((res) => {
      // Suppose the backend returns an array of { name: 'Crane', hours: 40 }
      setEquipmentUsage(res.data);
    });
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <Container fluid className="py-4 bg-light min-vh-100">
      <Row className="mb-4">
        <Col>
          <h1>Dashboard</h1>
          <p className="text-secondary">Quick insights into tasks and equipment usage</p>
        </Col>
      </Row>

      <Row>
        {/* Tasks by Status */}
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header className="bg-info text-white">
              <Card.Title className="mb-0">Tasks by Status</Card.Title>
            </Card.Header>
            <Card.Body>
              {tasksData.length > 0 ? (
                <PieChart width={300} height={300}>
                  <Pie
                    data={tasksData}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
                    {tasksData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              ) : (
                <p className="text-muted">No task data available</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Equipment Usage */}
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header className="bg-warning">
              <Card.Title className="mb-0">Top Equipment Usage</Card.Title>
            </Card.Header>
            <Card.Body>
              {equipmentUsage.length > 0 ? (
                <ul>
                  {equipmentUsage.map((eq) => (
                    <li key={eq.name}>
                      {eq.name}: {eq.hours} hours
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">No equipment usage data available</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard;