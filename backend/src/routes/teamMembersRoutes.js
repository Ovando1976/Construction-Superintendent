// backend/src/routes/teamMembersRoutes.js

const express = require('express');
const router = express.Router();

// Import your controller
const teamMembersController = require('../../controllers/teamMembersController');

// Optional: import auth middleware if you want protected routes
const { authenticateToken, authorizeRoles } = require('../utils/authMiddleware');

// GET /api/team-members/project/:projectId
// Retrieve team members by a project’s UUID
router.get(
  '/project/:projectId',
  // authenticateToken,  // add if you want JWT protection
  teamMembersController.getTeamMembersByProject
);

// POST /api/team-members/:projectId
// Add a team member to a project
router.post(
  '/:projectId',
  // authenticateToken,
  // authorizeRoles(['Admin', 'ProjectManager']), // if you want role checks
  teamMembersController.addTeamMember
);

// DELETE /api/team-members/:memberId
// Remove a team member by their UUID
router.delete(
  '/:memberId',
  // authenticateToken,
  // authorizeRoles(['Admin']), // e.g., only Admin can remove
  teamMembersController.removeTeamMember
);

module.exports = router;