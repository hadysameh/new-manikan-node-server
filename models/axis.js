'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Axis extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Axis.belongsToMany(models.Bone, {
        through: models.BoneAxisConfig, // Join table
        foreignKey: 'axisId', // Foreign key in the join table referencing Project
      });
      Axis.belongsToMany(models.CustomAxis, {
        through: models.BoneAxisConfig, // Join table
        foreignKey: 'axisId', // Foreign key in the join table referencing Project
      });
    }
  }
  Axis.init(
    {
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Axis',
    }
  );
  return Axis;
};
