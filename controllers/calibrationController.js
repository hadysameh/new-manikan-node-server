const db = require('../db/index');

// Create an instance of EventEmitter
const eventEmitter = require('../EventEmitter.js');

const calibrateAngels = (req, res) => {
  // Emit the event
  eventEmitter.emit('calibrateAngels');
  res.status.json({});
};

const calibrateVoltSign = (req, res) => {
  const { boneAxisName, voltSign } = req.body;
  const calibratedVoltSigns = db.get('calibrationSigns');
  calibratedVoltSigns[boneAxisName] = voltSign;
  db.set('calibrationSigns', calibratedVoltSigns);
  eventEmitter.emit('calibrateVoltSign');
  res.status(200).json({});
};

const getCalibratedVoltSign = (req, res) => {
  const calibratedVoltSigns = db.get('calibrationSigns');
  res.status(200).json(calibratedVoltSigns);
};

const calibrateCustomAxis = (req, res) => {
  const { boneName, customAxis, localAxis } = req.body;
  const customAxisMapping = db.get(customAxis);
  customAxisMapping[boneName] = localAxis;
  db.set(customAxis, customAxisMapping);
  eventEmitter.emit('calibrateCustomAxis');
  res.status.json({});
};

module.exports = {
  getCalibratedVoltSign,
  calibrateVoltSign,
  calibrateAngels,
  calibrateCustomAxis,
};
