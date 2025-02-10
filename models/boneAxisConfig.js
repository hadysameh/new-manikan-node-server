'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BoneAxisConfig extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      BoneAxisConfig.belongsTo(models.Bone, {
        foreignKey: 'boneId',
      });
      BoneAxisConfig.belongsTo(models.Axis, {
        foreignKey: 'axisId',
      });
      BoneAxisConfig.belongsTo(models.CustomAxis, {
        foreignKey: 'customAxisId',
      });
    }
  }
  BoneAxisConfig.init(
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
        references: {
          model: 'CustomAxes', // Name of the referenced table
          key: 'id', // Primary key of the referenced table
        },
      },
      voltSign: {
        type: DataTypes.INTEGER,
      },
      calibrationVolt: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: 'BoneAxisConfig',
      tableName: 'boneAxisConfig',
      timestamps: true,
    }
  );
  return BoneAxisConfig;
};
