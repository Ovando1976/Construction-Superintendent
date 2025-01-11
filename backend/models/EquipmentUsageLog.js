// models/EquipmentUsageLog.js

module.exports = (sequelize, DataTypes) => {
    const EquipmentUsageLog = sequelize.define("EquipmentUsageLog", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // Automatically generate UUIDs
        primaryKey: true,
        allowNull: false,
      },
      equipment_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'equipments', // Table name
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        validate: {
          isUUID: {
            args: 4,
            msg: "Equipment ID must be a valid UUID.",
          },
        },
      },
      usageDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          isDate: {
            msg: "Usage date must be a valid date.",
          },
        },
      },
      hoursUsed: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: {
            args: [0],
            msg: "Hours used cannot be negative.",
          },
        },
      },
    }, {
      tableName: 'equipment_usage_logs', // Explicitly define table name
      timestamps: true, // Adds createdAt and updatedAt fields
    });
  
    EquipmentUsageLog.associate = (models) => {
      // EquipmentUsageLog belongs to Equipment
      EquipmentUsageLog.belongsTo(models.Equipment, {
        foreignKey: 'equipment_id',
        as: 'equipment',
      });
    };
  
    return EquipmentUsageLog;
  };