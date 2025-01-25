'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('BoneAxesCustomAxesCalibrationVolt', {
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
        allowNull: false,
        references: {
          model: 'CustomAxes',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      calibrationVolt: {
        type: Sequelize.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Add a unique constraint to prevent duplicate associations
    await queryInterface.addConstraint('BoneAxesCustomAxesCalibrationVolt', {
      fields: ['boneId', 'axisId', 'customAxisId'],
      type: 'unique',
      name: 'unique_bone_axis_cutomAxis',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('BoneAxesCustomAxesCalibrationVolt');
  },
};
