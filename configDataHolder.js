const db = require('./models');
const { groupBy } = require('lodash');
const fs = require('fs');
let dataHolder = {
  armatureName: '',
};

const populateConfigDataHolder = async () => {
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
      // 'id', // Include Post fields you want
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

  const boneGrouppedResults = groupBy(mappedResult, 'bodyBoneName');

  const config = await db.Config.findOne({});

  dataHolder.armatureName = result[0].Bone.Armature.name;
  dataHolder.maxVolt = Number(config.maxVolt);
  dataHolder.maxAnlge = Number(config.maxAnlge);
  dataHolder = { ...dataHolder, ...boneGrouppedResults };

  let calibrationVolts = {};
  let bonesAxesVoltsSigns = {};
  let bonesCustomAxesMappings = {};

  for (const propName in dataHolder) {
    const isBoneName = Array.isArray(dataHolder[propName]);
    if (!isBoneName) continue;
    const boneAxesData = dataHolder[propName];
    const boneAxesCalibrationVolts = {};
    const boneAxesVoltsSigns = {};
    const boneCustomAxesMappings = {};

    boneAxesData.forEach((boneAxisData) => {
      const bodyBoneNameWithAxis = `${boneAxisData.bodyBoneName}.${boneAxisData.axisName}`;
      boneAxesCalibrationVolts[bodyBoneNameWithAxis] =
        boneAxisData.calibrationVolt;

      boneAxesVoltsSigns[bodyBoneNameWithAxis] = boneAxisData.voltSign;

      calibrationVolts = { ...calibrationVolts, ...boneAxesCalibrationVolts };
      bonesAxesVoltsSigns = { ...bonesAxesVoltsSigns, ...boneAxesVoltsSigns };
      const { customAxisName } = boneAxisData;

      if (customAxisName) {
        boneCustomAxesMappings[bodyBoneNameWithAxis] = customAxisName;
      }
      bonesCustomAxesMappings = {
        ...bonesCustomAxesMappings,
        ...boneCustomAxesMappings,
      };
    });
  }
  dataHolder = {
    ...dataHolder,
    calibrationVolts,
    bonesAxesVoltsSigns,
    bonesCustomAxesMappings,
  };
  fs.writeFileSync('./test.js', JSON.stringify(dataHolder));

  // console.log({
  //   calibrationVolts,
  //   bonesAxesVoltsSigns,
  //   bonesCustomAxesMappings,
  // });
};

populateConfigDataHolder().then(() => console.log({ dataHolder }));

module.exports = {
  dataHolder,
  populateConfigDataHolder,
};
