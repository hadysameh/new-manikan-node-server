'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Configs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      activeArmatureId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Armatures', // Name of the referenced table
          key: 'id', // Primary key of the referenced table
        },
        onUpdate: 'CASCADE', // Optional: Update the foreign key if the referenced key is updated
        onDelete: 'CASCADE', // Optional: Delete the record if the referenced key is deleted
      },
      maxVolt: {
        type: Sequelize.STRING,
      },
      maxAnlge: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('Configs');
  },
};
