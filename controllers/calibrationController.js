const db = require('../db/index');
const EventEmitter = require('events');

// Create an instance of EventEmitter
const eventEmitter = new EventEmitter();

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

const calibrateCustomAxis = (req, res) => {
  const { boneName, customAxis, localAxis } = req.body;
  const customAxisMapping = db.get(customAxis);
  customAxisMapping[boneName] = localAxis;
  db.set(customAxis, customAxisMapping);
  eventEmitter.emit('calibrateCustomAxis');
  res.status.json({});
};

module.exports = {
  calibrateVoltSign,
  calibrateAngels,
  calibrateCustomAxis,
};
