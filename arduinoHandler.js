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
let lastSentBonesAngles = {};

setInterval(() => {
  // console.log({ codesToEmit });
  global.io.emit('arduinoData', codesToEmit);
  global.io.emit('volts', voltsToEmit);
  global.io.emit('angles', lastSentBonesAngles);
}, 500);

function euclideanDistance(newBoneAnglesMap, oldBoneAnglesMap) {
  const ADiff = Math.pow(
    (newBoneAnglesMap?.A || 0) - (oldBoneAnglesMap?.A || 0),
    2
  );
  const BDiff = Math.pow(
    (newBoneAnglesMap?.B || 0) - (oldBoneAnglesMap?.B || 0),
    2
  );
  const cDiff = Math.pow(
    (newBoneAnglesMap?.C || 0) - (oldBoneAnglesMap?.C || 0),
    2
  );

  return Math.sqrt(ADiff + BDiff + cDiff);
}

/**
 *
 * @param {object} calibratedBonesAngles
 * Example
 * input
 * {'Ctrl_UpLeg_FK_Right.B': 20, 'Ctrl_UpLeg_FK_Right.C': 20, 'Ctrl_UpLeg_FK_Right.A': 20,}
 *
 * output
 * { "Ctrl_UpLeg_FK_Right": {  "B": 20, "C": 20, "A": 20 }}
 *
 * @returns
 */
const getBoneAnglesMap = (calibratedBonesAngles) => {
  const result = {};
  for (const [key, value] of Object.entries(calibratedBonesAngles)) {
    const [prefix, suffix] = key.split('.');
    if (!result[prefix]) {
      result[prefix] = {};
    }
    result[prefix][suffix] = value;
  }
  return result;
};

const getChangedBonesNames = (calibratedBonesAxesAngles) => {
  const changeThershold = 10;
  const newBonesAnglesMap = getBoneAnglesMap(calibratedBonesAxesAngles);
  const oldBonesAnglesMap = getBoneAnglesMap(lastSentBonesAngles);
  const changedBonesAngles = [];

  for (const boneName in newBonesAnglesMap) {
    const oldBoneAxesAngles = oldBonesAnglesMap[boneName];
    const newBoneAxesAngles = newBonesAnglesMap[boneName];
    const incomingChange = euclideanDistance(
      newBoneAxesAngles,
      oldBoneAxesAngles
    );

    if (incomingChange > changeThershold) {
      changedBonesAngles.push(boneName);
    }
  }

  return changedBonesAngles;
};

const getBonePythonCode = (boneName, robotBoneAnglesMap) => {
  const { armatureName } = dataHolder;
  const boneConfig = dataHolder.bonesData[boneName][0];
  const blenderBoneAxesAngles = {
    X: 0,
    Y: 0,
  };

  boneConfig.ALocalAxisMapping
    ? (blenderBoneAxesAngles[boneConfig.ALocalAxisMapping] =
        robotBoneAnglesMap?.A || 0)
    : null;

  boneConfig.BLocalAxisMapping
    ? (blenderBoneAxesAngles[boneConfig.BLocalAxisMapping] =
        robotBoneAnglesMap?.B || 0)
    : null;

  return `
selected_armature = bpy.data.objects["${armatureName}"]
shoulder_bone_in_pose_mode = selected_armature.pose.bones["${boneName}"]
if shoulder_bone_in_pose_mode:
    x = math.radians(${blenderBoneAxesAngles.X})
    y = math.radians(${blenderBoneAxesAngles.Y})
    z = math.radians(0)
    shoulder_bone_in_pose_mode.rotation_mode = "XYZ"  # Enforce gimbal lock
    bpy.context.view_layer.update()

    shoulder_bone_in_pose_mode.rotation_euler = mathutils.Euler((x, y, z), "XYZ")
    bpy.context.view_layer.update()
    #  ============================================================
    modify_y = math.radians(${robotBoneAnglesMap?.C || 0})
    # Convert current rotation to matrix
    bone_matrix = shoulder_bone_in_pose_mode.matrix
    # Create a rotation matrix for local Y axis
    local_y_rotation = mathutils.Matrix.Rotation(
        modify_y, 4, shoulder_bone_in_pose_mode.y_axis
    )
    # Apply new rotation by multiplying the local rotation
    shoulder_bone_in_pose_mode.matrix = local_y_rotation @ bone_matrix
    bpy.context.view_layer.update()
  `;
};

const getBonesCodes = (bonesNamesToGetCodesFor, calibratedBonesAxesAngles) => {
  const calibratedBonesAnglesMap = getBoneAnglesMap(calibratedBonesAxesAngles);
  const bonesCodesMap = {};
  for (const boneName of bonesNamesToGetCodesFor) {
    bonesCodesMap[boneName] = getBonePythonCode(
      boneName,
      calibratedBonesAnglesMap[boneName]
    );
  }
  return bonesCodesMap;
};

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
    let recievedRobotBonesVolts = {};
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
      recievedRobotBonesVolts = { ...leftBonesVolts };
      Object.assign(voltsToEmit, leftBonesVolts);
    } else if (sideName == 'right') {
      Object.assign(voltsToEmit, rightBonesVolts);
      recievedRobotBonesVolts = { ...rightBonesVolts };
    }

    const calibratedRobotBonesAxesVolts = calibrateBonesVoltages(
      recievedRobotBonesVolts
    );
    let calibratedRobotBonesAxesAngles = getBonesAngles(
      calibratedRobotBonesAxesVolts
    );
    const changedBonesNames = getChangedBonesNames(
      calibratedRobotBonesAxesAngles
    );
    Object.assign(lastSentBonesAngles, calibratedRobotBonesAxesAngles);

    const codesToEmit = getBonesCodes(
      changedBonesNames,
      calibratedRobotBonesAxesAngles
    );
    console.log({ codesToEmit });

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
