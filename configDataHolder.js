const db = require('./models');
const { groupBy } = require('lodash');
const fs = require('fs');
let dataHolder = {
  armatureName: '',
  threeAxesLimbBones: ['LeftUpLeg', 'RightUpLeg', 'LeftArm', 'RightArm'],
  singleAxisLimbBones: ['LeftForeArm', 'RightForeArm', 'LeftLeg', 'RightLeg'],
  axes: ['X', 'Y', 'Z'],
  initialized: false,
};

const populateConfigDataHolder = async () => {
  dataHolder.initialized = false;
  const result = await db.BoneAxisConfig.findAll({
    include: [
      {
        model: db.Bone,
        include: [
          {
            model: db.Armature,
            attributes: ['name'],

            where: { isActive: true },
          },
        ],
      },
      {
        model: db.Axis,
        attributes: [],
      },
      {
        model: db.CustomAxis,
        attributes: [],
      },
    ],
    attributes: [
      'id', // Include Post fields you want
      'data',
      [db.sequelize.col(`Bone.bodyBoneName`), 'bodyBoneName'],
      [db.sequelize.col('Bone.armatureBoneName'), 'armatureBoneName'],
      [db.sequelize.col('Axis.name'), 'axisName'],
      [db.sequelize.col('CustomAxis.name'), 'customAxisName'],
    ],
  });

  const mappedResult = result.map((row) => {
    const { dataValues } = row;
    return {
      // armatureName: row.Bone.Armature.name,
      armatureBoneName: dataValues.armatureBoneName,
      bodyBoneName: dataValues.bodyBoneName,
      axisName: dataValues.axisName,
      customAxisName: dataValues.customAxisName,
      calibrationVolt: JSON.parse(dataValues.data).calibrationVolt,
      voltSign: JSON.parse(dataValues.data).voltSign,
    };
  });

  const bonesGrouppedByName = groupBy(mappedResult, 'bodyBoneName');
  console.log({ bonesGrouppedByName });
  const config = await db.Config.findOne({});

  dataHolder.armatureName = result[0].Bone.Armature.name;
  dataHolder.maxVolt = Number(config.maxVolt);
  dataHolder.maxAnlge = Number(config.maxAnlge);
  // dataHolder = { ...dataHolder, ...boneGrouppedResults };

  let calibrationVolts = {};
  let bonesAxesVoltsSigns = {};
  let bonesCustomAxesMappings = {};
  let bonesAxesNamesMappings = {};
  let bonesNamesMappings = {};
  const localBoneAxesMapping = {
    X: 'bone_x_axis',
    Y: 'bone_y_axis',
    Z: 'bone_z_axis',
  };
  for (const bodyBoneName in bonesGrouppedByName) {
    const isBodyBoneName = Array.isArray(bonesGrouppedByName[bodyBoneName]);
    if (!isBodyBoneName) continue;
    bonesNamesMappings[bodyBoneName] =
      bonesGrouppedByName[bodyBoneName][0].armatureBoneName;
    const boneAxesData = bonesGrouppedByName[bodyBoneName];
    const boneAxesCalibrationVolts = {};
    const boneAxesVoltsSigns = {};
    const boneCustomAxesMappings = {};

    boneAxesData.forEach((boneAxisData) => {
      const bodyBoneNameWithAxis = `${boneAxisData.bodyBoneName}.${boneAxisData.axisName}`;
      const armatureBoneNameWithAxis = `${boneAxisData.armatureBoneName}.${boneAxisData.axisName}`;
      bonesAxesNamesMappings[bodyBoneNameWithAxis] = armatureBoneNameWithAxis;
      boneAxesCalibrationVolts[bodyBoneNameWithAxis] =
        boneAxisData.calibrationVolt;

      boneAxesVoltsSigns[bodyBoneNameWithAxis] = boneAxisData.voltSign;

      calibrationVolts = { ...calibrationVolts, ...boneAxesCalibrationVolts };
      bonesAxesVoltsSigns = { ...bonesAxesVoltsSigns, ...boneAxesVoltsSigns };
      const { customAxisName } = boneAxisData;

      if (customAxisName) {
        // boneCustomAxesMappings[bodyBoneNameWithAxis] = customAxisName;
        boneCustomAxesMappings[
          `${boneAxisData.bodyBoneName}.${customAxisName}`
        ] = localBoneAxesMapping[boneAxisData.axisName];
      }
      bonesCustomAxesMappings = {
        ...bonesCustomAxesMappings,
        ...boneCustomAxesMappings,
      };
    });
  }

  dataHolder.calibrationVolts = calibrationVolts;
  dataHolder.bonesAxesVoltsSigns = bonesAxesVoltsSigns;
  dataHolder.bonesCustomAxesMappings = bonesCustomAxesMappings;
  dataHolder.bonesAxesNamesMappings = bonesAxesNamesMappings;
  dataHolder.bonesNamesMappings = bonesNamesMappings;
  dataHolder.initialized = true;
};

populateConfigDataHolder();

module.exports = {
  dataHolder,
  populateConfigDataHolder,
};
