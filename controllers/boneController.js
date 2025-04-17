const db = require('../models');
const catchAsync = require('../utils/catchAsync');
const standardResponse = require('../utils/standardResponse');

// /armature/:armatureId/bones
const getAll = catchAsync(async (req, res, next) => {
  const { armatureId } = req.params;
  const bonesData = await db.Bone.findAll({ where: { armatureId } });
  standardResponse.ok(res, { bonesData });
});

// /bones/:boneId
const update = catchAsync(async (req, res, next) => {
  const { boneId } = req.params;

  const {
    AVoltSign,
    BVoltSign,
    CVoltSign,
    ACalibrationVolt,
    BCalibrationVolt,
    CCalibrationVolt,
    ALocalAxisMapping,
    BLocalAxisMapping,
    CLocalAxisMapping,
  } = req.body;
  await db.Bone.update(
    {
      AVoltSign,
      BVoltSign,
      CVoltSign,
      ACalibrationVolt,
      BCalibrationVolt,
      CCalibrationVolt,
      ALocalAxisMapping,
      BLocalAxisMapping,
      CLocalAxisMapping,
    },
    {
      where: {
        id: boneId,
      },
    }
  );
  standardResponse.ok(res, { bonesAxisConfig });
});

module.exports = {
  getAll,
  update,
};
