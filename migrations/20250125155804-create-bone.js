'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Bones', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      boneName: {
        type: Sequelize.STRING,
      },
      armatureId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Armatures', // Name of the referenced table
          key: 'id', // Primary key of the referenced table
        },
        onUpdate: 'CASCADE', // Optional: Update the foreign key if the referenced key is updated
        onDelete: 'CASCADE', // Optional: Delete the record if the referenced key is deleted
      },
      AVoltSign: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      BVoltSign: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      CVoltSign: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      ACalibrationVolt: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      BCalibrationVolt: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      CCalibrationVolt: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      ALocalAxisMapping: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      BLocalAxisMapping: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      CLocalAxisMapping: {
        type: Sequelize.STRING,
        allowNull: true,
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Bones');
  },
};
