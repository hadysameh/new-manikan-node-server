const db = require('../models');
const catchAsync = require('../utils/catchAsync');
const standardResponse = require('../utils/standardResponse');

const getAll = catchAsync(async (req, res, next) => {
  const armatures = await db.Armature.findAll();
  res.status(200).json(armatures);
});

const getOne = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const armature = await db.Armature.findOne({ where: { id } });
  standardResponse.ok(res, armature);
});

const update = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name, isActive } = req.body;
  const armatures = await db.Armature.update(
    { name, isActive },
    { where: { id } }
  );
  standardResponse.ok(res);
});

const remove = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  await db.Armature.destroy({ where: { id } });
  standardResponse.deleted(res);
});

const create = catchAsync(async (req, res, next) => {
  const { name, isActive } = req.body;
  const armatures = await db.Armature.create({ name, isActive });
  standardResponse.created(res);
});

module.exports = {
  getAll,
  getOne,
  update,
  remove,
  create,
};
