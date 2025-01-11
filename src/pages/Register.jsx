import React, { useState } from 'react';
import axios from '../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';

// React-Bootstrap components
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'superintendent', // Default role
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Handle changes in the form fields
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Submit the form via axios and navigate to login on success
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/auth/register', formData);
      navigate('/login');
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <Container
      fluid
      className="bg-light min-vh-100 d-flex align-items-center justify-content-center"
    >
      <Row className="w-100">
        {/* Increase column width for bigger card */}
        <Col xs={12} md={10} lg={8} className="mx-auto">
          {/* Add custom maxWidth style for even wider card */}
          <Card className="shadow-sm" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <Card.Header className="bg-primary text-white">
              <Card.Title className="mb-0">Register</Card.Title>
            </Card.Header>

            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                {/* Name Field */}
                <Form.Group controlId="registerName" className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                {/* Email Field */}
                <Form.Group controlId="registerEmail" className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Enter a valid email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                {/* Password Field */}
                <Form.Group controlId="registerPassword" className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Choose a secure password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                {/* Role Selection */}
                <Form.Group controlId="registerRole" className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Select name="role" value={formData.role} onChange={handleChange}>
                    <option value="superintendent">Superintendent</option>
                    <option value="worker">Worker</option>
                    <option value="manager">Manager</option>
                  </Form.Select>
                </Form.Group>

                <Button variant="primary" type="submit">
                  Register
                </Button>
              </Form>
            </Card.Body>

            <Card.Footer>
              <small className="text-muted">
                Already registered?{' '}
                <span
                  className="text-primary"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate('/login')}
                >
                  Login here.
                </span>
              </small>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;