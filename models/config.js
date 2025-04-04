'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Config extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Config.belongsTo(models.Armature, { foreignKey: 'activeArmatureId' });
    }
  }
  Config.init(
    {
      maxVolt: DataTypes.INTEGER,
      maxAnlge: DataTypes.INTEGER,
      activeArmatureId: {
        // Foreign key to the User model
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Armatures', // Name of the referenced table
          key: 'id', // Primary key of the referenced table
        },
      },
    },
    {
      sequelize,
      modelName: 'Config',
    }
  );
  return Config;
};
