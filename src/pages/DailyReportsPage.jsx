// src/pages/DailyReportsPage.jsx

import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  ListGroup,
} from "react-bootstrap";
import moment from "moment";
import  supabase  from "../utils/supabaseClient"; // Adjust your path
import DailyAIReportPage from "./DailyAIReportPage";
function DailyReportsPage() {
  const [reports, setReports] = useState([]);

  // Master formData for the entire daily report
  const [formData, setFormData] = useState({
    date: "",
    weather: "",
    crewCount: "",
    equipmentUsed: "",
    safetyIncidents: "",
    foundationCheck: false,
    framingCheck: false,
    roofingCheck: false,
    mepCheck: false,
    housekeepingCheck: false,
    safetyAnalysis: "",
    employees: [],
  });

  // Sub-form to add employees by trade
  const [employeeName, setEmployeeName] = useState("");
  const [employeeTrade, setEmployeeTrade] = useState("Carpenter");

  // 1) Load existing daily reports from Supabase on mount
  useEffect(() => {
    const fetchReports = async () => {
      const { data, error } = await supabase
        .from("daily_reports")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        console.error("Error fetching daily reports:", error);
      } else if (data) {
        setReports(data);
      }
    };

    fetchReports();
  }, []);

  // Handle form changes for checkboxes, text fields, etc.
  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Add an employee to the sub-array
  const addEmployee = (e) => {
    e.preventDefault();
    const trimmedName = employeeName.trim();
    if (trimmedName) {
      const newEmployee = {
        id: formData.employees.length + 1,
        name: trimmedName,
        trade: employeeTrade,
      };
      setFormData((prev) => ({
        ...prev,
        employees: [...prev.employees, newEmployee],
      }));
      // Reset sub-form
      setEmployeeName("");
      setEmployeeTrade("Carpenter");
    }
  };

  // Delete an employee from the sub-array (local only, prior to submit)
  const deleteEmployeeLocal = (empId) => {
    setFormData((prev) => ({
      ...prev,
      employees: prev.employees.filter((emp) => emp.id !== empId),
    }));
  };

  // 2) Submit entire daily report -> Insert into Supabase
  const submitReport = async (e) => {
    e.preventDefault();
    if (!formData.date) {
      alert("Please select a date before submitting.");
      return;
    }

    // Build the row to insert
    const newReportRow = {
      date: formData.date,
      weather: formData.weather,
      crew_count: parseInt(formData.crewCount) || 0,
      equipment_used: formData.equipmentUsed,
      safety_incidents: formData.safetyIncidents,
      foundation_check: formData.foundationCheck,
      framing_check: formData.framingCheck,
      roofing_check: formData.roofingCheck,
      mep_check: formData.mepCheck,
      housekeeping_check: formData.housekeepingCheck,
      safety_analysis: formData.safetyAnalysis,
      employees: formData.employees, // JSON field
    };

    // Insert into Supabase
    const { data, error } = await supabase
      .from("daily_reports")
      .insert([newReportRow])
      .select(); // .select() returns the inserted rows

    if (error) {
      console.error("Error inserting daily report:", error);
      alert("Failed to submit report. Check console for details.");
      return;
    }

    // Insert successful
    if (data && data.length > 0) {
      const insertedReport = data[0];
      // Merge into local state
      setReports((prev) => [...prev, insertedReport]);
      // Clear the form
      setFormData({
        date: "",
        weather: "",
        crewCount: "",
        equipmentUsed: "",
        safetyIncidents: "",
        foundationCheck: false,
        framingCheck: false,
        roofingCheck: false,
        mepCheck: false,
        housekeepingCheck: false,
        safetyAnalysis: "",
        employees: [],
      });
      setEmployeeName("");
      setEmployeeTrade("Carpenter");
    }
  };

  // 3) Delete entire report from Supabase
  const deleteReport = async (id) => {
    const { error } = await supabase
      .from("daily_reports")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting daily report:", error);
      alert("Failed to delete report. Check console for details.");
      return;
    }
    // Remove from local state
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <Container fluid className="py-4 bg-light min-vh-100">
      <Row className="mb-3">
        <Col>
          <h2 className="text-primary">Daily Reports (Supabase)</h2>
          <p className="text-secondary">
            Log the day’s weather, crew size, site inspection, safety analysis,
            employees, and any incidents. Data is stored in Supabase.
          </p>
        </Col>
      </Row>

      <Row>
        {/* Form for new or edit daily report */}
        <Col lg={5}>
          <Card className="mb-4">
            <Card.Header className="bg-info text-white">
              <Card.Title className="mb-0">New Daily Report</Card.Title>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={submitReport}>
                <Form.Group className="mb-3">
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Weather</Form.Label>
                  <Form.Control
                    type="text"
                    name="weather"
                    placeholder="Sunny, cloudy, rainy..."
                    value={formData.weather}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Crew Count</Form.Label>
                  <Form.Control
                    type="number"
                    name="crewCount"
                    value={formData.crewCount}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Equipment Used</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="equipmentUsed"
                    placeholder="List key equipment usage"
                    value={formData.equipmentUsed}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Safety Incidents</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="safetyIncidents"
                    placeholder="Describe incidents or concerns..."
                    value={formData.safetyIncidents}
                    onChange={handleChange}
                  />
                </Form.Group>

                {/* Site Inspection Checkboxes */}
                <h5 className="mt-4">Site Inspection Checklist</h5>
                <Form.Check
                  type="checkbox"
                  id="foundationCheck"
                  name="foundationCheck"
                  label="Foundation OK"
                  checked={formData.foundationCheck}
                  onChange={handleChange}
                  className="mb-2"
                />
                <Form.Check
                  type="checkbox"
                  id="framingCheck"
                  name="framingCheck"
                  label="Framing OK"
                  checked={formData.framingCheck}
                  onChange={handleChange}
                  className="mb-2"
                />
                <Form.Check
                  type="checkbox"
                  id="roofingCheck"
                  name="roofingCheck"
                  label="Roofing OK"
                  checked={formData.roofingCheck}
                  onChange={handleChange}
                  className="mb-2"
                />
                <Form.Check
                  type="checkbox"
                  id="mepCheck"
                  name="mepCheck"
                  label="MEP (Mechanical/Electrical/Plumbing) OK"
                  checked={formData.mepCheck}
                  onChange={handleChange}
                  className="mb-2"
                />
                <Form.Check
                  type="checkbox"
                  id="housekeepingCheck"
                  name="housekeepingCheck"
                  label="Housekeeping / Cleanliness"
                  checked={formData.housekeepingCheck}
                  onChange={handleChange}
                  className="mb-4"
                />

                {/* Safety Analysis */}
                <Form.Group className="mb-3">
                  <Form.Label>Safety Analysis / Hazard Review</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="safetyAnalysis"
                    placeholder="Any potential hazards or issues found?"
                    value={formData.safetyAnalysis}
                    onChange={handleChange}
                  />
                </Form.Group>

                {/* Employees by Trade */}
                <h5 className="mt-4">Employees by Trade</h5>
                {formData.employees.length > 0 && (
                  <ListGroup className="mb-3">
                    {formData.employees.map((emp) => (
                      <ListGroup.Item key={emp.id} className="d-flex justify-content-between">
                        <div>
                          <strong>{emp.name}</strong> - {emp.trade}
                        </div>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => deleteEmployeeLocal(emp.id)}
                        >
                          Remove
                        </Button>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}

                <div className="d-flex align-items-center mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Employee Name"
                    className="me-2"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                  />
                  <Form.Select
                    className="me-2"
                    value={employeeTrade}
                    onChange={(e) => setEmployeeTrade(e.target.value)}
                  >
                    <option value="Carpenter">Carpenter</option>
                    <option value="Electrician">Electrician</option>
                    <option value="Plumber">Plumber</option>
                    <option value="Mason">Mason</option>
                    <option value="Welder">Welder</option>
                    <option value="Painter">Painter</option>
                    <option value="Roofer">Roofer</option>
                  </Form.Select>
                  <Button variant="secondary" onClick={addEmployee}>
                    Add
                  </Button>
                </div>

                <Button variant="primary" type="submit">
                  Submit Report
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Display existing daily reports from Supabase */}
        <Col lg={7}>
          <Card>
            <Card.Header className="bg-warning">
              <Card.Title className="mb-0">Daily Report History</Card.Title>
            </Card.Header>
            <Card.Body>
              {reports.length === 0 ? (
                <p className="text-muted">No reports yet.</p>
              ) : (
                <ListGroup>
                  {reports.map((r) => (
                    <ListGroup.Item key={r.id}>
                      <Row>
                        <Col>
                          <div>
                            <strong>
                              {moment(r.date).format("YYYY-MM-DD")}
                            </strong>
                          </div>
                          <em>Weather:</em> {r.weather} | <em>Crew:</em>{" "}
                          {r.crew_count}
                          <br />
                          <em>Equipment:</em> {r.equipment_used}
                          <br />
                          <em>Safety Incidents:</em> {r.safety_incidents}
                          <br />
                          <strong>Site Inspection:</strong>
                          <ul className="mb-0">
                            {r.foundation_check && <li>Foundation OK</li>}
                            {r.framing_check && <li>Framing OK</li>}
                            {r.roofing_check && <li>Roofing OK</li>}
                            {r.mep_check && <li>MEP OK</li>}
                            {r.housekeeping_check && <li>Housekeeping OK</li>}
                          </ul>
                          {r.safety_analysis && (
                            <>
                              <strong>Safety Analysis:</strong> {r.safety_analysis}
                              <br />
                            </>
                          )}
                          {r.employees && r.employees.length > 0 && (
                            <>
                              <strong>Employees:</strong>
                              <ul className="mb-0">
                                {r.employees.map((emp) => (
                                  <li key={emp.id}>
                                    {emp.name} ({emp.trade})
                                  </li>
                                ))}
                              </ul>
                            </>
                          )}
                        </Col>
                        <Col xs="auto">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => deleteReport(r.id)}
                          >
                            Delete
                          </Button>
                        </Col>
                      </Row>
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

export default DailyReportsPage;