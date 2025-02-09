const db = require('../models');
const catchAsync = require('../utils/catchAsync');
const standardResponse = require('../utils/standardResponse');
const { dataHolder, populateConfigDataHolder } = require('../configDataHolder');

const getCalibrationPageOptions = catchAsync(async (req, res, next) => {
  const armatures = await db.Armature.findAll();
  const axes = await db.Axis.findAll();
  const customAxes = await db.CustomAxis.findAll();
  standardResponse.ok(res, { armatures, axes, customAxes });
});

const selectAndGetArmatureData = catchAsync(async (req, res, next) => {
  const { id: armatureId } = req.params;

  const armatureData = await db.BoneAxisConfig.findAll({
    include: [
      {
        model: db.Bone,
        attributes: [],
        include: [
          {
            model: db.Armature,
            attributes: ['name'],
            where: { id: armatureId },
          },
        ],
      },
      {
        model: db.Axis,
        attributes: ['id'],
      },
      {
        model: db.CustomAxis,
        attributes: ['id'],
      },
    ],
    attributes: [
      'id', // Include Post fields you want
      'data',
      [db.sequelize.col(`Bone.bodyBoneName`), 'bodyBoneName'],
      [db.sequelize.col('Bone.armatureBoneName'), 'armatureBoneName'],
      [db.sequelize.col('Axis.name'), 'axisName'],
      [db.sequelize.col('CustomAxis.name'), 'customAxisName'],
    ],
  });
  dataHolder.armatureId = armatureId;
  await populateConfigDataHolder();
  standardResponse.ok(res, armatureData);
});

const updateBoneAxisConfig = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const whereCondition = {};
  const { boneId, axisId, data } = req.body;

  if (id) {
    whereCondition = { id };
  } else {
    whereCondition = { boneId, axisId, customAxisId };
  }

  await db.Armature.update({ boneId, axisId, data }, { where: whereCondition });
  standardResponse.ok(res);
});

module.exports = {
  getCalibrationPageOptions,
  selectAndGetArmatureData,
  updateBoneAxisConfig,
};
