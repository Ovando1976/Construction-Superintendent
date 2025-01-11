// models/User.js

const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: { // Primary Key
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
          msg: "User name cannot be empty.",
        },
        len: {
          args: [2, 255],
          msg: "User name must be between 2 and 255 characters.",
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        args: true,
        msg: "Email address already in use.",
      },
      validate: {
        isEmail: {
          msg: "Must be a valid email address.",
        },
        notEmpty: {
          msg: "Email cannot be empty.",
        },
      },
    },
    password: { // Ensure passwords are hashed before saving
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Password cannot be empty.",
        },
        len: {
          args: [6, 255],
          msg: "Password must be at least 6 characters long.",
        },
      },
    },
    role: { // e.g., Admin, ProjectManager, Supervisor, SkilledWorker, Laborer
      type: DataTypes.ENUM('Admin', 'ProjectManager', 'Supervisor', 'SkilledWorker', 'Laborer'),
      allowNull: false,
      defaultValue: 'SkilledWorker',
      validate: {
        isIn: {
          args: [['Admin', 'ProjectManager', 'Supervisor', 'SkilledWorker', 'Laborer']],
          msg: "Role must be one of: Admin, ProjectManager, Supervisor, SkilledWorker, Laborer.",
        },
      },
    },
    tradeId: { // Foreign key to Trade model
      type: DataTypes.UUID,
      allowNull: true, // Allow null if the user hasn't been assigned a trade yet
      references: {
        model: 'trades', // Table name
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      validate: {
        isUUID: {
          args: 4,
          msg: "Trade ID must be a valid UUID.",
        },
      },
    },
    skillLevel: { // Skill Level
      type: DataTypes.ENUM('Junior', 'Mid-level', 'Senior', 'Expert'),
      allowNull: true, // Allow null if skill level hasn't been assigned yet
      defaultValue: 'Junior',
      validate: {
        isIn: {
          args: [['Junior', 'Mid-level', 'Senior', 'Expert']],
          msg: "Skill level must be one of: Junior, Mid-level, Senior, Expert.",
        },
      },
    },
    phoneNumber: { // New Field: Phone Number (Optional)
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: {
          args: /^[0-9\-+()\s]+$/i,
          msg: "Phone number must contain only numbers and valid symbols.",
        },
        len: {
          args: [7, 15],
          msg: "Phone number must be between 7 and 15 characters long.",
        },
      },
    },
  }, {
    tableName: 'users', // Explicitly define table name
    timestamps: true,    // Adds createdAt and updatedAt fields
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  });

  User.associate = (models) => {
    // User belongs to Trade
    User.belongsTo(models.Trade, {
      foreignKey: 'tradeId',
      as: 'trade',
    });

    // User has many Projects as 'submittedProjects'
    User.hasMany(models.Project, {
      foreignKey: 'createdBy',
      as: 'submittedProjects',
      onDelete: 'CASCADE',
    });

    // User has many Expenses as 'expenses'
    User.hasMany(models.Expense, {
      foreignKey: 'createdBy',
      as: 'expenses',
      onDelete: 'CASCADE',
    });

    // User has many Tasks as 'assignedTasks'
    User.hasMany(models.Task, {
      foreignKey: 'assigned_to',
      as: 'assignedTasks',
      onDelete: 'SET NULL',
    });

    // User has many TeamMembers as 'teamMembers'
    User.hasMany(models.TeamMember, {
      foreignKey: 'userId',
      as: 'teamMembers',
      onDelete: 'CASCADE',
    });

    // User has many Equipment as 'equipments'
    User.hasMany(models.Equipment, {
      foreignKey: 'userId',
      as: 'equipments',
      onDelete: 'CASCADE',
    });

    // Additional associations as needed
  };

  // Instance Method to Validate Password
  User.prototype.validPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  };

  return User;
};