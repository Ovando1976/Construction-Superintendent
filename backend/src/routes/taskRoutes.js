// src/routes/taskRoutes.js

const express = require('express');
const { authenticateToken, authorizeRoles } = require('../utils/authMiddleware');
const { Task, Project, User } = require('../../models');
const { body, validationResult, param } = require('express-validator');
const logger = require('../utils/logger'); // Assuming you have a logger set up

const router = express.Router();

// Validation for creating a task
const validateTaskCreation = [
  body('name')
    .notEmpty()
    .withMessage('Task name is required.')
    .isString()
    .withMessage('Task name must be a string.'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string.'),
  body('due_date')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid ISO8601 date.')
    .toDate(),
  body('project_id')
    .isUUID()
    .withMessage('Project ID must be a valid UUID.'),
  body('assigned_to')
    .optional()
    .isUUID()
    .withMessage('Assigned To must be a valid UUID.'),
];

// Validation for updating task status
const validateTaskStatusUpdate = [
  param('id')
    .isUUID()
    .withMessage('Task ID must be a valid UUID.'),
  body('status')
    .notEmpty()
    .withMessage('Status is required.')
    .isIn(['pending', 'in_progress', 'completed'])
    .withMessage('Status must be one of: pending, in_progress, completed.'),
];

// Validation for task ID in parameters
const validateTaskIdParam = [
  param('id')
    .isUUID()
    .withMessage('Task ID must be a valid UUID.'),
];

// Create a new task (Admin and Project Managers Only)
router.post(
  '/',
  authenticateToken,
  authorizeRoles(['Admin', 'ProjectManager']),
  validateTaskCreation,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error('Task creation validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, description, due_date, project_id, assigned_to } = req.body;

      // Check if the project exists
      const project = await Project.findByPk(project_id);
      if (!project) {
        logger.warn(`Project not found: ${project_id}`);
        return res.status(404).json({ error: 'Project not found' });
      }

      // If assigned_to is provided, check if the user exists
      let assignee = null;
      if (assigned_to) {
        assignee = await User.findByPk(assigned_to);
        if (!assignee) {
          logger.warn(`Assignee not found: ${assigned_to}`);
          return res.status(404).json({ error: 'Assigned user not found' });
        }
      }

      // Create the task
      const task = await Task.create({
        name,
        description,
        due_date,
        project_id,
        assigned_to: assigned_to || null,
      });

      res.status(201).json(task);
    } catch (error) {
      logger.error('Error creating task:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get all tasks for a project (Authenticated Users)
router.get(
  '/project/:projectId',
  authenticateToken,
  async (req, res) => {
    try {
      const { projectId } = req.params;

      // Check if the project exists
      const project = await Project.findByPk(projectId);
      if (!project) {
        logger.warn(`Project not found: ${projectId}`);
        return res.status(404).json({ error: 'Project not found' });
      }

      // Fetch tasks for the given project
      const tasks = await Task.findAll({
        where: { project_id: projectId },
        include: [
          { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
          { model: Project, as: 'project', attributes: ['id', 'name'] },
        ],
        order: [['createdAt', 'DESC']],
      });

      res.status(200).json(tasks);
    } catch (error) {
      logger.error('Error fetching tasks:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Update task status (Admin and Project Managers Only)
router.put(
  '/:id/status',
  authenticateToken,
  authorizeRoles(['Admin', 'ProjectManager']),
  validateTaskStatusUpdate,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error('Task status update validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { status } = req.body;

      // Find the task
      const task = await Task.findByPk(id);
      if (!task) {
        logger.warn(`Task not found: ${id}`);
        return res.status(404).json({ error: 'Task not found' });
      }

      // Update the task status
      task.status = status;
      await task.save();

      res.status(200).json(task);
    } catch (error) {
      logger.error('Error updating task status:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Delete a task (Admin and Project Managers Only)
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles(['Admin', 'ProjectManager']),
  validateTaskIdParam,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error('Task deletion validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;

      // Find the task
      const task = await Task.findByPk(id);
      if (!task) {
        logger.warn(`Task not found: ${id}`);
        return res.status(404).json({ error: 'Task not found' });
      }

      // Optionally, check if the user has permission to delete the task
      // For example, only the project manager or Admin can delete

      await task.destroy();
      res.status(204).send(); // No Content
    } catch (error) {
      logger.error('Error deleting task:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

module.exports = router;