const express = require('express');
const {
  calibrateAngels,
  calibrateCustomAxis,
  calibrateVoltSign,
} = require('../controllers/calibrationRouter');
const calibrationRouter = express.Router();
calibrationRouter.post('/calibrateVoltSign', calibrateVoltSign);
calibrationRouter.post('/calibrateAngels ', calibrateAngels);
calibrationRouter.post('/calibrateCustomAxis', calibrateCustomAxis);

export default calibrationRouter;
