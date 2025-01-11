// controllers/materialController.js

const { Material, Project, User } = require('../models');
const supabaseClient = require('../utils/supabaseClient'); // For material-related file uploads
const logger = require('../utils/logger'); // Assuming you have a logger set up

// CREATE Material
const createMaterial = async (req, res) => {
  const { name, quantity, unit, costPerUnit, projectId } = req.body;
  const specificationFile = req.file;

  let specificationURL = null;
  if (specificationFile) {
    try {
      const filePath = `material-specifications/${Date.now()}_${specificationFile.originalname}`;

      // Upload specification to Supabase Storage
      const { error: uploadError } = await supabaseClient.storage
        .from('material-specifications')
        .upload(filePath, specificationFile.buffer, { contentType: specificationFile.mimetype });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { publicURL, error: publicUrlError } = supabaseClient.storage
        .from('material-specifications')
        .getPublicUrl(filePath);

      if (publicUrlError) {
        throw publicUrlError;
      }

      specificationURL = publicURL;
    } catch (error) {
      logger.error('Error uploading specification:', error.message);
      return res.status(500).json({ error: 'Failed to upload specification.' });
    }
  }

  try {
    // Check if the project exists
    const project = await Project.findByPk(projectId);
    if (!project) {
      logger.warn(`Project not found: ${projectId}`);
      return res.status(404).json({ error: 'Project not found.' });
    }

    // Create the material
    const material = await Material.create({
      name,
      quantity,
      unit,
      costPerUnit,
      projectId,
      specificationURL, // Assuming you have added a `specificationURL` field in the model
    });

    logger.info(`Material created: ${material.id} for Project: ${projectId} by User: ${req.user.id}`);

    res.status(201).json(material);
  } catch (error) {
    logger.error('Error creating material:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// READ All Materials for a Project
const getAllMaterialsForProject = async (req, res) => {
  const { projectId } = req.params;

  try {
    // Check if the project exists
    const project = await Project.findByPk(projectId);
    if (!project) {
      logger.warn(`Project not found: ${projectId}`);
      return res.status(404).json({ error: 'Project not found.' });
    }

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

    res.status(200).json(materials);
  } catch (error) {
    logger.error('Error fetching materials:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// READ Specific Material by ID
const getMaterialById = async (req, res) => {
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
      logger.warn(`Material not found: ${id}`);
      return res.status(404).json({ error: 'Material not found.' });
    }

    res.status(200).json(material);
  } catch (error) {
    logger.error('Error fetching material by ID:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// UPDATE Material
const updateMaterial = async (req, res) => {
  const { id } = req.params;
  const { name, quantity, unit, costPerUnit, projectId } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Material update validation failed:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const material = await Material.findByPk(id);

    if (!material) {
      logger.warn(`Material not found for update: ${id}`);
      return res.status(404).json({ error: 'Material not found.' });
    }

    // If projectId is being updated, verify the new project exists
    if (projectId && projectId !== material.projectId) {
      const project = await Project.findByPk(projectId);
      if (!project) {
        logger.warn(`Project not found: ${projectId}`);
        return res.status(404).json({ error: 'New project not found.' });
      }
    }

    // Update the material
    await material.update({
      name: name || material.name,
      quantity: quantity !== undefined ? quantity : material.quantity,
      unit: unit || material.unit,
      costPerUnit: costPerUnit !== undefined ? costPerUnit : material.costPerUnit,
      projectId: projectId || material.projectId,
    });

    logger.info(`Material updated: ${id} by User: ${req.user.id}`);

    res.status(200).json(material);
  } catch (error) {
    logger.error('Error updating material:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE Material
const deleteMaterial = async (req, res) => {
  const { id } = req.params;

  try {
    const material = await Material.findByPk(id);

    if (!material) {
      logger.warn(`Material not found for deletion: ${id}`);
      return res.status(404).json({ error: 'Material not found.' });
    }

    await material.destroy();

    logger.info(`Material deleted: ${id} by User: ${req.user.id}`);

    res.status(200).json({ message: 'Material deleted successfully.' });
  } catch (error) {
    logger.error('Error deleting material:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createMaterial,
  getAllMaterialsForProject,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
};