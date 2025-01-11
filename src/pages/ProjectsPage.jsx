// src/pages/ProjectsPage.js

import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Button,
  Nav,
  Tab,
  ProgressBar,
  Form,
  Modal,
  Alert,
} from 'react-bootstrap';
import { useReactToPrint } from 'react-to-print';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import supabase from '../utils/supabaseClient';
import ProjectTaskBoard from '../components/projects/ProjectTaskBoard';
import ProjectTeamList from '../components/projects/ProjectTeamList';
import ProjectDocuments from '../components/projects/ProjectDocuments';
import './projectsSlides.css';

function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);

  // The newProject object matches the fields we want to send to the backend:
  const [newProject, setNewProject] = useState({
    projectName: '',
    projectDescription: '',
    scope: '',
    siteLocation: '',
    siteCondition: '',
    startDate: '',
    endDate: '',
    status: '', 
    estimatedBudget: '',
    assignedTeamLeader: '',
    assignedTeamMembers: '',
    tasksList: '',
    materialList: '',
    equipmentList: '',
    toolsList: '',
    // File arrays
    relevantDocuments: [],
    photos: [],
    charts: [],
  });

  const [formError, setFormError] = useState(null);

  // For printing
  const projectsSectionRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => projectsSectionRef.current,
    documentTitle: 'ProjectsReport',
    pageStyle: `
      @page {
        size: A4;
        margin: 20mm;
      }
      body {
        font-family: sans-serif;
      }
    `,
  });

  // Fetch all projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        setProjects(data);
      } catch (err) {
        console.error('Error fetching projects:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // When user clicks a project in the sidebar, fetch details from the backend
  const handleProjectClick = async (projectId) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) throw new Error('Failed to fetch project details');
      const project = await response.json();
      setSelectedProject(project);
    } catch (err) {
      console.error('Error fetching project details:', err);
      setError(err.message);
    }
  };

  // Handle text input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject({ ...newProject, [name]: value });
  };

  // Handle file input changes
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const fileArray = Array.from(files);
    setNewProject({ ...newProject, [name]: fileArray });
  };

  // Basic form validation
  const validateForm = () => {
    if (
      !newProject.projectName ||
      !newProject.projectDescription ||
      !newProject.scope ||
      !newProject.siteLocation ||
      !newProject.siteCondition ||
      !newProject.startDate ||
      !newProject.endDate ||
      !newProject.status ||
      !newProject.estimatedBudget ||
      !newProject.assignedTeamLeader
    ) {
      return 'Please fill in all the required fields.';
    }
    if (isNaN(newProject.estimatedBudget) || newProject.estimatedBudget <= 0) {
      return 'Estimated budget must be a positive number.';
    }
    if (new Date(newProject.startDate) > new Date(newProject.endDate)) {
      return 'Start date must be before the end date.';
    }
    return null;
  };

  // Create project submission
  const handleCreateProject = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      // Helper to upload a single file to a supabase bucket
      const uploadFile = async (file, bucketName) => {
        const filePath = `${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });
        if (error) throw error;

        const { publicURL, error: publicUrlError } = supabase.storage
          .from(bucketName)
          .getPublicUrl(data.path);
        if (publicUrlError) throw publicUrlError;

        return publicURL;
      };

      // Upload relevant documents
      const relevantDocumentsURLs = [];
      for (const file of newProject.relevantDocuments) {
        const url = await uploadFile(file, 'relevant-documents');
        relevantDocumentsURLs.push(url);
      }
      // Upload photos
      const photosURLs = [];
      for (const file of newProject.photos) {
        const url = await uploadFile(file, 'photos');
        photosURLs.push(url);
      }
      // Upload charts
      const chartsURLs = [];
      for (const file of newProject.charts) {
        const url = await uploadFile(file, 'charts');
        chartsURLs.push(url);
      }

      // Prepare data to send to the backend route "/api/projects" 
      // with the naming the backend expects
      const requestBody = {
        project_name: newProject.projectName,
        project_description: newProject.projectDescription,
        scope: newProject.scope,
        site_location: newProject.siteLocation,
        site_condition: newProject.siteCondition,
        start_date: newProject.startDate,
        end_date: newProject.endDate,
        status: newProject.status,
        estimated_budget: parseFloat(newProject.estimatedBudget),

        // Additional arrays for tasks, materials, etc. if your DB has them
        // The backend would handle them if your DB schema is set up
        assigned_team_leader: newProject.assignedTeamLeader,
        assigned_team_members: newProject.assignedTeamMembers
          ? newProject.assignedTeamMembers.split(',').map(m => m.trim())
          : [],
        tasks_list: newProject.tasksList
          ? newProject.tasksList.split(',').map(t => t.trim())
          : [],
        material_list: newProject.materialList
          ? newProject.materialList.split(',').map(m => m.trim())
          : [],
        equipment_list: newProject.equipmentList
          ? newProject.equipmentList.split(',').map(e => e.trim())
          : [],
        tools_list: newProject.toolsList
          ? newProject.toolsList.split(',').map(t => t.trim())
          : [],
        
        relevant_documents: relevantDocumentsURLs,
        photos: photosURLs,
        charts: chartsURLs,
      };

      // POST to our backend route
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error('Failed to create project');
      const createdProject = await response.json();

      // Prepend to local list
      setProjects((prev) => [createdProject, ...prev]);
      setShowCreateModal(false);

      // Reset form
      setNewProject({
        projectName: '',
        projectDescription: '',
        scope: '',
        siteLocation: '',
        siteCondition: '',
        startDate: '',
        endDate: '',
        status: '',
        estimatedBudget: '',
        assignedTeamLeader: '',
        assignedTeamMembers: '',
        tasksList: '',
        materialList: '',
        equipmentList: '',
        toolsList: '',
        relevantDocuments: [],
        photos: [],
        charts: [],
      });
      setFormError(null);
    } catch (err) {
      console.error('Error creating project:', err.message);
      setFormError(err.message || 'Failed to create project. Please try again.');
    }
  };

  return (
    <Container fluid className="py-4 bg-light min-vh-100">
      <Row>
        {/* LEFT SIDEBAR */}
        <Col md={3} className="sidebar-container">
          <h4 className="mb-3">Projects</h4>
          {loading ? (
            <p>Loading projects...</p>
          ) : error ? (
            <p className="text-danger">{error}</p>
          ) : (
            <>
              <Button
                variant="success"
                className="w-100 mb-3"
                onClick={() => setShowCreateModal(true)}
              >
                + Create New Project
              </Button>
              <div className="sidebar-project-list">
                {projects.length > 0 ? (
                  projects.map((proj) => (
                    <div
                      key={proj.id}
                      className={`sidebar-project-item ${
                        selectedProject && selectedProject.id === proj.id
                          ? 'active'
                          : ''
                      }`}
                      onClick={() => handleProjectClick(proj.id)}
                    >
                      <strong>{proj.project_name || proj.name}</strong>
                      <br />
                      <small>ID: {proj.id}</small>
                    </div>
                  ))
                ) : (
                  <p>No projects available</p>
                )}
              </div>
            </>
          )}
        </Col>

        {/* MAIN "SLIDE" AREA */}
        <Col md={9}>
          <TransitionGroup>
            {selectedProject && (
              <CSSTransition
                key={selectedProject.id}
                timeout={500}
                classNames="slide"
              >
                <div
                  ref={projectsSectionRef}
                  className="slide-detail-container shadow-sm"
                >
                  {/* HEADER */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="text-primary">
                      {selectedProject.project_name || selectedProject.name}
                    </h2>
                    <Button variant="outline-dark" onClick={handlePrint}>
                      Print / Export PDF
                    </Button>
                  </div>
                  <p className="text-muted mb-4">Project ID: {selectedProject.id}</p>

                  {/* Example: Show budget + progress, or the extra fields */}
                  <Row>
                    <Col md={6}>
                      <h6>Budget Used</h6>
                      <p>
                        ${selectedProject.budgetSpent?.toLocaleString()} / $
                        {selectedProject.estimatedBudget?.toLocaleString?.()}
                      </p>
                      <ProgressBar
                        now={
                          selectedProject.estimatedBudget
                            ? (selectedProject.budgetSpent /
                                selectedProject.estimatedBudget) *
                              100
                            : 0
                        }
                        label={`${Math.round(
                          selectedProject.estimatedBudget
                            ? (selectedProject.budgetSpent /
                                selectedProject.estimatedBudget) *
                              100
                            : 0
                        )}%`}
                      />
                    </Col>
                    <Col md={6}>
                      <h6>Project Progress</h6>
                      <p>{selectedProject.progress || 0}% Complete</p>
                      <ProgressBar
                        now={selectedProject.progress || 0}
                        label={`${selectedProject.progress || 0}%`}
                      />
                    </Col>
                  </Row>

                  {/* Tabs for tasks/team/docs, etc. */}
                  <Tab.Container defaultActiveKey="tasks">
                    <Nav variant="tabs" className="mt-3">
                      <Nav.Item>
                        <Nav.Link eventKey="tasks">Tasks</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="team">Team</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="documents">Documents</Nav.Link>
                      </Nav.Item>
                    </Nav>
                    <Tab.Content className="py-3">
                      <Tab.Pane eventKey="tasks">
                        <ProjectTaskBoard tasks={selectedProject.tasks} />
                      </Tab.Pane>
                      <Tab.Pane eventKey="team">
                        <ProjectTeamList team={selectedProject.team} />
                      </Tab.Pane>
                      <Tab.Pane eventKey="documents">
                        <ProjectDocuments documents={selectedProject.documents} />
                      </Tab.Pane>
                    </Tab.Content>
                  </Tab.Container>
                </div>
              </CSSTransition>
            )}
          </TransitionGroup>

          {/* If no selected project and not loading, show a placeholder */}
          {!selectedProject && !loading && (
            <div className="slide-detail-container d-flex align-items-center justify-content-center">
              <p>Select a project to view details</p>
            </div>
          )}
        </Col>
      </Row>

      {/* CREATE PROJECT MODAL */}
      <Modal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Create New Project</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateProject}>
          <Modal.Body>
            {formError && <Alert variant="danger">{formError}</Alert>}
            <Row>
              <Col md={6}>
                <Form.Group controlId="projectName" className="mb-3">
                  <Form.Label>Project Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="projectName"
                    value={newProject.projectName}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="projectDescription" className="mb-3">
                  <Form.Label>Project Description *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="projectDescription"
                    value={newProject.projectDescription}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="scope" className="mb-3">
                  <Form.Label>Scope *</Form.Label>
                  <Form.Control
                    type="text"
                    name="scope"
                    value={newProject.scope}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="siteLocation" className="mb-3">
                  <Form.Label>Site Location *</Form.Label>
                  <Form.Control
                    type="text"
                    name="siteLocation"
                    value={newProject.siteLocation}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="siteCondition" className="mb-3">
                  <Form.Label>Site Condition *</Form.Label>
                  <Form.Control
                    type="text"
                    name="siteCondition"
                    value={newProject.siteCondition}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="startDate" className="mb-3">
                  <Form.Label>Start Date *</Form.Label>
                  <Form.Control
                    type="date"
                    name="startDate"
                    value={newProject.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="endDate" className="mb-3">
                  <Form.Label>End Date *</Form.Label>
                  <Form.Control
                    type="date"
                    name="endDate"
                    value={newProject.endDate}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="status" className="mb-3">
                  <Form.Label>Status *</Form.Label>
                  <Form.Select
                    name="status"
                    value={newProject.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Status</option>
                    <option>Not Started</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                    <option>On Hold</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group controlId="estimatedBudget" className="mb-3">
                  <Form.Label>Estimated Budget ($) *</Form.Label>
                  <Form.Control
                    type="number"
                    name="estimatedBudget"
                    value={newProject.estimatedBudget}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                  />
                </Form.Group>

                <Form.Group controlId="assignedTeamLeader" className="mb-3">
                  <Form.Label>Assigned Team Leader *</Form.Label>
                  <Form.Control
                    type="text"
                    name="assignedTeamLeader"
                    value={newProject.assignedTeamLeader}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="assignedTeamMembers" className="mb-3">
                  <Form.Label>Assigned Team Members</Form.Label>
                  <Form.Control
                    type="text"
                    name="assignedTeamMembers"
                    value={newProject.assignedTeamMembers}
                    onChange={handleInputChange}
                    placeholder="Enter names separated by commas"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group controlId="tasksList" className="mb-3">
                  <Form.Label>Tasks List</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="tasksList"
                    value={newProject.tasksList}
                    onChange={handleInputChange}
                    placeholder="Enter tasks separated by commas"
                  />
                </Form.Group>

                <Form.Group controlId="materialList" className="mb-3">
                  <Form.Label>Material List</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="materialList"
                    value={newProject.materialList}
                    onChange={handleInputChange}
                    placeholder="Enter materials separated by commas"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="equipmentList" className="mb-3">
                  <Form.Label>Equipment List</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="equipmentList"
                    value={newProject.equipmentList}
                    onChange={handleInputChange}
                    placeholder="Enter equipment separated by commas"
                  />
                </Form.Group>

                <Form.Group controlId="toolsList" className="mb-3">
                  <Form.Label>Tools List</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="toolsList"
                    value={newProject.toolsList}
                    onChange={handleInputChange}
                    placeholder="Enter tools separated by commas"
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* File uploads */}
            <Row>
              <Col md={4}>
                <Form.Group controlId="relevantDocuments" className="mb-3">
                  <Form.Label>Relevant Documents</Form.Label>
                  <Form.Control
                    type="file"
                    name="relevantDocuments"
                    multiple
                    onChange={handleFileChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="photos" className="mb-3">
                  <Form.Label>Photos</Form.Label>
                  <Form.Control
                    type="file"
                    name="photos"
                    multiple
                    onChange={handleFileChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="charts" className="mb-3">
                  <Form.Label>Charts</Form.Label>
                  <Form.Control
                    type="file"
                    name="charts"
                    multiple
                    onChange={handleFileChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Create Project
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default ProjectsPage;