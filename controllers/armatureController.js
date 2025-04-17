const db = require('../models');
const catchAsync = require('../utils/catchAsync');
const standardResponse = require('../utils/standardResponse');

const getAll = catchAsync(async (req, res, next) => {
  const armatures = await db.Armature.findAll();
  standardResponse.ok(res, armatures);
});

const getOne = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const armature = await db.Armature.findOne({ where: { id } });
  standardResponse.ok(res, armature);
});

const update = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name, isActive } = req.body;
  await db.Armature.update({ name, isActive }, { where: { id } });
  standardResponse.ok(res);
});

module.exports = {
  getAll,
  getOne,
  update,
};
