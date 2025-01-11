import React, { useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
} from 'react-bootstrap';

function HomeTab() {
  // ----- Simple In-Memory Chat State -----
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Mock "send" that just appends the message locally.
  // Replace this with Socket.IO or a backend endpoint for real-time multi-user chat.
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const msgObj = {
        id: messages.length + 1,
        text: newMessage.trim(),
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, msgObj]);
      setNewMessage('');
    }
  };

  return (
    <Container fluid className="mt-4">
      {/* ----- Hero Section ----- */}
      <Row className="mb-4">
        <Col>
          <Card className="bg-light">
            <Card.Body>
              <h1 className="text-primary mb-3">Welcome to the Construction Management App!</h1>
              <p className="text-secondary">
                This app is designed to help you manage your construction project
                from start to finish. Use the tabs above to access features like
                budget management, scheduling, employees, tools, tasks, and more.
              </p>
              <h4>How to Manage a Construction Project Using This App</h4>
              <ul>
                <li><strong>Create a Project:</strong> Go to the <em>Projects</em> tab, add a new project, and detail important info such as location, start date, and end date.</li>
                <li><strong>Plan Your Budget:</strong> Use the <em>Budget</em> tab to estimate costs, allocate funds, and monitor expenses.</li>
                <li><strong>Schedule Tasks:</strong> In the <em>Schedule</em> tab, create tasks, assign them to employees, and track their progress on a calendar view.</li>
                <li><strong>Track Employees & Time:</strong> The <em>Employees</em> tab helps you add team members, manage roles, and even track hours worked.</li>
                <li><strong>Manage Tools:</strong> Under the <em>Tools</em> tab, add and update equipment or machinery. Monitor usage, schedule maintenance, and ensure availability.</li>
                <li><strong>Daily Reports:</strong> Log weather conditions, crew count, equipment usage, and safety incidents to keep a historical record of each day’s work.</li>
                <li><strong>AI Assistance:</strong> Some forms offer an “AI Suggest” button. Use it to quickly fill out repetitive fields or get risk/hazard suggestions based on typical scenarios.</li>
                <li><strong>Chat & Collaborate:</strong> Use the chat feature below (or the dedicated Chat tab if provided) to quickly discuss tasks, share updates, or ask questions.</li>
              </ul>
              <p className="text-secondary">
                By following these steps, you’ll have a clear overview of your project’s
                budget, tasks, tools, and employees—all in one place. Let’s build something great!
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ----- Simple Chat Feature (Local Only) ----- */}
      <Row>
        <Col md={6}>
          <Card>
            <Card.Header className="bg-primary text-white">
              <Card.Title className="mb-0">Project Chat</Card.Title>
            </Card.Header>
            <Card.Body style={{ height: '300px', overflowY: 'auto' }}>
              {messages.length === 0 ? (
                <p className="text-muted">No messages yet. Start chatting below.</p>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} style={{ marginBottom: '10px' }}>
                    <strong>{`User`}</strong>
                    <span className="text-muted" style={{ marginLeft: '8px', fontSize: '0.9rem' }}>
                      {msg.timestamp}
                    </span>
                    <p style={{ margin: 0 }}>{msg.text}</p>
                  </div>
                ))
              )}
            </Card.Body>
            <Card.Footer>
              <Form onSubmit={handleSendMessage} className="d-flex">
                <Form.Control
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="me-2"
                />
                <Button variant="success" type="submit">
                  Send
                </Button>
              </Form>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default HomeTab;