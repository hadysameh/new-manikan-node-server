'use strict';
const path = require('path');
const { SerialPort, ReadlineParser } = require('serialport');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const leftParser = new ReadlineParser();
const rightParser = new ReadlineParser();

let isTocalibrate = false;
const LEFT_PORT = 10;
const RIGHT_PORT = 9;
const MAX_VOLT = 4.75;
const MAX_ANGLE = 275;

const stoerdCalibrationVolts = fs.readFileSync(
  './calibrationData.json',
  'utf-8'
);

let calibrationVolts = {
  'mixamorig:LeftUpLeg.X': 0,
  'mixamorig:LeftUpLeg.Y': 0,
  'mixamorig:LeftUpLeg.Z': 0,
  'mixamorig:LeftLeg.Z': 0,
  'mixamorig:LeftForeArm.Z': 0,
  'mixamorig:LeftArm.Y': 0,
  'mixamorig:LeftArm.X': 0,
  'mixamorig:LeftArm.Z': 0,
  'mixamorig:RightUpLeg.X': 0,
  'mixamorig:RightUpLeg.Y': 0,
  'mixamorig:RightUpLeg.Z': 0,
  'mixamorig:RightLeg.Z': 0,
  'mixamorig:RightForeArm.Z': 0,
  'mixamorig:RightArm.Y': 0,
  'mixamorig:RightArm.X': 0,
  'mixamorig:RightArm.Z': 0,
  ...JSON.parse(stoerdCalibrationVolts),
};

function calibrateBonesVoltages(voltagesObj) {
  const calibratedVoltages = {};
  for (const boneName in voltagesObj) {
    const boneVolt = voltagesObj[boneName];
    calibratedVoltages[boneName] = boneVolt - calibrationVolts[boneName];
  }
  return calibratedVoltages;
}

function getBonesAngles(calibratedBonesVolts) {
  const bonesAngles = {};
  for (const boneName in calibratedBonesVolts) {
    const boneVolt = calibratedBonesVolts[boneName];
    bonesAngles[boneName] = Math.ceil(
      boneVolt / ((1023 * MAX_VOLT) / 5 / MAX_ANGLE)
    );
  }
  return bonesAngles;
}

app.post('/calibrate', (req, res) => {
  isTocalibrate = true;
  res.status(201).json({});
});

app.get('/ui', (req, res) => {
  res.sendFile(path.resolve(__dirname, './ui/index.html'));
});

const recievedData = [];
/**
 *
 * @param {any} data
 * @param {string} sideName
 */
const handleArduinoData = (data, sideName) => {
  try {
    let parsedData = JSON.parse(data);
    let bonesVolts = {};
    const leftBonesVolts = {
      'mixamorig:LeftLeg.X': parsedData[0],
      'mixamorig:LeftUpLeg.Z': parsedData[1],
      'mixamorig:LeftUpLeg.Y': -1 * parsedData[2],
      'mixamorig:LeftUpLeg.X': parsedData[3],
      'mixamorig:LeftArm.Z': -1 * parsedData[4],
      'mixamorig:LeftArm.Y': -1 * parsedData[5],
      'mixamorig:LeftArm.X': parsedData[6],
      'mixamorig:LeftForeArm.Z': -1 * parsedData[7],
    };
    const rightBonesVolts = {
      'mixamorig:RightUpLeg.X': parsedData[3],
      'mixamorig:RightUpLeg.Y': parsedData[2],
      'mixamorig:RightUpLeg.Z': -1 * parsedData[1],
      'mixamorig:RightLeg.X': parsedData[0],
      'mixamorig:RightForeArm.Z': -1 * parsedData[7],
      'mixamorig:RightArm.Z': -1 * parsedData[6],
      'mixamorig:RightArm.Y': -1 * parsedData[5],
      'mixamorig:RightArm.X': parsedData[4],
    };

    if (sideName == 'left') {
      bonesVolts = { ...leftBonesVolts };
    } else if (sideName == 'right') {
      bonesVolts = { ...rightBonesVolts };
    }
    if (isTocalibrate) {
      calibrationVolts = { ...calibrationVolts, ...bonesVolts };
      storeCalibrationData();
    }
    const calibratedBonesVolts = calibrateBonesVoltages(bonesVolts);
    let bonesAngles = getBonesAngles(calibratedBonesVolts);
    const pythonCodes = require('./3AxesPythonCodes.js');
    bonesAngles = { ...bonesAngles, ...pythonCodes };
    // console.log({ bonesAngles });
    io.emit('arduinoData', bonesAngles);
  } catch (ok) {}
};

function storeCalibrationData() {
  setTimeout(() => {
    isTocalibrate = false;
    fs.writeFileSync(
      './calibrationData.json',
      JSON.stringify(calibrationVolts)
    );
  }, 100);
}

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

  leftPort.write('ROBOT PLEASE RESPOND\n');
} catch (error) {}

// Handle client connections
io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

function handleShutdown() {
  fs.writeFileSync('./recievedData.json', JSON.stringify(recievedData));

  server.close(() => {
    fs.writeFileSync('./recievedData.json', JSON.stringify(recievedData));

    console.log('Server closed');
    process.exit(0);
  });
}

process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);
