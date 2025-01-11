// backend/src/routes/equipmentRoutes.js

const express = require('express');
const router = express.Router();
const {
  Equipment,
  Project,
  EquipmentUsageLog,
  User,
} = require('../../models');
const { authenticateToken, authorizeRoles } = require('../utils/authMiddleware');
const { body, validationResult, param } = require('express-validator');
const multer = require('multer');
const path = require('path');
const supabaseAdminClient = require('../utils/supabaseAdminClient'); // For any file uploads (manuals, etc.)
const logger = require('../utils/logger'); // If you have a Winston or similar logger

// Configure Multer storage if equipment includes file uploads (e.g., manuals, photos)
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

// Validation for creating an equipment
const validateEquipmentCreation = [
  body('name')
    .notEmpty()
    .withMessage('Equipment name is required.')
    .isString()
    .withMessage('Equipment name must be a string.'),
  body('status')
    .optional()
    .isIn(['available', 'in_use', 'maintenance'])
    .withMessage('Status must be either available, in_use, or maintenance.'),
  body('usageHours')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Usage hours must be a non-negative integer.'),
  body('lastMaintenanceDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Last maintenance date must be a valid date.'),
  body('project_id')
    .optional()
    .isUUID(4)
    .withMessage('Project ID must be a valid UUID.'),
];

// Validation for updating equipment
const validateEquipmentUpdate = [
  body('name')
    .optional()
    .isString()
    .withMessage('Equipment name must be a string.'),
  body('status')
    .optional()
    .isIn(['available', 'in_use', 'maintenance'])
    .withMessage('Status must be either available, in_use, or maintenance.'),
  body('usageHours')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Usage hours must be a non-negative integer.'),
  body('lastMaintenanceDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Last maintenance date must be a valid date.'),
  body('project_id')
    .optional()
    .isUUID(4)
    .withMessage('Project ID must be a valid UUID.'),
];

// Validation for equipment ID in parameters
const validateEquipmentIdParam = [
  param('id').isUUID(4).withMessage('Equipment ID must be a valid UUID.'),
];

