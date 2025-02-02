'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('boneAxisConfig', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      boneId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Bones',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      axisId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Axes',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      customAxisId: {
        type: Sequelize.INTEGER,

        references: {
          model: 'CustomAxes',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      data: {
        type: Sequelize.JSON, // Use Sequelize.JSONB for PostgreSQL
        allowNull: true, // Set to false if the field is required
      },
      createdAt: {
        type: Sequelize.DATE,
      },
      updatedAt: {
        type: Sequelize.DATE,
      },
    });

    // Add a unique constraint to prevent duplicate associations
    await queryInterface.addConstraint('boneAxisConfig', {
      fields: ['boneId', 'axisId', 'customAxisId'],
      type: 'unique',
      name: 'unique_bone_axis_config',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('boneAxisConfig');
  },
};
