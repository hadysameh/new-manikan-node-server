'use strict';
const path = require('path');
const { SerialPort, ReadlineParser } = require('serialport');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const calibrationRouter = require('./routes/calibrationRouter.js');
const db = require('./db/index');
const eventEmitter = require('./EventEmitter.js');

const app = express();
const server = http.createServer(app);
const io = new socketIo.Server(server, {
  cors: {
    origin: 'http://localhost:5173', // React app's  URL
    methods: ['GET', 'POST'],
  },
});

const leftParser = new ReadlineParser();
const rightParser = new ReadlineParser();

const LEFT_PORT = 10;
const RIGHT_PORT = 9;
const MAX_VOLT = 4.75;
const MAX_ANGLE = 275;

const getLimbsPythonCodes = () => {
  const getLimbPythonCode = (customAxesCode) => {
    return `
my_dict = {
# Add your key-value pairs here
}
arm_bone_radian_angles = {  }
arm_bone_radian_angles['Y'] = math.radians( arm_bone_degree_angles['Y'] )
arm_bone_radian_angles['X'] = math.radians( arm_bone_degree_angles['X'])
arm_bone_radian_angles['Z'] = math.radians( arm_bone_degree_angles['Z'])
 
armature_obj = bpy.data.objects.get(armature_name)

# bpy.ops.object.mode_set(mode='POSE')
 
pose_bone = get_pose_bone(armature_name,bone_name=arm_bone_name)

pose_bone.rotation_mode = "QUATERNION"

pose_bone.rotation_quaternion = (1, 0, 0, 0)
bpy.context.view_layer.update()


local_y_rotation = mathutils.Quaternion(mathutils.Vector((0, 1, 0)), arm_bone_radian_angles['Z'])

bone_x_axis, bone_y_axis, bone_z_axis = get_bone_global_axes(armature_name, arm_bone_name)
# Convert the custom axis to the bone's local space
${customAxesCode}
# Create a quaternion rotation
quat_x_rotation =mathutils.Quaternion(custom_x_axis_local, arm_bone_radian_angles['X'])
quat_z_rotation =mathutils.Quaternion(custom_z_axis_local, arm_bone_radian_angles['Y'])

# Apply the rotation in the bone's local space
pose_bone.rotation_quaternion = quat_z_rotation @ quat_x_rotation  @local_y_rotation
bpy.context.view_layer.update()
    `;
  };
  const customXAxisName = 'custom_x_axis_local';
  const customZAxisName = 'custom_z_axis_local';
  const customXAxisMappings = db.get(customXAxisName);
  const customZAxisMappings = db.get(customZAxisName);
  const bonesNames = Object.keys(customXAxisMappings);
  const pythonCodes = {};
  for (const boneName of bonesNames) {
    const localBoneAxisForCustomXAxis = customXAxisMappings[boneName];
    const localBoneAxisForCustomZAxis = customZAxisMappings[boneName];
    const customAxesCode = `
${customXAxisName} = ${localBoneAxisForCustomXAxis} @ pose_bone.matrix.to_3x3().inverted()
${customZAxisName} = ${localBoneAxisForCustomZAxis} @ pose_bone.matrix.to_3x3().inverted()
    `;
    pythonCodes[boneName + '.code'] = getLimbPythonCode(customAxesCode);
  }
  return pythonCodes;
};

let pythonCodes = getLimbsPythonCodes();
let voltSignsCalibrations = db.get('calibrationSigns');

const dataHolder = {
  voltSignsCalibrations,
  pythonCodes,
  isTocalibrateAngles: false,
};

// Define an event listener
eventEmitter.on('calibrateAngels', () => {
  dataHolder.isTocalibrateAngles = true;
});

eventEmitter.on('calibrateVoltSign', () => {
  dataHolder.voltSignsCalibrations = db.get('calibrationSigns');
});

eventEmitter.on('calibrateCustomAxis', () => {
  dataHolder.pythonCodes = getLimbsPythonCodes();
});

const stoerdCalibrationVolts = db.get('calibrationVolts');

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
  ...stoerdCalibrationVolts,
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
app.use(
  cors({
    origin: ['http://localhost:5173'],
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: '10kb' }));

app.use('/*', (req, res, next) => {
  console.log(req.originalUrl);
  next();
});

app.use('/api', calibrationRouter);

// Serve static files from the dist directory
const distPath = path.join(__dirname, 'react-ui', 'dist');
app.use(express.static(distPath));

