// backend/src/routes/documentsRoutes.js

const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const logger = require('../utils/logger');

// 1) Import your documents controller
const documentsController = require('../../controllers/documentsController');

// 2) (Optional) Auth middlewares
const { authenticateToken, authorizeRoles } = require('../utils/authMiddleware');

// 3) Validation rules for creating/updating documents
const validateDocument = [
  body('documentName')
    .notEmpty()
    .withMessage('Document name is required.')
    .isString()
    .withMessage('Document name must be a string.')
    .isLength({ min: 2, max: 255 })
    .withMessage('Document name must be between 2 and 255 characters.'),
];

// 4) Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (logger) {
      logger.warn('Document validation failed:', errors.array());
    }
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/* 
  GET /api/documents
  Retrieve all documents
*/
router.get(
  '/',
  authenticateToken,
  // authorizeRoles(['Admin', 'ProjectManager']),
  documentsController.getAllDocuments
);

/* 
  GET /api/documents/:id
  Retrieve a single document by ID
*/
router.get(
  '/:id',
  authenticateToken,
  // optional: authorizeRoles(['Admin', 'ProjectManager', 'Worker']),
  param('id').isUUID(4).withMessage('Invalid document ID'),
  handleValidationErrors,
  documentsController.getDocumentById
);

/* 
  POST /api/documents
  Upload a new document
  (Requires a file from multer or similar, if you do in-lane file upload)
*/
router.post(
  '/',
  authenticateToken,
  authorizeRoles(['Admin', 'ProjectManager']), 
  validateDocument,
  handleValidationErrors,
  documentsController.uploadDocument
);

/* 
  PUT /api/documents/:id
  Update a document's metadata or re-upload the file
*/
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles(['Admin', 'ProjectManager']),
  param('id').isUUID(4).withMessage('Invalid document ID'),
  validateDocument, // e.g. if re-validating documentName
  handleValidationErrors,
  documentsController.updateDocument
);

/* 
  DELETE /api/documents/:id
  Delete a document
*/
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles(['Admin']),
  param('id').isUUID(4).withMessage('Invalid document ID'),
  handleValidationErrors,
  documentsController.deleteDocument
);

module.exports = router;