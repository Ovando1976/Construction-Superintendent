// models/TeamMember.js

module.exports = (sequelize, DataTypes) => {
    const TeamMember = sequelize.define('TeamMember', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // automatically generate UUIDs
        primaryKey: true,
        allowNull: false,
      },
      name: {
        // e.g. "John Doe"
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Name cannot be empty.',
          },
        },
      },
      industry: {
        // e.g. "Construction", "Mechanics", "Engineering", etc.
        type: DataTypes.ENUM('Construction', 'Mechanics', 'Engineering', 'Mechanical', 'Architectural_Design'),
        allowNull: false,
        defaultValue: 'Construction',
      },
      trade: {
        // e.g. "Carpenter", "Welder", "Plumber"
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Trade cannot be empty.',
          },
        },
      },
      skillLevel: {
        // e.g. "Master", "Journeyman", "Apprentice", "Laborer"
        type: DataTypes.ENUM('Master', 'Journeyman', 'Apprentice', 'Laborer'),
        allowNull: false,
        defaultValue: 'Laborer',
      },
      salaryPerHour: {
        // e.g. 50.00
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
        validate: {
          min: {
            args: [0],
            msg: 'Salary per hour cannot be negative.',
          },
        },
      },
    }, {
      tableName: 'team_members', // or whatever name you prefer
      timestamps: true,         // adds createdAt + updatedAt
    });
  
    // If you want references to other models, you could define them here:
    // e.g. TeamMember.belongsTo(models.User) if you want a userId column, etc.
    TeamMember.associate = (models) => {
      // no associations needed if everything is stored in the same row
    };
  
    return TeamMember;
  };
  