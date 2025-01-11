// controllers/inspectionController.js

const { Inspection, Project, User } = require('../models');
const logger = require('../src/utils/logger'); // Assuming you have a logger set up

// CREATE Inspection
const createInspection = async (req, res) => {
  const { date, inspectorName, foundationCheck, framingCheck, roofingCheck, mepCheck, housekeepingCheck, safetyConcerns, notes, projectId, inspectorId } = req.body;

  try {
    // Verify Project Exists
    const project = await Project.findByPk(projectId);
    if (!project) {
      logger.warn(`Project not found: ${projectId}`);
      return res.status(404).json({ error: 'Project not found.' });
    }

    // If inspectorId is provided, verify User Exists
    if (inspectorId) {
      const inspector = await User.findByPk(inspectorId);
      if (!inspector) {
        logger.warn(`Inspector not found: ${inspectorId}`);
        return res.status(404).json({ error: 'Inspector not found.' });
      }
    }

    // Create Inspection
    const inspection = await Inspection.create({
      date,
      inspectorName,
      foundationCheck: foundationCheck || false,
      framingCheck: framingCheck || false,
      roofingCheck: roofingCheck || false,
      mepCheck: mepCheck || false,
      housekeepingCheck: housekeepingCheck || false,
      safetyConcerns: safetyConcerns || null,
      notes: notes || null,
      projectId,
      inspectorId: inspectorId || null,
    });

    logger.info(`Inspection created: ${inspection.id} for Project: ${projectId} by User: ${req.user.id}`);

    res.status(201).json(inspection);
  } catch (error) {
    logger.error('Error creating inspection:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// READ All Inspections for a Project
const getAllInspectionsForProject = async (req, res) => {
  const { projectId } = req.params;

  try {
    // Verify Project Exists
    const project = await Project.findByPk(projectId);
    if (!project) {
      logger.warn(`Project not found: ${projectId}`);
      return res.status(404).json({ error: 'Project not found.' });
    }

    const inspections = await Inspection.findAll({
      where: { projectId },
      include: [
        {
          model: User,
          as: 'inspector',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name'],
        },
      ],
      order: [['date', 'DESC']],
    });

    res.status(200).json(inspections);
  } catch (error) {
    logger.error('Error fetching inspections:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// READ Specific Inspection by ID
const getInspectionById = async (req, res) => {
  const { id } = req.params;

  try {
    const inspection = await Inspection.findByPk(id, {
      include: [
        {
          model: User,
          as: 'inspector',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name'],
        },
      ],
    });

    if (!inspection) {
      logger.warn(`Inspection not found: ${id}`);
      return res.status(404).json({ error: 'Inspection not found.' });
    }

    res.status(200).json(inspection);
  } catch (error) {
    logger.error('Error fetching inspection by ID:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// UPDATE Inspection
const updateInspection = async (req, res) => {
  const { id } = req.params;
  const { date, inspectorName, foundationCheck, framingCheck, roofingCheck, mepCheck, housekeepingCheck, safetyConcerns, notes, projectId, inspectorId } = req.body;

  try {
    const inspection = await Inspection.findByPk(id);

    if (!inspection) {
      logger.warn(`Inspection not found for update: ${id}`);
      return res.status(404).json({ error: 'Inspection not found.' });
    }

    // If projectId is being updated, verify the new project exists
    if (projectId && projectId !== inspection.projectId) {
      const project = await Project.findByPk(projectId);
      if (!project) {
        logger.warn(`Project not found: ${projectId}`);
        return res.status(404).json({ error: 'Project not found.' });
      }
    }

    // If inspectorId is being updated, verify the new inspector exists
    if (inspectorId && inspectorId !== inspection.inspectorId) {
      const inspector = await User.findByPk(inspectorId);
      if (!inspector) {
        logger.warn(`Inspector not found: ${inspectorId}`);
        return res.status(404).json({ error: 'Inspector not found.' });
      }
    }

    // Update Inspection
    await inspection.update({
      date: date || inspection.date,
      inspectorName: inspectorName || inspection.inspectorName,
      foundationCheck: foundationCheck !== undefined ? foundationCheck : inspection.foundationCheck,
      framingCheck: framingCheck !== undefined ? framingCheck : inspection.framingCheck,
      roofingCheck: roofingCheck !== undefined ? roofingCheck : inspection.roofingCheck,
      mepCheck: mepCheck !== undefined ? mepCheck : inspection.mepCheck,
      housekeepingCheck: housekeepingCheck !== undefined ? housekeepingCheck : inspection.housekeepingCheck,
      safetyConcerns: safetyConcerns !== undefined ? safetyConcerns : inspection.safetyConcerns,
      notes: notes !== undefined ? notes : inspection.notes,
      projectId: projectId || inspection.projectId,
      inspectorId: inspectorId || inspection.inspectorId,
    });

    logger.info(`Inspection updated: ${id} by User: ${req.user.id}`);

    res.status(200).json(inspection);
  } catch (error) {
    logger.error('Error updating inspection:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE Inspection (Admin Only)
const deleteInspection = async (req, res) => {
  const { id } = req.params;

  try {
    const inspection = await Inspection.findByPk(id);

    if (!inspection) {
      logger.warn(`Inspection not found for deletion: ${id}`);
      return res.status(404).json({ error: 'Inspection not found.' });
    }

    await inspection.destroy();

    logger.info(`Inspection deleted: ${id} by User: ${req.user.id}`);

    res.status(200).json({ message: 'Inspection deleted successfully.' });
  } catch (error) {
    logger.error('Error deleting inspection:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createInspection,
  getAllInspectionsForProject,
  getInspectionById,
  updateInspection,
  deleteInspection,
};