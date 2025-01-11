'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('documents', {
      uuid_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'), // or Sequelize.UUIDV4
        allowNull: false,
        primaryKey: true,
      },
      document_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      // If you store a file URL or path from Supabase or elsewhere
      file_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      // If you want references to a project, user, etc., add them here:
      // e.g. referencing a 'projects' table:
      // project_uuid_id: {
      //   type: Sequelize.UUID,
      //   allowNull: true,
      //   references: {
      //     model: 'projects',
      //     key: 'uuid_id',
      //   },
      //   onUpdate: 'CASCADE',
      //   onDelete: 'SET NULL',
      // },

      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    // Reverse the creation
    await queryInterface.dropTable('documents');
  },
};