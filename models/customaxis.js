'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CustomAxis extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      CustomAxis.belongsToMany(models.Bone, {
        through: models.BoneAxisConfig, // Join table
        foreignKey: 'customAxisId', // Foreign key in the join table referencing Project
      });

      CustomAxis.belongsToMany(models.Axis, {
        through: models.BoneAxisConfig, // Join table
        foreignKey: 'customAxisId', // Foreign key in the join table referencing Project
      });
    }
  }
  CustomAxis.init(
    {
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'CustomAxis',
    }
  );
  return CustomAxis;
};
