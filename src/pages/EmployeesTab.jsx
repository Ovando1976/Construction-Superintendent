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

function EmployeesTab() {
  const [employees, setEmployees] = useState([]);
  const [newEmployee, setNewEmployee] = useState("");
  const [role, setRole] = useState("Worker");
  const [searchTerm, setSearchTerm] = useState("");

  // Add new employee
  const addEmployee = (e) => {
    e.preventDefault();
    const trimmedName = newEmployee.trim();
    if (trimmedName) {
      const newEmp = {
        id: employees.length + 1,
        name: trimmedName,
        role: role || "Worker",
        isClockedIn: false,
        clockInTime: null,
        totalHours: 0, // total hours tracked so far
      };
      setEmployees((prev) => [...prev, newEmp]);
      setNewEmployee("");
      setRole("Worker");
    }
  };

  // Delete an employee
  const deleteEmployee = (empId) => {
    setEmployees((prev) => prev.filter((emp) => emp.id !== empId));
  };

  // Search / Filter employees
  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle clock in
  const handleClockIn = (empId) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === empId) {
          return {
            ...emp,
            isClockedIn: true,
            clockInTime: new Date(), // Record current time
          };
        }
        return emp;
      })
    );
  };

  // Handle clock out
  const handleClockOut = (empId) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === empId && emp.isClockedIn) {
          const now = new Date();
          const hoursWorked =
            (now.getTime() - emp.clockInTime.getTime()) / 3600000; // convert ms to hours
          return {
            ...emp,
            isClockedIn: false,
            clockInTime: null,
            totalHours: emp.totalHours + hoursWorked,
          };
        }
        return emp;
      })
    );
  };

  return (
    <Container fluid className="py-4">
      <Row>
        <Col lg={6}>
          <Card className="mb-4">
            <Card.Header className="bg-primary text-white">
              <Card.Title className="mb-0">Add New Employee</Card.Title>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={addEmployee}>
                {/* Employee Name */}
                <Form.Group className="mb-3" controlId="formEmployeeName">
                  <Form.Label>Employee Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter employee name"
                    value={newEmployee}
                    onChange={(e) => setNewEmployee(e.target.value)}
                  />
                </Form.Group>

                {/* Role Selection */}
                <Form.Group className="mb-3" controlId="formEmployeeRole">
                  <Form.Label>Role</Form.Label>
                  <Form.Select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="Worker">Worker</option>
                    <option value="Superintendent">Superintendent</option>
                    <option value="Manager">Manager</option>
                  </Form.Select>
                </Form.Group>

                <Button variant="success" type="submit">
                  Add Employee
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card>
            <Card.Header className="bg-info text-white">
              <Card.Title className="mb-0">Employee List</Card.Title>
            </Card.Header>
            <Card.Body>
              {employees.length === 0 ? (
                <p className="text-muted">
                  No employees yet. Add a new employee using the form.
                </p>
              ) : (
                <>
                  {/* Search Field */}
                  <Form.Group className="mb-3" controlId="searchEmployees">
                    <Form.Label>Search Employees</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter name to search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </Form.Group>

                  <Table bordered hover>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Time Tracking</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmployees.map((emp) => {
                        const isClockedIn = emp.isClockedIn;
                        const totalHours = emp.totalHours.toFixed(2); // round to 2 decimals

                        return (
                          <tr key={emp.id}>
                            <td>{emp.id}</td>
                            <td>{emp.name}</td>
                            <td>{emp.role}</td>
                            <td>
                              <div>
                                <strong>{isClockedIn ? "Clocked In" : "Clocked Out"}</strong>
                                <br />
                                Total Hours: {totalHours}
                                <br />
                                {isClockedIn ? (
                                  <Button
                                    variant="warning"
                                    size="sm"
                                    className="mt-1"
                                    onClick={() => handleClockOut(emp.id)}
                                  >
                                    Clock Out
                                  </Button>
                                ) : (
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    className="mt-1"
                                    onClick={() => handleClockIn(emp.id)}
                                  >
                                    Clock In
                                  </Button>
                                )}
                              </div>
                            </td>
                            <td>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => deleteEmployee(emp.id)}
                              >
                                Delete
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default EmployeesTab;