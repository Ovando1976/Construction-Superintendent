// src/pages/EquipmentPage.jsx

import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
} from "react-bootstrap";

function EquipmentPage() {
  const [equipmentList, setEquipmentList] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    status: "Available",
    usageHours: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addEquipment = (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      setEquipmentList((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          name: formData.name.trim(),
          status: formData.status,
          usageHours: Number(formData.usageHours) || 0,
        },
      ]);
      setFormData({ name: "", status: "Available", usageHours: "" });
    }
  };

  const deleteEquipment = (eqId) => {
    setEquipmentList((prev) => prev.filter((eq) => eq.id !== eqId));
  };

  const updateStatus = (eqId, newStatus) => {
    setEquipmentList((prev) =>
      prev.map((eq) => (eq.id === eqId ? { ...eq, status: newStatus } : eq))
    );
  };

  return (
    <Container fluid className="py-4 bg-light min-vh-100">
      <Row className="mb-3">
        <Col>
          <h2 className="text-primary">Equipment Management</h2>
          <p className="text-secondary">
            Track construction equipment, usage hours, and status (e.g.
            available, under maintenance).
          </p>
        </Col>
      </Row>

      <Row>
        {/* Add Equipment Form */}
        <Col lg={4}>
          <Card className="mb-4">
            <Card.Header className="bg-info text-white">
              <Card.Title className="mb-0">Add New Equipment</Card.Title>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={addEquipment}>
                <Form.Group className="mb-3" controlId="eqName">
                  <Form.Label>Equipment Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="E.g. Crane, Excavator"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="eqStatus">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Available">Available</option>
                    <option value="In Use">In Use</option>
                    <option value="Maintenance">Maintenance</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3" controlId="eqUsageHours">
                  <Form.Label>Usage (hours)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="0"
                    name="usageHours"
                    value={formData.usageHours}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Button variant="primary" type="submit">
                  Add Equipment
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Equipment Table */}
        <Col lg={8}>
          <Card>
            <Card.Header className="bg-warning">
              <Card.Title className="mb-0">Equipment List</Card.Title>
            </Card.Header>
            <Card.Body>
              {equipmentList.length === 0 ? (
                <p className="text-muted">No equipment added yet.</p>
              ) : (
                <Table bordered hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Equipment</th>
                      <th>Status</th>
                      <th>Usage (hrs)</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {equipmentList.map((eq) => (
                      <tr key={eq.id}>
                        <td>{eq.id}</td>
                        <td>{eq.name}</td>
                        <td>{eq.status}</td>
                        <td>{eq.usageHours}</td>
                        <td>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="me-2"
                            onClick={() => updateStatus(eq.id, "Maintenance")}
                          >
                            Maintenance
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => deleteEquipment(eq.id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default EquipmentPage;