const express = require('express');
const {
  getCalibrationPageOptions,
  selectAndGetArmatureData,
  updateBoneAxisConfig,
} = require('../controllers/calibrationPageOptionsController');

const calibrationPageOptionsRouter = express.Router();

calibrationPageOptionsRouter.get('/', getCalibrationPageOptions);
calibrationPageOptionsRouter.get(
  '/selectandgetarmaturedata/:id',
  selectAndGetArmatureData
);
calibrationPageOptionsRouter.put(
  '/updateboneaxisconfig/:id',
  updateBoneAxisConfig
);
module.exports = calibrationPageOptionsRouter;
