// models/Expense.js

module.exports = (sequelize, DataTypes) => {
  const Expense = sequelize.define("Expense", {
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
          msg: "Expense name cannot be empty.",
        },
        len: {
          args: [2, 255],
          msg: "Expense name must be between 2 and 255 characters.",
        },
      },
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
      validate: {
        isDecimal: {
          msg: "Amount must be a decimal number.",
        },
        min: {
          args: [0],
          msg: "Amount cannot be negative.",
        },
      },
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
    category: {
      type: DataTypes.ENUM(
        "labor",
        "materials",
        "equipment",
        "subcontractor",
        "overhead",
        "general"
      ),
      allowNull: false,
      defaultValue: "general",
      validate: {
        isIn: {
          args: [["labor", "materials", "equipment", "subcontractor", "overhead", "general"]],
          msg: "Category must be one of: labor, materials, equipment, subcontractor, overhead, general.",
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
    createdBy: { // Foreign key to User model
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users', // Table name
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // Adjust based on business logic
      validate: {
        isUUID: {
          args: 4,
          msg: "Creator ID must be a valid UUID.",
        },
      },
    },
  }, {
    tableName: 'expenses', // Explicitly define table name
    timestamps: true, // Adds createdAt and updatedAt fields
  });

  Expense.associate = (models) => {
    // Expense belongs to Project
    Expense.belongsTo(models.Project, {
      foreignKey: 'projectId',
      as: 'project',
    });

    // Expense belongs to User as 'creator'
    Expense.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator',
    });
  };

  return Expense;
};