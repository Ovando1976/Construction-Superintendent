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

function ToolsTab() {
  const [tools, setTools] = useState([]);
  const [newTool, setNewTool] = useState("");

  const addTool = () => {
    if (newTool.trim()) {
      setTools((prevTools) => [
        ...prevTools,
        { id: prevTools.length + 1, name: newTool },
      ]);
      setNewTool("");
    }
  };

  return (
    <Container fluid className="py-4 bg-light min-vh-100">
      <Row className="mb-4">
        <Col>
          <h1 className="text-primary">Tool Management</h1>
          <p className="text-secondary">
            Use this page to manage your construction tools. Add tools, track
            usage, and schedule maintenance.
          </p>
        </Col>
      </Row>

      <Row>
        {/* Left column: Add a new tool */}
        <Col lg={4} className="mb-4">
          <Card>
            <Card.Header className="bg-warning">
              <Card.Title className="mb-0">Add a New Tool</Card.Title>
            </Card.Header>
            <Card.Body>
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  addTool();
                }}
              >
                <Form.Group className="mb-3" controlId="formNewTool">
                  <Form.Label>Tool Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter tool name"
                    value={newTool}
                    onChange={(e) => setNewTool(e.target.value)}
                  />
                </Form.Group>
                <Button variant="primary" type="submit">
                  Add Tool
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Right column: Tool list */}
        <Col lg={8}>
          <Card>
            <Card.Header className="bg-info text-white">
              <Card.Title className="mb-0">Tool Inventory</Card.Title>
            </Card.Header>
            <Card.Body>
              {tools.length === 0 ? (
                <p className="text-muted">No tools added yet.</p>
              ) : (
                <ListGroup variant="flush">
                  {tools.map((tool) => (
                    <ListGroup.Item key={tool.id}>
                      {tool.name}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ToolsTab;