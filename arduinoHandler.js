'use strict';
const path = require('path');
const { SerialPort, ReadlineParser } = require('serialport');
const dataHolder = require('./dataHolder');

const LEFT_PORT = 10;
const RIGHT_PORT = 9;
const MAX_VOLT = 4.75;
const MAX_ANGLE = 275;
const recievedData = [];

let recievedBonesVolts = {};

const stoerdCalibrationVolts = db.get('calibrationVolts');

let calibrationVolts = {
  'LeftUpLeg.X': 0,
  'LeftUpLeg.Y': 0,
  'LeftUpLeg.Z': 0,
  'LeftLeg.Z': 0,
  'LeftForeArm.Z': 0,
  'LeftArm.Y': 0,
  'LeftArm.X': 0,
  'LeftArm.Z': 0,
  'RightUpLeg.X': 0,
  'RightUpLeg.Y': 0,
  'RightUpLeg.Z': 0,
  'RightLeg.Z': 0,
  'RightForeArm.Z': 0,
  'RightArm.Y': 0,
  'RightArm.X': 0,
  'RightArm.Z': 0,
};

function calibrateBonesVoltages(voltagesObj) {
  const calibratedVoltages = {};
  const { voltSignsCalibrations } = dataHolder;

  for (const boneName in voltagesObj) {
    const boneVolt = voltagesObj[boneName];
    calibratedVoltages[boneName] =
      voltSignsCalibrations[boneName] * (boneVolt - calibrationVolts[boneName]);
  }
  return calibratedVoltages;
}

/**
 *
 * @param {any} data
 * @param {string} sideName
 */
const handleArduinoData = (data, sideName) => {
  try {
    let parsedData = JSON.parse(data);
    let recievedBonesVolts = {};
    const leftBonesVolts = {
      'LeftLeg.X': parsedData[0],
      'LeftUpLeg.Z': parsedData[1],
      'LeftUpLeg.Y': parsedData[2],
      'LeftUpLeg.X': parsedData[3],
      'LeftArm.X': parsedData[4],
      'LeftArm.Y': parsedData[5],
      'LeftArm.Z': parsedData[6],
      'LeftForeArm.Z': parsedData[7],
    };

    const rightBonesVolts = {
      'RightLeg.X': parsedData[0],
      'RightUpLeg.Z': parsedData[1],
      'RightUpLeg.Y': parsedData[2],
      'RightUpLeg.X': parsedData[3],
      'RightArm.X': parsedData[4],
      'RightArm.Y': parsedData[5],
      'RightArm.Z': parsedData[6],
      'RightForeArm.Z': parsedData[7],
    };

    if (sideName == 'left') {
      recievedBonesVolts = { ...leftBonesVolts };
    } else if (sideName == 'right') {
      recievedBonesVolts = { ...rightBonesVolts };
    }
    if (dataHolder.isTocalibrateAngles) {
      calibrationVolts = { ...calibrationVolts, ...recievedBonesVolts };
      storeCalibrationData();
    }
    const calibratedBonesVolts = calibrateBonesVoltages(recievedBonesVolts);
    let bonesAngles = getBonesAngles(calibratedBonesVolts);
    bonesAngles = {
      ...bonesAngles,
      ...dataHolder.pythonCodes,
      armatureName: '',
    };
    global.io.emit('arduinoData', bonesAngles);
  } catch (ok) {}
};

try {
  const leftPortName = 'COM' + LEFT_PORT;
  const rightPortName = 'COM' + RIGHT_PORT;

  const leftPort = new SerialPort({
    path: leftPortName,
    baudRate: 9600,
    autoOpen: false, // Do not auto-open to handle errors properly
  });

  const rightPort = new SerialPort({
    path: rightPortName,
    baudRate: 9600,
    autoOpen: false, // Do not auto-open to handle errors properly
  });
  // Handle connection errors
  leftPort.open((err) => {
    if (err) {
      console.warn(`Failed to open port ${leftPortName}:`, err.message);
      return;
    }
    console.log(`Port ${leftPortName} opened successfully.`);
  });

  rightPort.open((err) => {
    if (err) {
      console.warn(`Failed to open port ${leftPortName}:`, err.message);
      return;
    }
    console.log(`Port ${rightPortName} opened successfully.`);
  });

  // Handle general errors
  leftPort.on('error', (err) => {
    console.error(`Serial port error: ${err.message}`);
  });

  rightPort.on('error', (err) => {
    console.error(`Serial port error: ${err.message}`);
  });

  leftPort.pipe(leftParser);
  rightPort.pipe(rightParser);

  leftParser.on('data', (data) => handleArduinoData(data, 'left'));
  rightParser.on('data', (data) => handleArduinoData(data, 'right'));
} catch (error) {}
