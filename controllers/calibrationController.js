const db = require('../db/index');

// Create an instance of EventEmitter
const eventEmitter = require('../EventEmitter.js');

const calibrateAngels = (req, res) => {
  // Emit the event
  eventEmitter.emit('calibrateAngels');
  res.status(200).json({});
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
  res.status(200).json({});
};

const getCalibratedCustomAxes = (req, res) => {
  const customXAxisName = 'custom_x_axis_local';
  const customZAxisName = 'custom_z_axis_local';

  const customXAxisMappings = db.get(customXAxisName);
  const customZAxisMappings = db.get(customZAxisName);
  const bonesNames = Object.keys(customXAxisMappings);

  const calibratedCustomAxes = {};
  for (const boneName of bonesNames) {
    const localBoneAxisForCustomXAxis = customXAxisMappings[boneName];
    const localBoneAxisForCustomZAxis = customZAxisMappings[boneName];

    calibratedCustomAxes[boneName] = {
      [customXAxisName]: localBoneAxisForCustomXAxis,
      [customZAxisName]: localBoneAxisForCustomZAxis,
    };
  }
  res.status(200).json(calibratedCustomAxes);
};

module.exports = {
  getCalibratedVoltSign,
  calibrateVoltSign,
  calibrateAngels,
  calibrateCustomAxis,
  getCalibratedCustomAxes,
};
