'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Bone extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Bone.belongsTo(models.Armature, { foreignKey: 'armatureId' });
    }
  }
  Bone.init(
    {
      boneName: {
        type: DataTypes.STRING,
      },
      armatureId: {
        // Foreign key to the User model
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Armatures', // Name of the referenced table
          key: 'id', // Primary key of the referenced table
        },
      },

      AVoltSign: {
        type: DataTypes.INTEGER,
      },
      AVoltSign: {
        type: DataTypes.INTEGER,
      },
      AVoltSign: {
        type: DataTypes.INTEGER,
      },

      ACalibrationVolt: {
        type: DataTypes.INTEGER,
      },
      BCalibrationVolt: {
        type: DataTypes.INTEGER,
      },
      CCalibrationVolt: {
        type: DataTypes.INTEGER,
      },

      ALocalAxisMapping: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      BLocalAxisMapping: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      CLocalAxisMapping: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Bone',
    }
  );
  return Bone;
};
