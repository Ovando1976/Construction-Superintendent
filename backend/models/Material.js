// models/Material.js

module.exports = (sequelize, DataTypes) => {
  const Material = sequelize.define("Material", {
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
          msg: "Material name cannot be empty.",
        },
        len: {
          args: [2, 255],
          msg: "Material name must be between 2 and 255 characters.",
        },
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: {
          msg: "Quantity must be an integer.",
        },
        min: {
          args: [0],
          msg: "Quantity cannot be negative.",
        },
      },
    },
    unit: {
      type: DataTypes.ENUM("pcs", "kg", "liters", "meters", "units", "other"),
      allowNull: false,
      defaultValue: "pcs",
      validate: {
        isIn: {
          args: [["pcs", "kg", "liters", "meters", "units", "other"]],
          msg: "Unit must be one of: pcs, kg, liters, meters, units, other.",
        },
      },
    },
    costPerUnit: { // Clarified to represent cost per unit
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
      validate: {
        isDecimal: {
          msg: "Cost per unit must be a decimal number.",
        },
        min: {
          args: [0],
          msg: "Cost per unit cannot be negative.",
        },
      },
    },
    totalCost: { // Calculated field (optional)
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        isDecimal: {
          msg: "Total cost must be a decimal number.",
        },
        min: {
          args: [0],
          msg: "Total cost cannot be negative.",
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
  }, {
    tableName: 'materials', // Explicitly define table name
    timestamps: true, // Adds createdAt and updatedAt fields
  });

  Material.associate = (models) => {
    // Material belongs to Project
    Material.belongsTo(models.Project, {
      foreignKey: 'projectId',
      as: 'project',
    });

    // Example: Material has many PurchaseOrders (if applicable)
    // Material.hasMany(models.PurchaseOrder, {
    //   foreignKey: 'materialId',
    //   as: 'purchaseOrders',
    // });
  };

  // Hook to calculate totalCost before saving
  Material.beforeSave((material, options) => {
    if (material.quantity && material.costPerUnit) {
      material.totalCost = material.quantity * parseFloat(material.costPerUnit);
    }
  });

  return Material;
};