// src/routes/inspectionRoutes.js

const express = require('express');
const router = express.Router();
const inspectionController = require('../../controllers/inspectionController');
const { authenticateToken, authorizeRoles } = require('../utils/authMiddleware');
const { body, validationResult, param } = require('express-validator');
const logger = require('../utils/logger'); // Assuming you have a logger set up

// Validation for creating an inspection
const validateInspectionCreation = [
  body('date')
    .isISO8601()
    .toDate()
    .withMessage('Date must be a valid ISO8601 date.'),
  body('inspectorName')
    .notEmpty()
    .withMessage('Inspector name is required.')
    .isString()
    .withMessage('Inspector name must be a string.')
    .isLength({ min: 2, max: 255 })
    .withMessage('Inspector name must be between 2 and 255 characters.'),
  body('foundationCheck')
    .optional()
    .isBoolean()
    .withMessage('Foundation check must be a boolean value.'),
  body('framingCheck')
    .optional()
    .isBoolean()
    .withMessage('Framing check must be a boolean value.'),
  body('roofingCheck')
    .optional()
    .isBoolean()
    .withMessage('Roofing check must be a boolean value.'),
  body('mepCheck')
    .optional()
    .isBoolean()
    .withMessage('MEP check must be a boolean value.'),
  body('housekeepingCheck')
    .optional()
    .isBoolean()
    .withMessage('Housekeeping check must be a boolean value.'),
  body('safetyConcerns')
    .optional()
    .isString()
    .withMessage('Safety concerns must be a string.')
    .isLength({ max: 2000 })
    .withMessage('Safety concerns can be up to 2000 characters long.'),
  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string.')
    .isLength({ max: 2000 })
    .withMessage('Notes can be up to 2000 characters long.'),
  body('projectId')
    .isUUID(4)
    .withMessage('Project ID must be a valid UUID.'),
  body('inspectorId')
    .optional()
    .isUUID(4)
    .withMessage('Inspector ID must be a valid UUID.'),
];

// Validation for inspection ID in parameters
const validateInspectionIdParam = [
  param('id')
    .isUUID(4)
    .withMessage('Inspection ID must be a valid UUID.'),
];

// CREATE Inspection (Admin and Project Managers Only)
router.post(
  '/',
  authenticateToken,
  authorizeRoles(['Admin', 'ProjectManager']),
  validateInspectionCreation,
  inspectionController.createInspection
);

// READ All Inspections for a Project (Authenticated Users)
router.get(
  '/project/:projectId',
  authenticateToken,
  inspectionController.getAllInspectionsForProject
);

// READ Specific Inspection by ID (Authenticated Users)
router.get(
  '/:id',
  authenticateToken,
  validateInspectionIdParam,
  inspectionController.getInspectionById
);

// UPDATE Inspection (Admin and Project Managers Only)
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles(['Admin', 'ProjectManager']),
  validateInspectionIdParam,
  validateInspectionCreation, // Reuse the same validation rules for update
  inspectionController.updateInspection
);

// DELETE Inspection (Admin Only)
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles(['Admin']),
  validateInspectionIdParam,
  inspectionController.deleteInspection
);

module.exports = router;