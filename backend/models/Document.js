// models/Document.js

module.exports = (sequelize, DataTypes) => {
    const Document = sequelize.define(
      'Document',
      {
        uuid_id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          allowNull: false,
          primaryKey: true,
        },
        document_name: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        file_url: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
        tableName: 'documents',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );
  
    // If you want associations, define them here
    // e.g. Document.belongsTo(models.Project, { foreignKey: 'project_uuid_id' });
  
    return Document;
  };