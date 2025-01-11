// controllers/equipmentController.js

const { Equipment, Project, EquipmentUsageLog, User } = require('../models');
const supabaseClient = require('../utils/supabaseClient'); // For equipment-related file uploads
const logger = require('../utils/logger'); // Assuming you have a logger set up

// CREATE Equipment
const createEquipment = async (req, res) => {
  const { name, status, usageHours, lastMaintenanceDate, project_id } = req.body;
  const manualFile = req.file;

  let manualURL = null;
  if (manualFile) {
    try {
      const filePath = `equipment-manuals/${Date.now()}_${manualFile.originalname}`;

      // Upload manual to Supabase Storage
      const { error: uploadError } = await supabaseClient.storage
        .from('equipment-manuals')
        .upload(filePath, manualFile.buffer, { contentType: manualFile.mimetype });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { publicURL, error: publicUrlError } = supabaseClient.storage
        .from('equipment-manuals')
        .getPublicUrl(filePath);

      if (publicUrlError) {
        throw publicUrlError;
      }

      manualURL = publicURL;
    } catch (error) {
      logger.error('Error uploading manual:', error.message);
      return res.status(500).json({ error: 'Failed to upload manual.' });
    }
  }

  try {
    const equipment = await Equipment.create({
      name,
      status: status || 'available',
      usageHours: usageHours || 0,
      lastMaintenanceDate: lastMaintenanceDate || null,
      project_id: project_id || null,
      manualURL,
    });

    logger.info(`Equipment created: ${equipment.id} by User: ${req.user.id}`);

    res.status(201).json(equipment);
  } catch (error) {
    logger.error('Error creating equipment:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// READ All Equipments
const getAllEquipments = async (req, res) => {
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
    logger.error('Error fetching equipments:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// READ Specific Equipment by ID
const getEquipmentById = async (req, res) => {
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
      logger.warn(`Equipment not found: ${id}`);
      return res.status(404).json({ error: 'Equipment not found.' });
    }

    res.status(200).json(equipment);
  } catch (error) {
    logger.error('Error fetching equipment by ID:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// UPDATE Equipment
const updateEquipment = async (req, res) => {
  const { id } = req.params;
  const { name, status, usageHours, lastMaintenanceDate, project_id } = req.body;
  const manualFile = req.file;

  let manualURL = null;
  if (manualFile) {
    try {
      const filePath = `equipment-manuals/${Date.now()}_${manualFile.originalname}`;

      // Upload new manual to Supabase Storage
      const { error: uploadError } = await supabaseClient.storage
        .from('equipment-manuals')
        .upload(filePath, manualFile.buffer, { contentType: manualFile.mimetype });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { publicURL, error: publicUrlError } = supabaseClient.storage
        .from('equipment-manuals')
        .getPublicUrl(filePath);

      if (publicUrlError) {
        throw publicUrlError;
      }

      manualURL = publicURL;
    } catch (error) {
      logger.error('Error uploading new manual:', error.message);
      return res.status(500).json({ error: 'Failed to upload new manual.' });
    }
  }

  try {
    const equipment = await Equipment.findByPk(id);

    if (!equipment) {
      logger.warn(`Equipment not found for update: ${id}`);
      return res.status(404).json({ error: 'Equipment not found.' });
    }

    // Update fields
    equipment.name = name || equipment.name;
    equipment.status = status || equipment.status;
    equipment.usageHours = usageHours !== undefined ? usageHours : equipment.usageHours;
    equipment.lastMaintenanceDate = lastMaintenanceDate || equipment.lastMaintenanceDate;
    equipment.project_id = project_id !== undefined ? project_id : equipment.project_id;
    equipment.manualURL = manualURL || equipment.manualURL;

    await equipment.save();

    logger.info(`Equipment updated: ${id} by User: ${req.user.id}`);

    res.status(200).json(equipment);
  } catch (error) {
    logger.error('Error updating equipment:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE Equipment
const deleteEquipment = async (req, res) => {
  const { id } = req.params;

  try {
    const equipment = await Equipment.findByPk(id);

    if (!equipment) {
      logger.warn(`Equipment not found for deletion: ${id}`);
      return res.status(404).json({ error: 'Equipment not found.' });
    }

    await equipment.destroy();

    logger.info(`Equipment deleted: ${id} by User: ${req.user.id}`);

    res.status(200).json({ message: 'Equipment deleted successfully.' });
  } catch (error) {
    logger.error('Error deleting equipment:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createEquipment,
  getAllEquipments,
  getEquipmentById,
  updateEquipment,
  deleteEquipment,
};