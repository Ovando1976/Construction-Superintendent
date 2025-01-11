// controllers/teamMembersController.js

const supabaseAdmin = require('../src/utils/supabaseAdminClient'); // Corrected import path

// Get Team Members by Project UUID
const getTeamMembersByProject = async (req, res, next) => {
  const { projectId } = req.params;

  try {
    const { data, error } = await supabaseAdmin
      .from('team_members')
      .select('*')
      .eq('project_uuid_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching team members:', error.message);
    res.status(500).json({ error: 'Failed to fetch team members.' });
  }
};

// Add a Team Member
const addTeamMember = async (req, res, next) => {
  const { projectId } = req.params;
  const memberData = req.body;

  try {
    const { data, error } = await supabaseAdmin
      .from('team_members')
      .insert([{ ...memberData, project_uuid_id: projectId }])
      .select(); // Returns the inserted row

    if (error) {
      throw error;
    }

    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error adding team member:', error.message);
    res.status(500).json({ error: 'Failed to add team member.' });
  }
};

// Remove a Team Member
const removeTeamMember = async (req, res, next) => {
  const { memberId } = req.params;

  try {
    const { data, error } = await supabaseAdmin
      .from('team_members')
      .delete()
      .eq('uuid_id', memberId)
      .select();

    if (error) {
      throw error;
    }

    res.status(200).json({ message: 'Team member removed successfully.', data });
  } catch (error) {
    console.error('Error removing team member:', error.message);
    res.status(500).json({ error: 'Failed to remove team member.' });
  }
};

module.exports = {
  getTeamMembersByProject,
  addTeamMember,
  removeTeamMember,
};