app.get('/*', (req, res) => {
  res.sendFile(__dirname + '/react-ui/dist/index.html');
});

app.get('/ui', (req, res) => {
  res.sendFile(path.resolve(__dirname, './ui/index.html'));
});

const mapArduinoData = (arduinoObject) => {
  const dataObject = {
    'armatureName.info': 'Armature.001',
    'leftArmBoneName.info': 'Ctrl_Arm_FK_Left',
    'rightArmBoneName.info': 'Ctrl_Arm_FK_Right',
    'leftUpLegBoneName.info': 'Ctrl_UpLeg_FK_Left',
    'rightUpLegBoneName.info': 'Ctrl_UpLeg_FK_Right',
    'leftForeArmName.info': 'Ctrl_ForeArm_FK_Left',
    'rightForeArmName.info': 'Ctrl_ForeArm_FK_Right',
    'leftLegBoneName.info': 'Ctrl_Leg_FK_Left',
    'rightLegBoneName.info': 'Ctrl_Leg_FK_Right',
  };

  const mappingObject = {
    'mixamorig:LeftArm': dataObject.leftArmBoneName,
    'mixamorig:LeftForeArm': dataObject.rightForeArmName,
    'mixamorig:LeftUpLeg': dataObject.leftUpLegBoneName,
    'mixamorig:LeftLeg': dataObject.leftLegBoneName,
    'mixamorig:RightArm': dataObject.rightArmBoneName,
    'mixamorig:RightForeArm': dataObject.rightForeArmName,
    'mixamorig:RightUpLeg': dataObject.rightUpLegBoneName,
    'mixamorig:RightLeg': dataObject.rightLegBoneName,
  };

  const mappedData = { ...dataObject };

  for (const boneNameAndAxis in arduinoObject) {
    const [boneName, axis] = boneNameAndAxis.split('.');
    const mappedBoneName = mappingObject[boneName];
    mappedData[mappedBoneName + '.' + axis] = arduinoObject[boneNameAndAxis];
  }
  return mappedData;
};

const recievedData = [];
/**
 *
 * @param {any} data
 * @param {string} sideName
 */
const handleArduinoData = (data, sideName) => {
  let isValidJsonData = false;
  try {
    JSON.parse(data);
    isValidJsonData = true;
  } catch (error) {}

  if (!isValidJsonData) {
    return;
  }
  try {
    let parsedData = JSON.parse(data);
    let bonesVolts = {};
    const leftBonesVolts = {
      'mixamorig:LeftLeg.X': parsedData[0],
      'mixamorig:LeftUpLeg.Z': parsedData[1],
      'mixamorig:LeftUpLeg.Y': parsedData[2],
      'mixamorig:LeftUpLeg.X': parsedData[3],
      'mixamorig:LeftArm.X': parsedData[4],
      'mixamorig:LeftArm.Y': parsedData[5],
      'mixamorig:LeftArm.Z': parsedData[6],
      'mixamorig:LeftForeArm.Z': parsedData[7],
    };
    const rightBonesVolts = {
      'mixamorig:RightLeg.X': parsedData[0],
      'mixamorig:RightUpLeg.Z': parsedData[1],
      'mixamorig:RightUpLeg.Y': parsedData[2],
      'mixamorig:RightUpLeg.X': parsedData[3],
      'mixamorig:RightArm.X': parsedData[4],
      'mixamorig:RightArm.Y': parsedData[5],
      'mixamorig:RightArm.Z': parsedData[6],
      'mixamorig:RightForeArm.Z': parsedData[7],
    };

    if (sideName == 'left') {
      bonesVolts = { ...leftBonesVolts };
    } else if (sideName == 'right') {
      bonesVolts = { ...rightBonesVolts };
    }
    if (dataHolder.isTocalibrateAngles) {
      calibrationVolts = { ...calibrationVolts, ...bonesVolts };
      storeCalibrationData();
    }
    const calibratedBonesVolts = calibrateBonesVoltages(bonesVolts);
    let bonesAngles = getBonesAngles(calibratedBonesVolts);
    const mappedBonesData = mapArduinoData(bonesAngles);
    bonesAngles = {
      ...bonesAngles,
      ...dataHolder.pythonCodes,
      ...mappedBonesData,
    };
    // console.log({ bonesAngles });
    io.emit('arduinoData', bonesAngles);
  } catch (ok) {}
};

function storeCalibrationData() {
  setTimeout(() => {
    dataHolder.isTocalibrateAngles = false;
    db.set('calibrationVolts', calibrationVolts);
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
