// src/components/projects/ProjectsList.jsx

import React, { useState, useEffect } from 'react';
import { ListGroup, Button, Spinner, Alert } from 'react-bootstrap';
import supabase from '../../utils/supabaseClient';

const ProjectsList = ({ onProjectClick }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch projects from Supabase
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setProjects(data);
      } catch (err) {
        console.error('Error fetching projects:', err.message);
        setError(err.message || 'Failed to fetch projects.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();

    // Create a channel for real-time changes on the 'projects' table
    const channel = supabase
      .channel('projects-changes') // Give your channel a name
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        (payload) => {
          console.log('Realtime change received!', payload);
          // The "payload" has 'eventType': 'INSERT' | 'UPDATE' | 'DELETE'
          if (payload.eventType === 'INSERT') {
            setProjects((prevProjects) => [payload.new, ...prevProjects]);
          } else if (payload.eventType === 'UPDATE') {
            setProjects((prevProjects) =>
              prevProjects.map((project) =>
                project.uuid_id === payload.new.uuid_id ? payload.new : project
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setProjects((prevProjects) =>
              prevProjects.filter(
                (project) => project.uuid_id !== payload.old.uuid_id
              )
            );
          }
        }
      )
      .subscribe();

    // Cleanup: unsubscribe from the channel on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="text-center">
        <Spinner animation="border" role="status" />
        <span className="sr-only">Loading projects...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">Error fetching projects: {error}</Alert>
    );
  }

  if (projects.length === 0) {
    return <p>No projects available.</p>;
  }

  return (
    <div>
      <h2>Projects</h2>
      <ListGroup>
        {projects.map((project) => (
          <ListGroup.Item
            key={project.uuid_id} // Using 'uuid_id' as unique key
            className="d-flex justify-content-between align-items-center"
          >
            <div>
              <strong>{project.project_name}</strong>
              <br />
              <small>Status: {project.status}</small>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onProjectClick(project.uuid_id)}
            >
              View Details
            </Button>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default ProjectsList;