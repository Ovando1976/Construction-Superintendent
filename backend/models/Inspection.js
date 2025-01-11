// models/Inspection.js

module.exports = (sequelize, DataTypes) => {
  const Inspection = sequelize.define("Inspection", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, // Automatically generate UUIDs
      primaryKey: true,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: {
          msg: "Date must be a valid date.",
        },
      },
    },
    inspectorName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Inspector name cannot be empty.",
        },
        len: {
          args: [2, 255],
          msg: "Inspector name must be between 2 and 255 characters.",
        },
      },
    },
    foundationCheck: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      validate: {
        isIn: {
          args: [[true, false]],
          msg: "Foundation check must be a boolean value.",
        },
      },
    },
    framingCheck: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      validate: {
        isIn: {
          args: [[true, false]],
          msg: "Framing check must be a boolean value.",
        },
      },
    },
    roofingCheck: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      validate: {
        isIn: {
          args: [[true, false]],
          msg: "Roofing check must be a boolean value.",
        },
      },
    },
    mepCheck: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      validate: {
        isIn: {
          args: [[true, false]],
          msg: "MEP check must be a boolean value.",
        },
      },
    },
    housekeepingCheck: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      validate: {
        isIn: {
          args: [[true, false]],
          msg: "Housekeeping check must be a boolean value.",
        },
      },
    },
    safetyConcerns: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 2000],
          msg: "Safety concerns can be up to 2000 characters long.",
        },
      },
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 2000],
          msg: "Notes can be up to 2000 characters long.",
        },
      },
    },
    projectId: { // Foreign key to Project model
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'projects', // Table name
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      validate: {
        isUUID: {
          args: 4,
          msg: "Project ID must be a valid UUID.",
        },
      },
    },
    inspectorId: { // Foreign key to User model (optional)
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users', // Table name
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // Depending on business logic
      validate: {
        isUUID: {
          args: 4,
          msg: "Inspector ID must be a valid UUID.",
        },
      },
    },
  }, {
    tableName: 'inspections', // Explicitly define table name
    timestamps: true, // Adds createdAt and updatedAt fields
  });

  Inspection.associate = (models) => {
    // Inspection belongs to Project
    Inspection.belongsTo(models.Project, {
      foreignKey: 'projectId',
      as: 'project',
    });

    // Inspection belongs to User as 'inspector'
    Inspection.belongsTo(models.User, {
      foreignKey: 'inspectorId',
      as: 'inspector',
    });
  };

  return Inspection;
};