// backend/src/routes/dailyReportRoutes.js

const express = require('express');
const { authenticateToken, authorizeRoles } = require('../utils/authMiddleware');
const { DailyReport, Project, User } = require('../../models');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const supabaseAdminClient = require('../utils/supabaseAdminClient'); // Correct import
const logger = require('../utils/logger'); // If you have a logger set up

const router = express.Router();

// Configure Multer storage (memory storage for simplicity)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit files to 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG and PNG images are allowed.'));
    }
  },
});

// Validation for creating a daily report
const validateDailyReport = [
  body('date')
    .isISO8601()
    .withMessage('Date must be a valid ISO8601 date.')
    .toDate(),
  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string.'),
  body('weather_conditions')
    .optional()
    .isString()
    .withMessage('Weather conditions must be a string.'),
  body('project_id')
    .isUUID()
    .withMessage('Project ID must be a valid UUID.'),
];

// Create a new daily report with up to 5 photo uploads
router.post(
  '/',
  authenticateToken,
  upload.array('photos', 5), // Accept up to 5 photos
  validateDailyReport,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (logger) logger.error('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { date, notes, weather_conditions, project_id } = req.body;
      const files = req.files;

      // Check if the project exists
      const project = await Project.findByPk(project_id);
      if (!project) {
        if (logger) logger.warn(`Project not found: ${project_id}`);
        return res.status(404).json({ error: 'Project not found' });
      }

      // Handle photo uploads to Supabase Storage
      let photoUrls = [];
      if (files && files.length > 0) {
        for (const file of files) {
          const { originalname, buffer, mimetype } = file;
          const filePath = `daily-reports/${Date.now()}_${originalname}`;

          // Upload the file to Supabase Storage
          const { error: uploadError } = await supabaseAdminClient.storage
            .from('daily-reports')
            .upload(filePath, buffer, {
              contentType: mimetype,
            });

          if (uploadError) {
            if (logger) logger.error('Error uploading photo:', uploadError.message);
            return res.status(500).json({ error: 'Failed to upload photos.' });
          }

          // Get the public URL of the uploaded file
          const { publicURL, error: publicUrlError } = supabaseAdminClient.storage
            .from('daily-reports')
            .getPublicUrl(filePath);

          if (publicUrlError) {
            if (logger) logger.error('Error getting public URL:', publicUrlError.message);
            return res.status(500).json({ error: 'Failed to retrieve photo URLs.' });
          }

          photoUrls.push(publicURL);
        }
      }

      // Create the daily report
      const dailyReport = await DailyReport.create({
        date,
        notes,
        weather_conditions,
        photos: photoUrls, // Ensure 'photos' is an ARRAY in your DailyReport model
        project_id,
        submitted_by: req.user.id, // If your model references user IDs
      });

      return res.status(201).json(dailyReport);
    } catch (error) {
      if (logger) logger.error('Error creating daily report:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get all daily reports for a project
router.get(
  '/project/:projectId',
  authenticateToken,
  async (req, res) => {
    try {
      const { projectId } = req.params;

      // Check if the project exists
      const project = await Project.findByPk(projectId);
      if (!project) {
        if (logger) logger.warn(`Project not found: ${projectId}`);
        return res.status(404).json({ error: 'Project not found' });
      }

      const dailyReports = await DailyReport.findAll({
        where: { project_id: projectId },
        include: [
          { model: User, as: 'submitter', attributes: ['id', 'name', 'email'] },
          { model: Project, as: 'project', attributes: ['id', 'name'] },
        ],
        order: [['createdAt', 'DESC']],
      });

      return res.status(200).json(dailyReports);
    } catch (error) {
      if (logger) logger.error('Error fetching daily reports:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get a specific daily report
router.get(
  '/:id',
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;

      const dailyReport = await DailyReport.findByPk(id, {
        include: [
          { model: User, as: 'submitter', attributes: ['id', 'name', 'email'] },
          { model: Project, as: 'project', attributes: ['id', 'name'] },
        ],
      });

      if (!dailyReport) {
        if (logger) logger.warn(`Daily report not found: ${id}`);
        return res.status(404).json({ error: 'Daily report not found' });
      }

      return res.status(200).json(dailyReport);
    } catch (error) {
      if (logger) logger.error('Error fetching daily report:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Delete a daily report (Admin Only)
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles(['Admin']),
  async (req, res) => {
    try {
      const { id } = req.params;

      const dailyReport = await DailyReport.findByPk(id);
      if (!dailyReport) {
        if (logger) logger.warn(`Daily report not found: ${id}`);
        return res.status(404).json({ error: 'Daily report not found' });
      }

      await dailyReport.destroy();
      return res.status(204).send(); // No Content
    } catch (error) {
      if (logger) logger.error('Error deleting daily report:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

module.exports = router;