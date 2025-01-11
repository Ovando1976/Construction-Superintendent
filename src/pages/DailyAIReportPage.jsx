// src/pages/DailyReportPageWithAI.jsx
import React, { useState } from 'react';
import axios from '../utils/axiosConfig';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';

function DailyAIReportPage() {
  const [formData, setFormData] = useState({
    weather: '',
    crewCount: '',
    equipmentUsed: '',
    safetyIncidents: '',
  });
  const [aiLoading, setAiLoading] = useState(false);

  // Basic function to call your own backend route that hits OpenAI API
  const handleAISuggest = async (fieldName) => {
    try {
      setAiLoading(true);
      // Example: call your backend to get AI suggestion
      // e.g. POST /api/ai-suggest with the context
      const response = await axios.post('/ai-suggest', {
        context: fieldName,
        // Include existing form data if needed for better suggestions
        // e.g., the weather or known hazards
      });
      setFormData((prev) => ({ ...prev, [fieldName]: response.data.suggestion }));
    } catch (error) {
      console.error('AI Suggestion failed:', error);
    } finally {
      setAiLoading(false);
    }
  };

  // Example form submission logic omitted for brevity
  // ...

  return (
    <Container className="mt-4">
      <Row>
        <Col md={8} lg={6}>
          <Card>
            <Card.Header className="bg-secondary text-white">
              AI-Powered Daily Report
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Equipment Used</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="equipmentUsed"
                  value={formData.equipmentUsed}
                  onChange={(e) =>
                    setFormData({ ...formData, equipmentUsed: e.target.value })
                  }
                  placeholder="List equipment or machinery used today..."
                />
                <div className="text-end mt-2">
                  <Button
                    variant="info"
                    size="sm"
                    onClick={() => handleAISuggest('equipmentUsed')}
                    disabled={aiLoading}
                  >
                    {aiLoading ? 'Suggesting...' : 'AI Suggest'}
                  </Button>
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Safety Incidents</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="safetyIncidents"
                  value={formData.safetyIncidents}
                  onChange={(e) =>
                    setFormData({ ...formData, safetyIncidents: e.target.value })
                  }
                  placeholder="Describe any incidents or concerns..."
                />
                <div className="text-end mt-2">
                  <Button
                    variant="info"
                    size="sm"
                    onClick={() => handleAISuggest('safetyIncidents')}
                    disabled={aiLoading}
                  >
                    {aiLoading ? 'Suggesting...' : 'AI Suggest'}
                  </Button>
                </div>
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default DailyAIReportPage;