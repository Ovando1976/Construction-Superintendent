// models/Project.js

module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define(
    'Project',
    {
      // Basic project info
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      // Dates
      start_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      end_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },

      // Financials
      budget: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      budget_spent: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
        comment: 'Amount of the budget already used',
      },

      // Current progress (%) of the project
      progress: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Completion percentage from 0 to 100',
      },

      // Status field for workflow
      status: {
        type: DataTypes.ENUM('planned', 'in_progress', 'completed', 'archived'),
        allowNull: false,
        defaultValue: 'planned',
      },

      // Who created it (could be tied to a user)
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: 'Projects', // Explicit table name
      timestamps: true,      // createdAt + updatedAt columns
    }
  );

  Project.associate = (models) => {
    // Example association to a DailyReport
    Project.hasMany(models.DailyReport, {
      foreignKey: 'project_id',
      as: 'dailyReports',
    });

    // If you have a User model, you might do:
    // Project.belongsTo(models.User, {
    //   foreignKey: 'created_by',
    //   as: 'creator',
    // });

    // If you have separate models for tasks, team, or documents:
    // Project.hasMany(models.Task, { foreignKey: 'project_id', as: 'tasks' });
    // Project.hasMany(models.ProjectDocument, { foreignKey: 'project_id', as: 'documents' });
    // Project.hasMany(models.ProjectMember, { foreignKey: 'project_id', as: 'team' });
  };

  return Project;
};