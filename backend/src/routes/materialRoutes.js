// backend/src/routes/materialRoutes.js

const express = require('express');
const router = express.Router();
const { Material, Project, User } = require('../../models');
const { authenticateToken, authorizeRoles } = require('../utils/authMiddleware');
const { body, validationResult, param } = require('express-validator');
const multer = require('multer');
const path = require('path');
const supabaseAdminClient = require('../utils/supabaseAdminClient'); // For any material-related file uploads
const logger = require('../utils/logger'); // If you have a logger set up

// Configure Multer storage if materials include file uploads (e.g., certificates, specifications)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, PDF, and DOCX files are allowed.'));
    }
  },
});

// Validation for creating a material
const validateMaterialCreation = [
  body('name')
    .notEmpty().withMessage('Material name is required.')
    .isString().withMessage('Material name must be a string.')
    .isLength({ min: 2, max: 255 }).withMessage('Material name must be between 2 and 255 characters.'),
  body('quantity')
    .isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer.'),
  body('unit')
    .isIn(['pcs', 'kg', 'liters', 'meters', 'units', 'other'])
    .withMessage('Unit must be one of: pcs, kg, liters, meters, units, other.'),
  body('costPerUnit')
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('Cost per unit must be a decimal number with up to two decimal places.')
    .custom((value) => parseFloat(value) >= 0)
    .withMessage('Cost per unit cannot be negative.'),
  body('projectId')
    .isUUID(4).withMessage('Project ID must be a valid UUID.'),
];

// Validation for updating a material
const validateMaterialUpdate = [
  param('id')
    .isUUID(4).withMessage('Material ID must be a valid UUID.'),
  body('name')
    .optional()
    .isString().withMessage('Material name must be a string.')
    .isLength({ min: 2, max: 255 }).withMessage('Material name must be between 2 and 255 characters.'),
  body('quantity')
    .optional()
    .isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer.'),
  body('unit')
    .optional()
    .isIn(['pcs', 'kg', 'liters', 'meters', 'units', 'other'])
    .withMessage('Unit must be one of: pcs, kg, liters, meters, units, other.'),
  body('costPerUnit')
    .optional()
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('Cost per unit must be a decimal number with up to two decimal places.')
    .custom((value) => parseFloat(value) >= 0)
    .withMessage('Cost per unit cannot be negative.'),
  body('projectId')
    .optional()
    .isUUID(4).withMessage('Project ID must be a valid UUID.'),
];

// Validation for material ID in parameters
const validateMaterialIdParam = [
  param('id')
    .isUUID(4).withMessage('Material ID must be a valid UUID.'),
];

