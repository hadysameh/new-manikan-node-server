'use strict';
const path = require('path');
const { SerialPort, ReadlineParser } = require('serialport');
const { dataHolder, populateConfigDataHolder } = require('./configDataHolder');

const LEFT_PORT = 10;
const RIGHT_PORT = 9;

const leftParser = new ReadlineParser();
const rightParser = new ReadlineParser();

let codesToEmit = {};
let voltsToEmit = {};
let bonesAnglesToEmit = {};

setInterval(() => {
  // console.log({ codesToEmit });
  global.io.emit('arduinoData', codesToEmit);
  global.io.emit('volts', voltsToEmit);
  global.io.emit('angles', bonesAnglesToEmit);
}, 500);

const getBonesCodes = (calibratedBonesAngles) => {};

function calibrateBonesVoltages(bonesNamesWithAxis) {
  const calibratedVoltages = {};
  const { bonesData } = dataHolder;

  for (const boneNameWithAxis in bonesNamesWithAxis) {
    const [boneName, robotBoneAxis] = boneNameWithAxis.split('.');
    const boneCalibrationData = bonesData[boneName][0];

    const axisCalibrationVolt =
      boneCalibrationData[`${robotBoneAxis}VoltSign`] || 0;
    const axisCalibrationVoltSign =
      boneCalibrationData[`${robotBoneAxis}CalibrationVolt`] || 1;

    const commingBoneVolt = bonesNamesWithAxis[boneNameWithAxis];

    calibratedVoltages[boneNameWithAxis] =
      axisCalibrationVoltSign * (commingBoneVolt - axisCalibrationVolt);
  }
  return calibratedVoltages;
}

function getBonesAngles(calibratedBonesVolts) {
  const { maxVolt, maxAnlge } = dataHolder;
  const calibratedMaxVolt = (1023 * maxVolt) / 5;

  const bonesAngles = {};
  for (const bonesNamesWithAxis in calibratedBonesVolts) {
    const boneVolt = calibratedBonesVolts[bonesNamesWithAxis];
    bonesAngles[bonesNamesWithAxis] = Math.ceil(
      (boneVolt * maxAnlge) / calibratedMaxVolt
    );
  }
  return bonesAngles;
}

/**
 *
 * @param {any} data
 * @param {string} sideName
 */
const handleArduinoData = (data, sideName) => {
  let parsedData = null;

  try {
    parsedData = JSON.parse(data);
    // console.log(parsedData);
  } catch (error) {
    // throw error;
  }
  try {
    if (!dataHolder.initialized || !parsedData) {
      return;
    }
    // console.log({ data });
    let recievedBonesVolts = {};
    const leftBonesVolts = {
      'Ctrl_Leg_FK_Left.A': parsedData[0],
      'Ctrl_UpLeg_FK_Left.B': parsedData[1],
      'Ctrl_UpLeg_FK_Left.C': parsedData[2],
      'Ctrl_UpLeg_FK_Left.A': parsedData[3],
      'Ctrl_Arm_FK_Left.A': parsedData[4],
      'Ctrl_Arm_FK_Left.C': parsedData[5],
      'Ctrl_Arm_FK_Left.B': parsedData[6],
      'Ctrl_ForeArm_FK_Left.C': parsedData[7],
    };

    const rightBonesVolts = {
      'Ctrl_Leg_FK_Right.A': parsedData[0],
      'Ctrl_UpLeg_FK_Right.B': parsedData[1],
      'Ctrl_UpLeg_FK_Right.C': parsedData[2],
      'Ctrl_UpLeg_FK_Right.A': parsedData[3],
      'Ctrl_Arm_FK_Right.A': parsedData[4],
      'Ctrl_Arm_FK_Right.C': parsedData[5],
      'Ctrl_Arm_FK_Right.B': parsedData[6],
      'Ctrl_ForeArm_FK_Right.C': parsedData[7],
    };

    if (sideName == 'left') {
      recievedBonesVolts = { ...leftBonesVolts };
      Object.assign(voltsToEmit, leftBonesVolts);
    } else if (sideName == 'right') {
      Object.assign(voltsToEmit, rightBonesVolts);
      recievedBonesVolts = { ...rightBonesVolts };
    }

    const calibratedBonesAxesVolts = calibrateBonesVoltages(recievedBonesVolts);
    let bonesAxesAngles = getBonesAngles(calibratedBonesAxesVolts);

    const codesForThreeAxesBones = getBonesCodes(bonesAxesAngles);
    // const codesForOneAxisBones = getCodesForOneAxisBones(bonesAxesAngles);

    // const newCodesToEmit = {
    //   ...codesForThreeAxesBones,
    //   ...codesForOneAxisBones,
    // };

    // Object.assign(codesToEmit, newCodesToEmit);

    // Object.assign(bonesAnglesToEmit, bonesAxesAngles);
  } catch (ok) {
    throw ok;
  }
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
