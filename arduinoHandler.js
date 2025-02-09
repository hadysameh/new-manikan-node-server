'use strict';
const path = require('path');
const { SerialPort, ReadlineParser } = require('serialport');
const { dataHolder, populateConfigDataHolder } = require('./configDataHolder');

const LEFT_PORT = 10;
const RIGHT_PORT = 9;

const leftParser = new ReadlineParser();
const rightParser = new ReadlineParser();

const get1AxisBonePythonCode = ({
  armatureName,
  boneName,
  boneAxis,
  angle,
}) => {
  const axesIndices = {
    X: 0,
    Y: 1,
    Z: 2,
  };
  const axisIndex = axesIndices[boneAxis];
  const pythonCode = `
selected_armature = bpy.data.objects['${armatureName}']
selected_bone_in_pose_mode = selected_armature.pose.bones['${boneName}']

selected_bone_in_pose_mode.rotation_mode = 'XYZ'
selected_bone_in_pose_mode.rotation_euler[${axisIndex}] = math.radians(${angle});
    `;
  return pythonCode;
};

const get3AxisBonePythonCode = ({
  armatureName,
  boneName,
  customAxesCode,
  xAxisAngle,
  yAxisAngle,
  zAxisAngle,
}) => {
  return `
arm_bone_radian_angles = {  } 
arm_bone_radian_angles['X'] = math.radians(${xAxisAngle})
arm_bone_radian_angles['Z'] = math.radians(${zAxisAngle})
arm_bone_radian_angles['Y'] = math.radians(${yAxisAngle})

selected_armature = bpy.data.objects["${armatureName}"]

# bpy.ops.object.mode_set(mode='POSE')
bone_name="${boneName}"
if bone_name in selected_armature.pose.bones:

  pose_bone = get_pose_bone("${armatureName}",bone_name="${boneName}")

  pose_bone.rotation_mode = "QUATERNION"

  pose_bone.rotation_quaternion = (1, 0, 0, 0)
  bpy.context.view_layer.update()


  local_y_rotation = mathutils.Quaternion(mathutils.Vector((0, 1, 0)), arm_bone_radian_angles['Z'])

  bone_x_axis, bone_y_axis, bone_z_axis = get_bone_global_axes("${armatureName}", "${boneName}")
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

const getCodesForOneAxisBones = (bonesAngles) => {
  const { singleAxisLimbBones, bonesNamesMappings, armatureName } = dataHolder;

  const bonesCodes = {};

  for (const bodyBoneName of singleAxisLimbBones) {
    const xAxisAngle = bonesAngles[`${bodyBoneName}.X`];
    const yAxisAngle = bonesAngles[`${bodyBoneName}.Y`];
    const zAxisAngle = bonesAngles[`${bodyBoneName}.Z`];
    const armatureBoneName = bonesNamesMappings[bodyBoneName];

    if (xAxisAngle) {
      bonesCodes[`${armatureBoneName}.code`] = get1AxisBonePythonCode({
        angle: xAxisAngle,
        armatureName,
        boneAxis: 'X',
        boneName: armatureBoneName,
      });
    } else if (yAxisAngle) {
      bonesCodes[`${armatureBoneName}.code`] = get1AxisBonePythonCode({
        angle: yAxisAngle,
        armatureName,
        boneAxis: 'Y',
        boneName: armatureBoneName,
      });
    } else if (zAxisAngle) {
      bonesCodes[`${armatureBoneName}.code`] = get1AxisBonePythonCode({
        angle: zAxisAngle,
        armatureName,
        boneAxis: 'Z',
        boneName: armatureBoneName,
      });
    }
  }
  return bonesCodes;
};

const getCodesForThreeAxesBones = (bonesAngles) => {
  const {
    threeAxesLimbBones,
    bonesCustomAxesMappings,
    bonesNamesMappings,
    armatureName,
  } = dataHolder;
  const bonesCodes = {};
  for (const bodyBoneName of threeAxesLimbBones) {
    const xAxisAngle = bonesAngles[`${bodyBoneName}.X`];
    const yAxisAngle = bonesAngles[`${bodyBoneName}.Y`];
    const zAxisAngle = bonesAngles[`${bodyBoneName}.Z`];

    if (!(xAxisAngle && yAxisAngle && zAxisAngle)) {
      continue;
    }

    const customXAxisName = 'custom_x_axis_local';
    const customZAxisName = 'custom_z_axis_local';

    const localBoneAxisForCustomXAxis =
      bonesCustomAxesMappings[`${bodyBoneName}.${customXAxisName}`];

    const localBoneAxisForCustomZAxis =
      bonesCustomAxesMappings[`${bodyBoneName}.${customZAxisName}`];
    if (!(localBoneAxisForCustomXAxis && localBoneAxisForCustomZAxis)) {
      continue;
    }

    const customAxesCode = `
  ${customXAxisName} = ${localBoneAxisForCustomXAxis} @ pose_bone.matrix.to_3x3().inverted()
  ${customZAxisName} = ${localBoneAxisForCustomZAxis} @ pose_bone.matrix.to_3x3().inverted()
    `;
    const armatureBoneName = bonesNamesMappings[bodyBoneName];
    bonesCodes[`${armatureBoneName}.code`] = get3AxisBonePythonCode({
      armatureName,
      boneName: armatureBoneName,
      customAxesCode,
      xAxisAngle,
      yAxisAngle,
      zAxisAngle,
    });
  }
  return bonesCodes;
};

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

/**
 *
 * @param {any} data
 * @param {string} sideName
 */
const handleArduinoData = (data, sideName) => {
  let parsedData;

  try {
    parsedData = JSON.parse(data);
  } catch (error) {
    parsedData = null;
  }

  try {
    if (!dataHolder.initialized || !parsedData) {
      return;
    }
    // console.log({ data });
    let recievedBonesVolts = {};
    const leftBonesVolts = {
      'LeftLeg.X': parsedData[0],
      'LeftUpLeg.Y': parsedData[1],
      'LeftUpLeg.Z': parsedData[2],
      'LeftUpLeg.X': parsedData[3],
      'LeftArm.X': parsedData[4],
      'LeftArm.Z': parsedData[5],
      'LeftArm.Y': parsedData[6],
      'LeftForeArm.Z': parsedData[7],
    };

    const rightBonesVolts = {
      'RightLeg.X': parsedData[0],
      'RightUpLeg.Y': parsedData[1],
      'RightUpLeg.Z': parsedData[2],
      'RightUpLeg.X': parsedData[3],
      'RightArm.X': parsedData[4],
      'RightArm.Z': parsedData[5],
      'RightArm.Y': parsedData[6],
      'RightForeArm.Z': parsedData[7],
    };
    if (sideName == 'left') {
      recievedBonesVolts = { ...leftBonesVolts };
    } else if (sideName == 'right') {
      recievedBonesVolts = { ...rightBonesVolts };
    }

    const calibratedBonesVolts = calibrateBonesVoltages(recievedBonesVolts);
    let bonesAngles = getBonesAngles(calibratedBonesVolts);
    const codesForThreeAxesBones = getCodesForThreeAxesBones(bonesAngles);
    const codesForOneAxisBones = getCodesForOneAxisBones(bonesAngles);

    const codesToEmit = { ...codesForThreeAxesBones, ...codesForOneAxisBones };
    global.io.emit('arduinoData', codesToEmit);
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
