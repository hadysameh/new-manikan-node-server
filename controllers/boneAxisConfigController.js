const db = require('../models');
const catchAsync = require('../utils/catchAsync');
const standardResponse = require('../utils/standardResponse');

const getAll = catchAsync(async (req, res, next) => {
  const bonesAxisConfig = await db.BoneAxisConfig.findAll();
  res.status(200).json(bonesAxisConfig);
});

const getOne = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const bonesAxisConfig = await db.BoneAxisConfig.findOne({ where: { id } });

  standardResponse.ok(res, { bonesAxisConfig });
});

const update = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const whereCondition = {};
  const { boneId, axisId, customAxisId, calibrationVolt } = req.body;

  if (id) {
    whereCondition = { id };
  } else {
    whereCondition = { boneId, axisId, customAxisId };
  }

  const armatures = await db.Armature.update(
    { boneId, axisId, customAxisId, calibrationVolt },
    { where: whereCondition }
  );
  standardResponse.ok(res);
});

const remove = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const armatures = await db.Armature.destroy({
    where: { id },
  });
  standardResponse.deleted(res);
});

const create = catchAsync(async (req, res, next) => {
  const { boneId, axisId, customAxisId, calibrationVolt } = req.body;
  const armatures = await db.Armature.create({
    boneId,
    axisId,
    customAxisId,
    calibrationVolt,
  });
  standardResponse.created(res);
});

module.exports = {
  getAll,
  getOne,
  update,
  remove,
  create,
};
