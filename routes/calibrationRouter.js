const express = require('express');
const {
  calibrateAngels,
  calibrateCustomAxis,
  calibrateVoltSign,
  getCalibratedVoltSign,
} = require('../controllers/calibrationController');
const calibrationRouter = express.Router();
calibrationRouter.post('/calibratevoltsign', calibrateVoltSign);
calibrationRouter.get('/getcalibratevoltsign', getCalibratedVoltSign);
calibrationRouter.post('/calibrateangels ', calibrateAngels);
calibrationRouter.post('/calibratecustomaxis', calibrateCustomAxis);

module.exports = calibrationRouter;
