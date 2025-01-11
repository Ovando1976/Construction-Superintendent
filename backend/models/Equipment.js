// models/Equipment.js

module.exports = (sequelize, DataTypes) => {
  const Equipment = sequelize.define("Equipment", {
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
          msg: "Equipment name cannot be empty.",
        },
        len: {
          args: [2, 255],
          msg: "Equipment name must be between 2 and 255 characters.",
        },
      },
    },
    status: {
      type: DataTypes.ENUM("available", "in_use", "maintenance"),
      allowNull: false,
      defaultValue: "available",
      validate: {
        isIn: {
          args: [["available", "in_use", "maintenance"]],
          msg: "Status must be either available, in_use, or maintenance.",
        },
      },
    },
    usageHours: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: "Usage hours cannot be negative.",
        },
      },
    },
    lastMaintenanceDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isDate: {
          msg: "Last maintenance date must be a valid date.",
        },
      },
    },
    project_id: { // Foreign key to Project model
      type: DataTypes.UUID,
      allowNull: true, // Assuming equipment may not always be assigned to a project
      references: {
        model: 'projects', // Table name
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      validate: {
        isUUID: {
          args: 4,
          msg: "Project ID must be a valid UUID.",
        },
      },
    },
  }, {
    tableName: 'equipments', // Explicitly define table name
    timestamps: true, // Adds createdAt and updatedAt fields
  });

  Equipment.associate = (models) => {
    // Equipment belongs to a Project
    Equipment.belongsTo(models.Project, {
      foreignKey: 'project_id',
      as: 'project',
    });

    // Equipment has many EquipmentUsageLogs (if you have such a model)
    Equipment.hasMany(models.EquipmentUsageLog, {
      foreignKey: 'equipment_id',
      as: 'usageLogs',
    });
  };

  return Equipment;
};