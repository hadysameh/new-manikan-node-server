'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove the existing column
    await queryInterface.removeColumn('boneAxisConfig', 'data');

    // Add the first new column
    await queryInterface.addColumn('boneAxisConfig', 'voltSign', {
      type: Sequelize.INTEGER, // Change the type as needed
    });

    // Add the second new column
    await queryInterface.addColumn('boneAxisConfig', 'calibrationVolt', {
      type: Sequelize.INTEGER, // Change the type as needed
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert the changes made in the `up` function
    await queryInterface.removeColumn('boneAxisConfig', 'voltSign');
    await queryInterface.removeColumn('boneAxisConfig', 'calibrationVolt');

    // Add back the removed column
    await queryInterface.addColumn('boneAxisConfig', 'data', {
      type: Sequelize.JSON, // Use the original type
      allowNull: true, // Adjust based on your original schema
    });
  },
};
