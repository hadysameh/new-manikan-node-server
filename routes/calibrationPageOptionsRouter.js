const express = require('express');
const {
  getCalibrationPageOptions,
  selectAndGetArmatureData,
} = require('../controllers/calibrationPageOptionsController');

const calibrationPageOptionsRouter = express.Router();

calibrationPageOptionsRouter.get('/', getCalibrationPageOptions);
calibrationPageOptionsRouter.get(
  '/selectandgetarmaturedata/:id',
  selectAndGetArmatureData
);

module.exports = calibrationPageOptionsRouter;
