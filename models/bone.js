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
      Bone.belongsToMany(models.Axis, {
        through: models.BoneAxisConfig, // Join table
        foreignKey: 'boneId', // Foreign key in the join table referencing Project
      });
      Bone.belongsToMany(models.CustomAxis, {
        through: models.BoneAxisConfig, // Join table
        foreignKey: 'boneId', // Foreign key in the join table referencing Project
      });
    }
  }
  Bone.init(
    {
      bodyBoneName: DataTypes.STRING,
      armatureBoneName: DataTypes.STRING,
      armatureId: {
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
      modelName: 'Bone',
    }
  );
  return Bone;
};
