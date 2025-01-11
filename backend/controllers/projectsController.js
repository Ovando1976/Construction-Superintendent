// controllers/projectsController.js

const { Project } = require('../models');
const logger = require('../src/utils/logger'); // or wherever your logger is

// Get All Projects
const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({
      order: [['createdAt', 'DESC']],
    });
    return res.json(projects);
  } catch (error) {
    logger.error('Error fetching projects:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Get Project by ID (really by "uuid_id")
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params; // e.g., "5aa6380e-6f91-456b-8b90-f526559b47ce"
    // Instead of findByPk(id), we use findOne with a where clause on uuid_id
    const project = await Project.findOne({ where: { uuid_id: id } });

    if (!project) {
      logger.warn(`Project not found: ${id}`);
      return res.status(404).json({ error: 'Project not found.' });
    }

    return res.json(project);
  } catch (error) {
    logger.error('Error fetching project:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a New Project
const createProject = async (req, res) => {
  try {
    const {
      project_name,
      project_description,
      scope,
      site_location,
      site_condition,
      start_date,
      end_date,
      status,
      estimated_budget,
      // arrays if your DB supports them (like tasks_list, relevant_documents, etc.)
      assigned_team_leader,
      assigned_team_members,
      tasks_list,
      material_list,
      equipment_list,
      tools_list,
      relevant_documents,
      photos,
      charts,
    } = req.body;

    // Create the project in the database
    const newProject = await Project.create({
      project_name,
      project_description,
      scope,
      site_location,
      site_condition,
      start_date,
      end_date,
      status,
      estimated_budget,
      assigned_team_leader,
      assigned_team_members,
      tasks_list,
      material_list,
      equipment_list,
      tools_list,
      relevant_documents,
      photos,
      charts,
    });

    logger.info(`Project created: ${newProject.uuid_id} by User: ${req.user?.id || 'Unknown'}`);
    return res.status(201).json(newProject);
  } catch (error) {
    logger.error('Error creating project:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a Project (by uuid_id)
const updateProject = async (req, res) => {
  try {
    const { id } = req.params; // param name is "id", but it's actually the uuid_id
    const {
      project_name,
      project_description,
      scope,
      site_location,
      site_condition,
      start_date,
      end_date,
      status,
      estimated_budget,
      assigned_team_leader,
      assigned_team_members,
      tasks_list,
      material_list,
      equipment_list,
      tools_list,
      relevant_documents,
      photos,
      charts,
    } = req.body;

    // Find the project by uuid_id
    const project = await Project.findOne({ where: { uuid_id: id } });
    if (!project) {
      logger.warn(`Project not found for update: ${id}`);
      return res.status(404).json({ error: 'Project not found.' });
    }

    // Update the project with provided data
    await project.update({
      project_name: project_name ?? project.project_name,
      project_description: project_description ?? project.project_description,
      scope: scope ?? project.scope,
      site_location: site_location ?? project.site_location,
      site_condition: site_condition ?? project.site_condition,
      start_date: start_date ?? project.start_date,
      end_date: end_date ?? project.end_date,
      status: status ?? project.status,
      estimated_budget: estimated_budget ?? project.estimated_budget,
      assigned_team_leader: assigned_team_leader ?? project.assigned_team_leader,
      assigned_team_members: assigned_team_members ?? project.assigned_team_members,
      tasks_list: tasks_list ?? project.tasks_list,
      material_list: material_list ?? project.material_list,
      equipment_list: equipment_list ?? project.equipment_list,
      tools_list: tools_list ?? project.tools_list,
      relevant_documents: relevant_documents ?? project.relevant_documents,
      photos: photos ?? project.photos,
      charts: charts ?? project.charts,
    });

    logger.info(`Project updated: ${id} by User: ${req.user?.id || 'Unknown'}`);
    return res.json(project);
  } catch (error) {
    logger.error('Error updating project:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a Project (by uuid_id)
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findOne({ where: { uuid_id: id } });
    if (!project) {
      logger.warn(`Project not found for deletion: ${id}`);
      return res.status(404).json({ error: 'Project not found.' });
    }

    await project.destroy();
    logger.info(`Project deleted: ${id} by User: ${req.user?.id || 'Unknown'}`);
    return res.status(200).json({ message: 'Project deleted successfully.' });
  } catch (error) {
    logger.error('Error deleting project:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};