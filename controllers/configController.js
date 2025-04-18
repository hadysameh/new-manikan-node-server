const db = require('../models');
const catchAsync = require('../utils/catchAsync');
const standardResponse = require('../utils/standardResponse');

const getOne = catchAsync(async (req, res, next) => {
  const bonesAxisConfig = await db.Config.findOne({
    order: [['id', 'DESC']],
  });

  standardResponse.ok(res, bonesAxisConfig);
});

const update = catchAsync(async (req, res, next) => {
  const { maxVolt, maxAnlge, activeArmatureId } = req.body;
  const lastRecord = await Config.findOne({
    order: [['id', 'DESC']],
  });

  if (lastRecord) {
    await lastRecord.update({
      maxVolt,
      maxAnlge,
      activeArmatureId,
    });
  }
  standardResponse.created(res);
});

module.exports = {
  getOne,
  update,
};
