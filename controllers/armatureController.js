const db = require('../models');
const catchAsync = require('../utils/catchAsync');

const getAll = catchAsync(async (req, res, next) => {
  const armatures = await db.Armature.findAll();
  res.status(200).json(armatures);
});

const getOne = catchAsync(async (req, res, next) => {});

const update = catchAsync(async (req, res, next) => {});

const remove = catchAsync(async (req, res, next) => {});

const create = catchAsync(async (req, res, next) => {});

module.exports = {
  getAll,
  getOne,
  update,
  remove,
  create,
};
