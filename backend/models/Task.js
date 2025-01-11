// models/Task.js

module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, // Automatically generate UUIDs
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Task name cannot be empty.",
        },
        len: {
          args: [2, 255],
          msg: "Task name must be between 2 and 255 characters.",
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 2000],
          msg: "Description can be up to 2000 characters long.",
        },
      },
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed'),
      defaultValue: 'pending',
      allowNull: false,
      validate: {
        isIn: {
          args: [['pending', 'in_progress', 'completed']],
          msg: "Status must be one of: pending, in_progress, completed.",
        },
      },
    },
    dueDate: { // Changed to camelCase
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: {
          msg: "Due date must be a valid date.",
        },
        isAfterToday(value) { // Custom validator to ensure dueDate is today or in the future
          if (value < new Date().toISOString().split('T')[0]) {
            throw new Error("Due date cannot be in the past.");
          }
        },
      },
    },
    projectId: { // Changed to camelCase and UUID type
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'projects', // Table name in lowercase
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE', // Adjust based on business logic
      validate: {
        isUUID: {
          args: 4,
          msg: "Project ID must be a valid UUID.",
        },
      },
    },
    assignedTo: { // Changed to camelCase and UUID type
      type: DataTypes.UUID,
      allowNull: true, // Task might not always be assigned immediately
      references: {
        model: 'users', // Table name in lowercase
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // Adjust based on business logic
      validate: {
        isUUID: {
          args: 4,
          msg: "Assignee ID must be a valid UUID.",
        },
      },
    },
    createdBy: { // Optional: Track who created the task
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      validate: {
        isUUID: {
          args: 4,
          msg: "Creator ID must be a valid UUID.",
        },
      },
    },
  }, {
    tableName: 'tasks', // Explicitly define table name in lowercase
    timestamps: true,    // Adds createdAt and updatedAt fields
  });

  Task.associate = (models) => {
    // Task belongs to Project
    Task.belongsTo(models.Project, {
      foreignKey: 'projectId',
      as: 'project',
    });

    // Task belongs to User as 'assignee'
    Task.belongsTo(models.User, {
      foreignKey: 'assignedTo',
      as: 'assignee',
    });

    // Optional: Task belongs to User as 'creator'
    Task.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator',
    });
  };

  return Task;
};