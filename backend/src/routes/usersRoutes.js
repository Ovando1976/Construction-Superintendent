// backend/src/routes/userRoutes.js

const express = require('express');
const router = express.Router();

// 1) Import user controller (make sure the path is correct)
const userController = require('../../controllers/userController');

// 2) (Optional) Import auth middleware if you want to protect routes
const { authenticateToken, authorizeRoles } = require('../utils/authMiddleware');

// 3) (Optional) Import express-validator to validate inputs
const { body, param, validationResult } = require('express-validator');

// 4) If you use a logger (e.g. Winston)
const logger = require('../utils/logger');

/**
 * Example validations for creating/updating a user
 * Adjust fields as needed: name, email, password, role, etc.
 */
const validateUserCreation = [
  body('name')
    .notEmpty().withMessage('Name is required.')
    .isString().withMessage('Name must be a string.')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters.'),
  body('email')
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Must be a valid email address.'),
  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
  // e.g., role checks or other fields if you need
];

const validateUserUpdate = [
  // You may only require certain fields
  body('name')
    .optional()
    .isString().withMessage('Name must be a string.')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters.'),
  body('email')
    .optional()
    .isEmail().withMessage('Must be a valid email address.'),
  // etc.
];

/**
 * Helper to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (logger) {
      logger.warn('User validation failed:', errors.array());
    }
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * GET /api/users
 * Retrieve all users
 * Example: Only Admin can see all users
 */
router.get(
  '/',
  authenticateToken,
  authorizeRoles(['Admin']), // optional
  userController.getAllUsers
);

/**
 * GET /api/users/:id
 * Retrieve a single user by ID
 */
router.get(
  '/:id',
  authenticateToken,
  // e.g. authorizeRoles(['Admin', 'ProjectManager']),
  param('id').isUUID(4).withMessage('Invalid user ID'), // if your IDs are UUID
  handleValidationErrors,
  userController.getUserById
);

/**
 * POST /api/users
 * Create a new user
 */
router.post(
  '/',
  // optionally no auth if you're allowing open registration, or:
  // authenticateToken,
  // authorizeRoles(['Admin']),
  validateUserCreation,
  handleValidationErrors,
  userController.createUser
);

/**
 * PUT /api/users/:id
 * Update a user
 */
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles(['Admin']),
  param('id').isUUID(4).withMessage('Invalid user ID'),
  validateUserUpdate,
  handleValidationErrors,
  userController.updateUser
);

/**
 * DELETE /api/users/:id
 * Delete a user
 */
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles(['Admin']),
  param('id').isUUID(4).withMessage('Invalid user ID'),
  handleValidationErrors,
  userController.deleteUser
);

module.exports = router;