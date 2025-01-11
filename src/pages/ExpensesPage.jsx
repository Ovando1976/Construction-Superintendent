// src/pages/ExpensesPage.jsx

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
import moment from "moment";

function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    date: "",
    category: "General",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const addExpense = (e) => {
    e.preventDefault();
    if (formData.name.trim() && formData.date) {
      setExpenses((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          name: formData.name.trim(),
          amount: Number(formData.amount) || 0,
          date: formData.date,
          category: formData.category,
        },
      ]);
      setFormData({ name: "", amount: "", date: "", category: "General" });
    }
  };

  const deleteExpense = (id) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
  };

  return (
    <Container fluid className="py-4 bg-light min-vh-100">
      <Row className="mb-3">
        <Col>
          <h2 className="text-primary">Expenses</h2>
          <p className="text-secondary">
            Record all expenses related to your construction project: materials,
            labor, overhead, etc.
          </p>
        </Col>
      </Row>

      <Row>
        {/* Add Expense Form */}
        <Col lg={4}>
          <Card className="mb-4">
            <Card.Header className="bg-info text-white">
              <Card.Title className="mb-0">Add New Expense</Card.Title>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={addExpense}>
                <Form.Group className="mb-3" controlId="expName">
                  <Form.Label>Expense Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="E.g. Cement purchase"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="expAmount">
                  <Form.Label>Amount</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="0"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="expDate">
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="expCategory">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="General">General</option>
                    <option value="Labor">Labor</option>
                    <option value="Materials">Materials</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Subcontractor">Subcontractor</option>
                  </Form.Select>
                </Form.Group>

                <Button variant="primary" type="submit">
                  Add Expense
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Expense Table */}
        <Col lg={8}>
          <Card>
            <Card.Header className="bg-warning">
              <Card.Title className="mb-0">Expense Records</Card.Title>
            </Card.Header>
            <Card.Body>
              {expenses.length === 0 ? (
                <p className="text-muted">No expenses recorded yet.</p>
              ) : (
                <Table bordered hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Expense</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Category</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((exp) => (
                      <tr key={exp.id}>
                        <td>{exp.id}</td>
                        <td>{exp.name}</td>
                        <td>{exp.amount}</td>
                        <td>{moment(exp.date).format("YYYY-MM-DD")}</td>
                        <td>{exp.category}</td>
                        <td>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => deleteExpense(exp.id)}
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

export default ExpensesPage;