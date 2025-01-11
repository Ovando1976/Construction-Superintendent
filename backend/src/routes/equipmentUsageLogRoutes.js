// src/routes/equipmentUsageLogRoutes.js

const express = require('express');
const router = express.Router();
const { EquipmentUsageLog, Equipment, User } = require('../../models');
const { authenticateToken, authorizeRoles } = require('../utils/authMiddleware');
const { body, validationResult, param } = require('express-validator');
const logger = require('../utils/logger'); // Assuming you have a logger set up

// Validation for creating an equipment usage log
const validateUsageLogCreation = [
  body('equipment_id')
    .isUUID(4)
    .withMessage('Equipment ID must be a valid UUID.'),
  body('usageDate')
    .isISO8601()
    .toDate()
    .withMessage('Usage date must be a valid ISO8601 date.'),
  body('hoursUsed')
    .isInt({ min: 0 })
    .withMessage('Hours used must be a non-negative integer.'),
];

// Validation for equipment usage log ID in parameters
const validateUsageLogIdParam = [
  param('id')
    .isUUID(4)
    .withMessage('Usage Log ID must be a valid UUID.'),
];

// CREATE Equipment Usage Log (Admin and Project Managers Only)
router.post(
  '/',
  authenticateToken,
  authorizeRoles(['Admin', 'ProjectManager']),
  validateUsageLogCreation,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Equipment Usage Log creation validation failed:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { equipment_id, usageDate, hoursUsed } = req.body;

    try {
      // Check if the equipment exists
      const equipment = await Equipment.findByPk(equipment_id);
      if (!equipment) {
        logger.warn(`Equipment not found: ${equipment_id}`);
        return res.status(404).json({ error: 'Equipment not found.' });
      }

      // Create the usage log
      const usageLog = await EquipmentUsageLog.create({
        equipment_id,
        usageDate,
        hoursUsed,
      });

      // Update usageHours in Equipment
      equipment.usageHours += hoursUsed;
      await equipment.save();

      logger.info(`Equipment Usage Log created: ${usageLog.id} for Equipment: ${equipment_id} by User: ${req.user.id}`);

      res.status(201).json(usageLog);
    } catch (error) {
      logger.error('Error creating equipment usage log:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// READ All Usage Logs for an Equipment (Authenticated Users)
router.get(
  '/equipment/:equipmentId',
  authenticateToken,
  async (req, res) => {
    const { equipmentId } = req.params;

    try {
      // Check if the equipment exists
      const equipment = await Equipment.findByPk(equipmentId);
      if (!equipment) {
        logger.warn(`Equipment not found: ${equipmentId}`);
        return res.status(404).json({ error: 'Equipment not found.' });
      }

      // Fetch usage logs
      const usageLogs = await EquipmentUsageLog.findAll({
        where: { equipment_id: equipmentId },
        include: [
          {
            model: Equipment,
            as: 'equipment',
            attributes: ['id', 'name'],
          },
        ],
        order: [['usageDate', 'DESC']],
      });

      res.status(200).json(usageLogs);
    } catch (error) {
      logger.error('Error fetching equipment usage logs:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// READ Specific Equipment Usage Log by ID (Authenticated Users)
router.get(
  '/:id',
  authenticateToken,
  validateUsageLogIdParam,
  async (req, res) => {
    const { id } = req.params;

    try {
      const usageLog = await EquipmentUsageLog.findByPk(id, {
        include: [
          {
            model: Equipment,
            as: 'equipment',
            attributes: ['id', 'name'],
          },
        ],
      });

      if (!usageLog) {
        logger.warn(`Equipment Usage Log not found: ${id}`);
        return res.status(404).json({ error: 'Equipment Usage Log not found.' });
      }

      res.status(200).json(usageLog);
    } catch (error) {
      logger.error('Error fetching equipment usage log by ID:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// DELETE Equipment Usage Log (Admin Only)
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles(['Admin']),
  validateUsageLogIdParam,
  async (req, res) => {
    const { id } = req.params;

    try {
      const usageLog = await EquipmentUsageLog.findByPk(id);

      if (!usageLog) {
        logger.warn(`Equipment Usage Log not found for deletion: ${id}`);
        return res.status(404).json({ error: 'Equipment Usage Log not found.' });
      }

      // Optionally, adjust usageHours in Equipment
      const equipment = await Equipment.findByPk(usageLog.equipment_id);
      if (equipment) {
        equipment.usageHours -= usageLog.hoursUsed;
        if (equipment.usageHours < 0) equipment.usageHours = 0; // Prevent negative hours
        await equipment.save();
      }

      await usageLog.destroy();

      logger.info(`Equipment Usage Log deleted: ${id} by User: ${req.user.id}`);

      res.status(200).json({ message: 'Equipment Usage Log deleted successfully.' });
    } catch (error) {
      logger.error('Error deleting equipment usage log:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

module.exports = router;