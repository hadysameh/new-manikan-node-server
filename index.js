const path = require('path');
const { SerialPort, ReadlineParser } = require('serialport');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const parser = new ReadlineParser();

let isTocalibrate = false;

const allowedVoltError = 20;

let calibrationVolts = {
  'mixamorig:LeftForeArm.Z': -1012,
  'mixamorig:LeftArm.Y': -470,
  'mixamorig:LeftArm.X': 1023,
  'mixamorig:LeftArm.Z': -335,
  'mixamorig:RightForeArm.Z': -410,
  'mixamorig:RightArm.Y': -411,
  'mixamorig:RightArm.X': -202,
  'mixamorig:RightArm.Z': -713,
};

let previousArduinoData = {
  'mixamorig:LeftArm.Z': 0,
  'mixamorig:LeftArm.X': 0,
  'mixamorig:LeftArm.Y': 0,
  'mixamorig:LeftForeArm.Z': 0,
  'mixamorig:RightArm.Z': 0,
  'mixamorig:RightArm.X': 0,
  'mixamorig:RightArm.Y': 0,
  'mixamorig:RightForeArm.Z': 0,
};

function roundDownToStep(number, step = 11) {
  return Math.floor(number / step) * step;
}

function correctBoneVoltError(boneName, newBoneVolt) {
  const previousBoneVolt = previousArduinoData[boneName];

  const voltDiff = Math.abs(previousBoneVolt - newBoneVolt);

  let correctedBoneVolt = 0;
  const isToUseNewBoneVolt = voltDiff > allowedVoltError;

  if (isToUseNewBoneVolt) {
    correctedBoneVolt = newBoneVolt;
  } else {
    correctedBoneVolt = previousBoneVolt;
  }

  const calibratedBoneVolt = correctedBoneVolt - calibrationVolts[boneName];

  return calibratedBoneVolt;
}

app.post('/calibrate', (req, res) => {
  isTocalibrate = true;
  res.status(201).json({});
});

app.get('/ui', (req, res) => {
  res.sendFile(path.resolve(__dirname, './ui/index.html'));
});

const recievedData = [];
const handleArduinoData = (data) => {
  try {
    let parsedData = JSON.parse(data);

    parsedData = parsedData.map((volt) => -1 * volt);
    parsedData[2] = -1 * parsedData[2];

    const correctedBoneVoltages = {
      'mixamorig:LeftForeArm.Z': correctBoneVoltError(
        'mixamorig:LeftForeArm.Z',
        parsedData[0]
      ),

      'mixamorig:LeftArm.Y': correctBoneVoltError(
        'mixamorig:LeftArm.Y',
        parsedData[1]
      ),

      'mixamorig:LeftArm.X': correctBoneVoltError(
        'mixamorig:LeftArm.X',
        parsedData[2]
      ),
      'mixamorig:LeftArm.Z': correctBoneVoltError(
        'mixamorig:LeftArm.Z',
        parsedData[3]
      ),

      'mixamorig:RightForeArm.Z': correctBoneVoltError(
        'mixamorig:RightForeArm.Z',
        parsedData[7]
      ),
      'mixamorig:RightArm.Y': correctBoneVoltError(
        'mixamorig:RightArm.Y',
        parsedData[6]
      ),
      'mixamorig:RightArm.X': correctBoneVoltError(
        'mixamorig:RightArm.X',
        parsedData[5]
      ),

      'mixamorig:RightArm.Z': correctBoneVoltError(
        'mixamorig:RightArm.Z',
        parsedData[4]
      ),
    };

    const calibratedBonesAngles = {
      'mixamorig:LeftForeArm.Z': Math.floor(
        correctedBoneVoltages['mixamorig:LeftForeArm.Z'] / 3.72
      ),

      'mixamorig:LeftArm.Y': Math.floor(
        correctedBoneVoltages['mixamorig:LeftArm.Y'] / 3.72
      ),

      'mixamorig:LeftArm.X': Math.floor(
        correctedBoneVoltages['mixamorig:LeftArm.X'] / 3.72
      ),

      'mixamorig:LeftArm.Z': Math.floor(
        correctedBoneVoltages['mixamorig:LeftArm.Z'] / 3.72
      ),

      'mixamorig:RightForeArm.Z': Math.floor(
        correctedBoneVoltages['mixamorig:RightForeArm.Z'] / 3.72
      ),

      'mixamorig:RightArm.Y': Math.floor(
        correctedBoneVoltages['mixamorig:RightArm.Y'] / 3.72
      ),

      'mixamorig:RightArm.X': Math.floor(
        correctedBoneVoltages['mixamorig:RightArm.X'] / 3.72
      ),

      'mixamorig:RightArm.Z': Math.floor(
        correctedBoneVoltages['mixamorig:RightArm.Z'] / 3.72
      ),
    };

    if (isTocalibrate) {
      calibrationVolts = { ...correctedBoneVoltages };
      console.log({ calibrationVolts });
      isTocalibrate = false;
    }

    console.log({ calibratedBonesAngles });

    recievedData.push(parsedData);
    previousArduinoData = { ...correctedBoneVoltages };

    io.emit('arduinoData', calibratedBonesAngles);
  } catch (ok) {}
};

try {
  const portName = 'COM6';
  const port = new SerialPort({
    path: portName,
    baudRate: 9600,
    autoOpen: false, // Do not auto-open to handle errors properly
  });

  // Handle connection errors
  port.open((err) => {
    if (err) {
      console.warn(`Failed to open port ${portName}:`, err.message);
      return;
    }
    console.log(`Port ${portName} opened successfully.`);
  });

  // Handle general errors
  port.on('error', (err) => {
    console.error(`Serial port error: ${err.message}`);
  });
  // const port = new SerialPort({ path: 'COM6', baudRate: 9600 });

  port.pipe(parser);
  parser.on('data', handleArduinoData);
  port.write('ROBOT PLEASE RESPOND\n');
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