// CREATE Equipment (Admin Only)
router.post(
  '/',
  authenticateToken,
  authorizeRoles(['Admin']),
  upload.single('manual'), // e.g. uploading a manual PDF or DOCX
  validateEquipmentCreation,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (logger) {
        logger.warn('Equipment creation validation failed:', errors.array());
      }
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, status, usageHours, lastMaintenanceDate, project_id } = req.body;
      const manualFile = req.file;

      let manualURL = null;
      if (manualFile) {
        // Upload manual to Supabase Storage
        const filePath = `equipment-manuals/${Date.now()}_${manualFile.originalname}`;

        const { error: uploadError } = await supabaseAdminClient.storage
          .from('equipment-manuals')
          .upload(filePath, manualFile.buffer, {
            contentType: manualFile.mimetype,
          });

        if (uploadError) {
          if (logger) logger.error('Error uploading manual:', uploadError.message);
          return res.status(500).json({ error: 'Failed to upload manual.' });
        }

        const { publicURL, error: publicUrlError } = supabaseAdminClient.storage
          .from('equipment-manuals')
          .getPublicUrl(filePath);

        if (publicUrlError) {
          if (logger) logger.error('Error getting manual public URL:', publicUrlError.message);
          return res.status(500).json({ error: 'Failed to retrieve manual URL.' });
        }

        manualURL = publicURL;
      }

      // Create the equipment
      const newEquipment = await Equipment.create({
        name,
        status: status || 'available',
        usageHours: usageHours || 0,
        lastMaintenanceDate: lastMaintenanceDate || null,
        project_id: project_id || null,
        manualURL, // Make sure your Equipment model has a field for this
      });

      if (logger) {
        logger.info(`Equipment created: ${newEquipment.id} by User: ${req.user.id}`);
      }

      res.status(201).json(newEquipment);
    } catch (error) {
      if (logger) logger.error('Error creating equipment:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// READ All Equipments (Authenticated Users)
router.get(
  '/',
  authenticateToken,
  async (req, res) => {
    try {
      const equipments = await Equipment.findAll({
        include: [
          {
            model: Project,
            as: 'project',
            attributes: ['id', 'name'],
          },
          {
            model: EquipmentUsageLog,
            as: 'usageLogs',
            attributes: ['id', 'usageDate', 'hoursUsed'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      res.status(200).json(equipments);
    } catch (error) {
      if (logger) logger.error('Error fetching equipments:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// READ Specific Equipment by ID (Authenticated Users)
router.get(
  '/:id',
  authenticateToken,
  validateEquipmentIdParam,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (logger) {
        logger.warn('Equipment fetch validation failed:', errors.array());
      }
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    try {
      const equipment = await Equipment.findByPk(id, {
        include: [
          {
            model: Project,
            as: 'project',
            attributes: ['id', 'name'],
          },
          {
            model: EquipmentUsageLog,
            as: 'usageLogs',
            attributes: ['id', 'usageDate', 'hoursUsed'],
          },
        ],
      });

      if (!equipment) {
        if (logger) logger.warn(`Equipment not found: ${id}`);
        return res.status(404).json({ error: 'Equipment not found.' });
      }

      res.status(200).json(equipment);
    } catch (error) {
      if (logger) logger.error('Error fetching equipment by ID:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// UPDATE Equipment (Admin Only)
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles(['Admin']),
  validateEquipmentIdParam,
  upload.single('manual'), // If updating manual
  validateEquipmentUpdate,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (logger) {
        logger.warn('Equipment update validation failed:', errors.array());
      }
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, status, usageHours, lastMaintenanceDate, project_id } = req.body;
    const manualFile = req.file;

    try {
      const equipment = await Equipment.findByPk(id);

      if (!equipment) {
        if (logger) logger.warn(`Equipment not found for update: ${id}`);
        return res.status(404).json({ error: 'Equipment not found.' });
      }

      let manualURL = equipment.manualURL; // Keep existing manual if none uploaded

      if (manualFile) {
        // Upload new manual to Supabase Storage
        const filePath = `equipment-manuals/${Date.now()}_${manualFile.originalname}`;

        const { error: uploadError } = await supabaseAdminClient.storage
          .from('equipment-manuals')
          .upload(filePath, manualFile.buffer, {
            contentType: manualFile.mimetype,
          });

        if (uploadError) {
          if (logger) logger.error('Error uploading new manual:', uploadError.message);
          return res.status(500).json({ error: 'Failed to upload new manual.' });
        }

        const { publicURL, error: publicUrlError } = supabaseAdminClient.storage
          .from('equipment-manuals')
          .getPublicUrl(filePath);

        if (publicUrlError) {
          if (logger) logger.error('Error getting new manual public URL:', publicUrlError.message);
          return res.status(500).json({ error: 'Failed to retrieve new manual URL.' });
        }

        manualURL = publicURL;
      }

      // Update the equipment
      await equipment.update({
        name: name !== undefined ? name : equipment.name,
        status: status !== undefined ? status : equipment.status,
        usageHours: usageHours !== undefined ? usageHours : equipment.usageHours,
        lastMaintenanceDate:
          lastMaintenanceDate !== undefined
            ? lastMaintenanceDate
            : equipment.lastMaintenanceDate,
        project_id: project_id !== undefined ? project_id : equipment.project_id,
        manualURL,
      });

      if (logger) logger.info(`Equipment updated: ${id} by User: ${req.user.id}`);

      res.status(200).json(equipment);
    } catch (error) {
      if (logger) logger.error('Error updating equipment:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// DELETE Equipment (Admin Only)
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles(['Admin']),
  validateEquipmentIdParam,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (logger) {
        logger.warn('Equipment deletion validation failed:', errors.array());
      }
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    try {
      const equipment = await Equipment.findByPk(id);

      if (!equipment) {
        if (logger) logger.warn(`Equipment not found for deletion: ${id}`);
        return res.status(404).json({ error: 'Equipment not found.' });
      }

      await equipment.destroy();

      if (logger) logger.info(`Equipment deleted: ${id} by User: ${req.user.id}`);

      res.status(200).json({ message: 'Equipment deleted successfully.' });
    } catch (error) {
      if (logger) logger.error('Error deleting equipment:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

module.exports = router;