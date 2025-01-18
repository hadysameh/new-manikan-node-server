const express = require('express');
const {
  calibrateAngels,
  calibrateCustomAxis,
  calibrateVoltSign,
  getCalibratedVoltSign,
  getCalibratedCustomAxes,
} = require('../controllers/calibrationController');
const calibrationRouter = express.Router();
calibrationRouter.post('/calibratevoltsign', calibrateVoltSign);
calibrationRouter.get('/getcalibratevoltsign', getCalibratedVoltSign);
calibrationRouter.post('/calibrateangels', calibrateAngels);
calibrationRouter.post('/calibratecustomaxis', calibrateCustomAxis);
calibrationRouter.get('/getcalibratecustomaxis', getCalibratedCustomAxes);

module.exports = calibrationRouter;
