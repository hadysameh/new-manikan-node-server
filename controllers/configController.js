const db = require('../models');
const catchAsync = require('../utils/catchAsync');
const standardResponse = require('../utils/standardResponse');

const getOne = catchAsync(async (req, res, next) => {
  const bonesAxisConfig = await db.Config.findOne({
    order: [['id', 'DESC']],
  });

  standardResponse.ok(res, bonesAxisConfig);
});

const create = catchAsync(async (req, res, next) => {
  const { maxVolt, maxAnlge, activeArmatureId } = req.body;
  await db.Config.create({
    maxVolt,
    maxAnlge,
    activeArmatureId,
  });
  standardResponse.created(res);
});

module.exports = {
  getOne,
  create,
};
