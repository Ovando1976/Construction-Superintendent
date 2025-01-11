// controllers/taskController.js

const { Task, Project, User } = require('../models');
const logger = require('../utils/logger'); // Assuming you have a logger set up

// CREATE Task
const createTask = async (req, res) => {
  const { name, description, status, dueDate, projectId, assignedTo } = req.body;

  try {
    // Verify Project Exists
    const project = await Project.findByPk(projectId);
    if (!project) {
      logger.warn(`Project not found: ${projectId}`);
      return res.status(404).json({ error: 'Project not found.' });
    }

    // If assignedTo is provided, verify User Exists
    if (assignedTo) {
      const assignee = await User.findByPk(assignedTo);
      if (!assignee) {
        logger.warn(`Assignee not found: ${assignedTo}`);
        return res.status(404).json({ error: 'Assignee not found.' });
      }
    }

    // Create Task
    const task = await Task.create({
      name,
      description,
      status: status || 'pending',
      dueDate,
      projectId,
      assignedTo: assignedTo || null,
      createdBy: req.user.id, // Assuming the authenticated user's ID is available
    });

    logger.info(`Task created: ${task.id} for Project: ${projectId} by User: ${req.user.id}`);

    res.status(201).json(task);
  } catch (error) {
    logger.error('Error creating task:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// READ All Tasks for a Project
const getAllTasksForProject = async (req, res) => {
  const { projectId } = req.params;

  try {
    // Verify Project Exists
    const project = await Project.findByPk(projectId);
    if (!project) {
      logger.warn(`Project not found: ${projectId}`);
      return res.status(404).json({ error: 'Project not found.' });
    }

    // Fetch Tasks
    const tasks = await Task.findAll({
      where: { projectId },
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name'],
        },
      ],
      order: [['dueDate', 'ASC']],
    });

    res.status(200).json(tasks);
  } catch (error) {
    logger.error('Error fetching tasks:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// READ Specific Task by ID
const getTaskById = async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findByPk(id, {
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name'],
        },
      ],
    });

    if (!task) {
      logger.warn(`Task not found: ${id}`);
      return res.status(404).json({ error: 'Task not found.' });
    }

    res.status(200).json(task);
  } catch (error) {
    logger.error('Error fetching task by ID:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// UPDATE Task
const updateTask = async (req, res) => {
  const { id } = req.params;
  const { name, description, status, dueDate, projectId, assignedTo } = req.body;

  try {
    const task = await Task.findByPk(id);

    if (!task) {
      logger.warn(`Task not found for update: ${id}`);
      return res.status(404).json({ error: 'Task not found.' });
    }

    // If projectId is being updated, verify the new project exists
    if (projectId && projectId !== task.projectId) {
      const project = await Project.findByPk(projectId);
      if (!project) {
        logger.warn(`Project not found: ${projectId}`);
        return res.status(404).json({ error: 'Project not found.' });
      }
    }

    // If assignedTo is being updated, verify the new assignee exists
    if (assignedTo && assignedTo !== task.assignedTo) {
      const assignee = await User.findByPk(assignedTo);
      if (!assignee) {
        logger.warn(`Assignee not found: ${assignedTo}`);
        return res.status(404).json({ error: 'Assignee not found.' });
      }
    }

    // Update Task
    await task.update({
      name: name || task.name,
      description: description || task.description,
      status: status || task.status,
      dueDate: dueDate || task.dueDate,
      projectId: projectId || task.projectId,
      assignedTo: assignedTo !== undefined ? assignedTo : task.assignedTo,
    });

    logger.info(`Task updated: ${id} by User: ${req.user.id}`);

    res.status(200).json(task);
  } catch (error) {
    logger.error('Error updating task:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE Task
const deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findByPk(id);

    if (!task) {
      logger.warn(`Task not found for deletion: ${id}`);
      return res.status(404).json({ error: 'Task not found.' });
    }

    await task.destroy();

    logger.info(`Task deleted: ${id} by User: ${req.user.id}`);

    res.status(200).json({ message: 'Task deleted successfully.' });
  } catch (error) {
    logger.error('Error deleting task:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createTask,
  getAllTasksForProject,
  getTaskById,
  updateTask,
  deleteTask,
};