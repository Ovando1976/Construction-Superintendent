// models/DailyReport.js

module.exports = (sequelize, DataTypes) => {
  const DailyReport = sequelize.define('DailyReport', {
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: {
          msg: 'Date must be a valid date.',
        },
      },
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 1000],
          msg: 'Notes can be up to 1000 characters long.',
        },
      },
    },
    weather_conditions: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [0, 255],
          msg: 'Weather conditions can be up to 255 characters long.',
        },
      },
    },
    photos: {
      type: DataTypes.ARRAY(DataTypes.STRING), // Array of photo URLs
      allowNull: true,
      validate: {
        isValidUrlArray(value) {
          if (value && value.length > 0) {
            value.forEach((url) => {
              const urlPattern = new RegExp(
                '^(https?:\\/\\/)?' + // protocol
                  '((([a-zA-Z0-9\\-\\.]+)\\.([a-zA-Z]{2,5}))|' + // domain name
                  'localhost|' + // localhost
                  '(([0-9]{1,3}\\.){3}[0-9]{1,3}))' + // OR ip (v4) address
                  '(\\:[0-9]{1,5})?' + // port
                  '(\\/.*)?$', // path
                'i'
              );
              if (!urlPattern.test(url)) {
                throw new Error(`Invalid URL in photos array: ${url}`);
              }
            });
          }
        },
      },
    },
    project_id: {
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
          msg: 'Project ID must be a valid UUID.',
        },
      },
    },
    submitted_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users', // Table name
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // Depending on your business logic
      validate: {
        isUUID: {
          args: 4,
          msg: 'Submitted By must be a valid UUID.',
        },
      },
    },
  }, {
    tableName: 'daily_reports', // Specify table name if it doesn't follow Sequelize's naming convention
    timestamps: true, // Adds createdAt and updatedAt fields
  });

  DailyReport.associate = (models) => {
    // DailyReport belongs to Project
    DailyReport.belongsTo(models.Project, {
      foreignKey: 'project_id',
      as: 'project',
    });

    // DailyReport belongs to User as 'submitter'
    DailyReport.belongsTo(models.User, {
      foreignKey: 'submitted_by',
      as: 'submitter',
    });
  };

  return DailyReport;
};