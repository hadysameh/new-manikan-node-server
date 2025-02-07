'use strict';
const path = require('path');
const { SerialPort, ReadlineParser } = require('serialport');
const { dataHolder, populateConfigDataHolder } = require('./configDataHolder');

const LEFT_PORT = 10;
const RIGHT_PORT = 9;

const leftParser = new ReadlineParser();
const rightParser = new ReadlineParser();

function calibrateBonesVoltages(bonesNamesWithAxis) {
  const calibratedVoltages = {};
  const { bonesAxesVoltsSigns, calibrationVolts } = dataHolder;

  for (const boneName in bonesNamesWithAxis) {
    const boneVolt = bonesNamesWithAxis[boneName];
    calibratedVoltages[boneName] =
      bonesAxesVoltsSigns[boneName] * (boneVolt - calibrationVolts[boneName]);
  }
  return calibratedVoltages;
}

function getBonesAngles(calibratedBonesVolts) {
  const { maxVolt, maxAnlge } = dataHolder;
  const bonesAngles = {};
  for (const boneName in calibratedBonesVolts) {
    const boneVolt = calibratedBonesVolts[boneName];
    bonesAngles[boneName] = Math.ceil(
      boneVolt / ((1023 * maxVolt) / 5 / maxAnlge)
    );
  }
  return bonesAngles;
}
const mapBonesAndAxesNames = (bonesAngles) => {
  const { bonesAxesNamesMappings } = dataHolder;
  const mappedData = {};
  for (const originalBoneNameAndAxis in bonesAngles) {
    const angle = bonesAngles[originalBoneNameAndAxis];
    mappedData[bonesAxesNamesMappings[originalBoneNameAndAxis]] = angle;
  }
  return mappedData;
};

/**
 *
 * @param {any} data
 * @param {string} sideName
 */
const handleArduinoData = (data, sideName) => {
  try {
    if (!dataHolder.initialized) {
      return;
    }

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

    const calibratedBonesVolts = calibrateBonesVoltages(recievedBonesVolts);
    let bonesAngles = getBonesAngles(calibratedBonesVolts);
    const mappedBoneAndAxesNames = mapBonesAndAxesNames(bonesAngles);
    bonesAngles = {
      ...mappedBoneAndAxesNames,
      // ...dataHolder.pythonCodes,
      armatureName: dataHolder.armatureName,
    };
    console.log(bonesAngles);
    if (dataHolder.isTocalibrateAngles) {
      calibrationVolts = { ...calibrationVolts, ...recievedBonesVolts };
      storeCalibrationData();
    }
    global.io.emit('arduinoData', bonesAngles);
  } catch (ok) {}
};

const emitArduinoDataToClients = () => {
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
  } catch (error) {
    throw error;
  }
};

module.exports = emitArduinoDataToClients;
