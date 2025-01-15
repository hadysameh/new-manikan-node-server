const express = require('express');
const {
  calibrateAngels,
  calibrateCustomAxis,
  calibrateVoltSign,
} = require('../controllers/calibrationController');
const calibrationRouter = express.Router();
calibrationRouter.post('/calibrateVoltSign', calibrateVoltSign);
calibrationRouter.post('/calibrateAngels ', calibrateAngels);
calibrationRouter.post('/calibrateCustomAxis', calibrateCustomAxis);

module.exports = calibrationRouter;
