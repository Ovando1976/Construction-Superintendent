// src/components/projects/ProjectTeamList.jsx

import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Badge, Alert } from 'react-bootstrap';
import supabase from '../../utils/supabaseClient'; // Ensure the path is correct

const rolesConfig = {
  Admin: { variant: 'danger', label: 'Admin' },
  ProjectManager: { variant: 'info', label: 'Project Manager' },
  Foreman: { variant: 'warning', label: 'Foreman' },
  Worker: { variant: 'success', label: 'Worker' },
};

const ProjectTeamList = ({ projectId }) => {
  const [team, setTeam] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState(null);
  const [inviteSuccess, setInviteSuccess] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(null);

  // Fetch team members from Supabase
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('*')
          .eq('project_uuid_id', projectId);

        if (error) {
          throw error;
        }

        setTeam(data);
      } catch (err) {
        console.error('Error fetching team members:', err.message);
      }
    };

    fetchTeam();

    // Subscribe to real-time updates for the 'team_members' table related to this project
    const subscription = supabase
      .from(`team_members:project_uuid_id=eq.${projectId}`)
      .on('*', (payload) => {
        console.log('Change received!', payload);
        if (payload.eventType === 'INSERT') {
          setTeam((prevTeam) => [payload.new, ...prevTeam]);
        } else if (payload.eventType === 'UPDATE') {
          setTeam((prevTeam) =>
            prevTeam.map((member) =>
              member.uuid_id === payload.new.uuid_id ? payload.new : member
            )
          );
        } else if (payload.eventType === 'DELETE') {
          setTeam((prevTeam) =>
            prevTeam.filter((member) => member.uuid_id !== payload.old.uuid_id)
          );
        }
      })
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeSubscription(subscription);
    };
  }, [projectId]);

  // Handle inviting a new team member
  const handleInvite = async () => {
    if (!inviteEmail) {
      setInviteError('Please enter an email address.');
      return;
    }

    try {
      // Insert a new team member into the 'team_members' table
      const { data, error } = await supabase
        .from('team_members')
        .insert([
          {
            project_uuid_id: projectId,
            email: inviteEmail,
            name: 'Invited User', // Replace with actual name input if available
            role: 'Worker', // Default role; consider allowing selection
          },
        ]);

      if (error) {
        throw error;
      }

      setInviteSuccess('Invitation sent successfully.');
      setInviteEmail('');
      setShowInviteModal(false);
    } catch (err) {
      console.error('Error inviting team member:', err.message);
      setInviteError(err.message || 'Failed to send invitation.');
    }
  };

  // Handle deleting a team member
  const handleDelete = async (memberId) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('uuid_id', memberId);

      if (error) {
        throw error;
      }

      setDeleteSuccess('Team member removed successfully.');
    } catch (err) {
      console.error('Error deleting team member:', err.message);
      setDeleteError(err.message || 'Failed to remove team member.');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="mb-0">Team Members</h5>
        <Button variant="primary" size="sm" onClick={() => setShowInviteModal(true)}>
          Invite Member
        </Button>
      </div>

      {/* Success and Error Messages */}
      {inviteSuccess && <Alert variant="success">{inviteSuccess}</Alert>}
      {inviteError && <Alert variant="danger">{inviteError}</Alert>}
      {deleteSuccess && <Alert variant="success">{deleteSuccess}</Alert>}
      {deleteError && <Alert variant="danger">{deleteError}</Alert>}

      {team.length ? (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Email / Contact</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {team.map((member) => {
              const roleInfo = rolesConfig[member.role] || { variant: 'secondary', label: member.role };
              return (
                <tr key={member.uuid_id}>
                  <td>{member.name}</td>
                  <td>
                    <Badge bg={roleInfo.variant}>{roleInfo.label}</Badge>
                  </td>
                  <td>{member.email || 'N/A'}</td>
                  <td>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(member.uuid_id)}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      ) : (
        <p>No team members found.</p>
      )}

      {/* Invite Member Modal */}
      <Modal show={showInviteModal} onHide={() => setShowInviteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Invite New Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="inviteEmail">
            <Form.Label>Member Email</Form.Label>
            <Form.Control
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Enter email address"
              required
            />
          </Form.Group>
          {/* Optional: Allow selecting role */}
          <Form.Group className="mb-3" controlId="inviteRole">
            <Form.Label>Role</Form.Label>
            <Form.Select
              value="Worker" // Default role
              onChange={(e) => {
                // Update role in state if you decide to allow role selection
                // Example:
                // setInviteRole(e.target.value);
              }}
            >
              <option value="Admin">Admin</option>
              <option value="ProjectManager">Project Manager</option>
              <option value="Foreman">Foreman</option>
              <option value="Worker">Worker</option>
            </Form.Select>
          </Form.Group>
          <p className="text-muted">An invitation link will be sent to this email.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowInviteModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleInvite}>
            Send Invite
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProjectTeamList;