'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BoneAxesCustomAxesCalibrationVolt extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      BoneAxesCustomAxesCalibrationVolt.belongsTo(models.Bone, {
        foreignKey: 'boneId',
      });
      BoneAxesCustomAxesCalibrationVolt.belongsTo(models.Axis, {
        foreignKey: 'axisId',
      });
      BoneAxesCustomAxesCalibrationVolt.belongsTo(models.CustomAxis, {
        foreignKey: 'customAxisId',
      });
    }
  }
  BoneAxesCustomAxesCalibrationVolt.init(
    {
      boneId: {
        // Foreign key to the User model
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Bones', // Name of the referenced table
          key: 'id', // Primary key of the referenced table
        },
      },
      axisId: {
        // Foreign key to the User model
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Axes', // Name of the referenced table
          key: 'id', // Primary key of the referenced table
        },
      },
      customAxisId: {
        // Foreign key to the User model
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'CustomAxes', // Name of the referenced table
          key: 'id', // Primary key of the referenced table
        },
      },
      calibrationVolt: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'BoneAxesCustomAxesCalibrationVolt',
      tableName: 'BoneAxesCustomAxesCalibrationVolt',
      timestamps: true,
    }
  );
  return BoneAxesCustomAxesCalibrationVolt;
};