// CREATE Material (Admin and ProjectManagers only)
router.post(
  '/',
  authenticateToken,
  authorizeRoles(['Admin', 'ProjectManager']),
  upload.single('specification'), // e.g., uploading a specification PDF or DOCX
  validateMaterialCreation,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (logger) logger.warn('Material creation validation failed:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, quantity, unit, costPerUnit, projectId } = req.body;
      const specificationFile = req.file;

      let specificationURL = null;
      if (specificationFile) {
        // Upload specification to Supabase Storage
        const filePath = `material-specifications/${Date.now()}_${specificationFile.originalname}`;

        const { error: uploadError } = await supabaseAdminClient.storage
          .from('material-specifications')
          .upload(filePath, specificationFile.buffer, {
            contentType: specificationFile.mimetype,
          });

        if (uploadError) {
          if (logger) logger.error('Error uploading specification:', uploadError.message);
          return res.status(500).json({ error: 'Failed to upload specification.' });
        }

        const { publicURL, error: publicUrlError } = supabaseAdminClient.storage
          .from('material-specifications')
          .getPublicUrl(filePath);

        if (publicUrlError) {
          if (logger) logger.error('Error getting specification public URL:', publicUrlError.message);
          return res.status(500).json({ error: 'Failed to retrieve specification URL.' });
        }

        specificationURL = publicURL;
      }

      // Check if the project exists
      const project = await Project.findByPk(projectId);
      if (!project) {
        if (logger) logger.warn(`Project not found: ${projectId}`);
        return res.status(404).json({ error: 'Project not found.' });
      }

      // Create the material record
      const material = await Material.create({
        name,
        quantity,
        unit,
        costPerUnit,
        projectId,
        specificationURL, // Make sure your Material model has a `specificationURL` field if you plan to store this
      });

      if (logger) {
        logger.info(`Material created: ${material.id} for Project: ${projectId} by User: ${req.user.id}`);
      }

      return res.status(201).json(material);
    } catch (error) {
      if (logger) logger.error('Error creating material:', error.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// READ all Materials for a given project (Authenticated)
router.get(
  '/project/:projectId',
  authenticateToken,
  async (req, res) => {
    const { projectId } = req.params;

    try {
      // Check if the project exists
      const project = await Project.findByPk(projectId);
      if (!project) {
        if (logger) logger.warn(`Project not found: ${projectId}`);
        return res.status(404).json({ error: 'Project not found.' });
      }

      // Fetch materials for this project
      const materials = await Material.findAll({
        where: { projectId },
        include: [
          {
            model: Project,
            as: 'project',
            attributes: ['id', 'name'],
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name', 'email'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      return res.status(200).json(materials);
    } catch (error) {
      if (logger) logger.error('Error fetching materials:', error.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// READ a specific Material by ID (Authenticated)
router.get(
  '/:id',
  authenticateToken,
  validateMaterialIdParam,
  async (req, res) => {
    const { id } = req.params;

    try {
      const material = await Material.findByPk(id, {
        include: [
          {
            model: Project,
            as: 'project',
            attributes: ['id', 'name'],
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name', 'email'],
          },
        ],
      });

      if (!material) {
        if (logger) logger.warn(`Material not found: ${id}`);
        return res.status(404).json({ error: 'Material not found.' });
      }

      return res.status(200).json(material);
    } catch (error) {
      if (logger) logger.error('Error fetching material by ID:', error.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// UPDATE Material (Admin and ProjectManagers Only)
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles(['Admin', 'ProjectManager']),
  validateMaterialIdParam,
  validateMaterialUpdate,
  async (req, res) => {
    const { id } = req.params;
    const { name, quantity, unit, costPerUnit, projectId } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (logger) {
        logger.warn('Material update validation failed:', errors.array());
      }
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const material = await Material.findByPk(id);

      if (!material) {
        if (logger) logger.warn(`Material not found for update: ${id}`);
        return res.status(404).json({ error: 'Material not found.' });
      }

      // If updating projectId, ensure the new project exists
      if (projectId && projectId !== material.projectId) {
        const project = await Project.findByPk(projectId);
        if (!project) {
          if (logger) logger.warn(`Project not found: ${projectId}`);
          return res.status(404).json({ error: 'New project not found.' });
        }
      }

      await material.update({
        name: name !== undefined ? name : material.name,
        quantity: quantity !== undefined ? quantity : material.quantity,
        unit: unit !== undefined ? unit : material.unit,
        costPerUnit: costPerUnit !== undefined ? costPerUnit : material.costPerUnit,
        projectId: projectId !== undefined ? projectId : material.projectId,
      });

      if (logger) {
        logger.info(`Material updated: ${id} by User: ${req.user.id}`);
      }

      return res.status(200).json(material);
    } catch (error) {
      if (logger) logger.error('Error updating material:', error.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// DELETE Material (Admin Only)
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles(['Admin']),
  validateMaterialIdParam,
  async (req, res) => {
    const { id } = req.params;

    try {
      const material = await Material.findByPk(id);

      if (!material) {
        if (logger) logger.warn(`Material not found for deletion: ${id}`);
        return res.status(404).json({ error: 'Material not found.' });
      }

      await material.destroy();

      if (logger) logger.info(`Material deleted: ${id} by User: ${req.user.id}`);

      return res.status(200).json({ message: 'Material deleted successfully.' });
    } catch (error) {
      if (logger) logger.error('Error deleting material:', error.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

module.exports = router;