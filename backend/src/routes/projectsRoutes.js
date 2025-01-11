// src/routes/projectsRoutes.js

const express = require('express');
const router = express.Router();
const projectsController = require('../../controllers/projectsController');
const { authenticateToken, authorizeRoles } = require('../utils/authMiddleware');
const { body, validationResult } = require('express-validator');
const logger = require('../utils/logger');

// Validation for creating a project
const validateProjectCreation = [
  body('project_name')
    .notEmpty()
    .withMessage('Project name is required.')
    .isString()
    .withMessage('Project name must be a string.'),
  body('project_description')
    .notEmpty()
    .withMessage('Project description is required.')
    .isString()
    .withMessage('Project description must be a string.'),
  body('scope')
    .notEmpty()
    .withMessage('Scope is required.')
    .isString(),
  body('site_location')
    .notEmpty()
    .withMessage('Site location is required.')
    .isString(),
  body('site_condition')
    .notEmpty()
    .withMessage('Site condition is required.')
    .isString(),
  body('start_date')
    .notEmpty()
    .withMessage('Start date is required.')
    .isISO8601()
    .withMessage('Start date must be a valid date.'),
  body('end_date')
    .notEmpty()
    .withMessage('End date is required.')
    .isISO8601()
    .withMessage('End date must be a valid date.'),
  body('status')
    .notEmpty()
    .withMessage('Status is required.')
    .isIn(['Not Started', 'In Progress', 'Completed', 'On Hold'])
    .withMessage('Status must be one of: Not Started, In Progress, Completed, or On Hold.'),
  body('estimated_budget')
    .notEmpty()
    .withMessage('Estimated budget is required.')
    .isFloat({ min: 0 })
    .withMessage('Estimated budget must be a positive number.'),
];

// POST /api/projects - Create a new project (Admin Only)
router.post(
  '/',
  authenticateToken,
  authorizeRoles(['Admin']),
  validateProjectCreation,
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Project creation validation failed:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    projectsController.createProject(req, res);
  }
);

// GET /api/projects - Fetch all projects (Authenticated)
router.get('/', authenticateToken, projectsController.getAllProjects);

// GET /api/projects/:id - Fetch a specific project by ID (Authenticated)
router.get('/:id', authenticateToken, projectsController.getProjectById);

// PUT /api/projects/:id - Update a project by ID (Admin Only)
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles(['Admin']),
  (req, res) => {
    projectsController.updateProject(req, res);
  }
);

// DELETE /api/projects/:id - Delete a project by ID (Admin Only)
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles(['Admin']),
  (req, res) => {
    projectsController.deleteProject(req, res);
  }
);

module.exports = router;