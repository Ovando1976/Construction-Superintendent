// src/pages/MaterialsPage.jsx

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

function MaterialsPage() {
  const [materials, setMaterials] = useState([]);
  const [formData, setFormData] = useState({ name: "", quantity: "", unit: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addMaterial = (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      setMaterials((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          name: formData.name.trim(),
          quantity: Number(formData.quantity) || 0,
          unit: formData.unit || "pcs",
        },
      ]);
      setFormData({ name: "", quantity: "", unit: "" });
    }
  };

  const deleteMaterial = (id) => {
    setMaterials((prev) => prev.filter((mat) => mat.id !== id));
  };

  return (
    <Container fluid className="py-4 bg-light min-vh-100">
      <Row className="mb-3">
        <Col>
          <h2 className="text-primary">Materials</h2>
          <p className="text-secondary">
            Manage all construction materials here. Track name, quantity, and
            units in stock.  
          </p>
        </Col>
      </Row>

      <Row>
        {/* Add Material Form */}
        <Col lg={4}>
          <Card className="mb-4">
            <Card.Header className="bg-info text-white">
              <Card.Title className="mb-0">Add New Material</Card.Title>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={addMaterial}>
                <Form.Group className="mb-3" controlId="matName">
                  <Form.Label>Material Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="E.g. Lumber, Steel Rod, Cement"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="matQuantity">
                  <Form.Label>Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="0"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="matUnit">
                  <Form.Label>Unit</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. pcs, bags, kg"
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Button variant="primary" type="submit">
                  Add Material
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Materials Table */}
        <Col lg={8}>
          <Card>
            <Card.Header className="bg-warning">
              <Card.Title className="mb-0">Material List</Card.Title>
            </Card.Header>
            <Card.Body>
              {materials.length === 0 ? (
                <p className="text-muted">No materials added yet.</p>
              ) : (
                <Table bordered hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Material</th>
                      <th>Quantity</th>
                      <th>Unit</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map((mat) => (
                      <tr key={mat.id}>
                        <td>{mat.id}</td>
                        <td>{mat.name}</td>
                        <td>{mat.quantity}</td>
                        <td>{mat.unit}</td>
                        <td>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => deleteMaterial(mat.id)}
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

export default MaterialsPage;