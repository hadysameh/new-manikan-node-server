const db = require('./models');

const dataHolder = {
  armatureName: '',

  LeftUpLeg: {},
  LeftLeg: {},
  LeftForeArm: {},
  LeftArm: {},

  RightUpLeg: {},
  RightLeg: {},
  RightForeArm: {},
  RightArm: {},
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
    const { dataValues: boneDataValues } = row.Bone;
    return {
      armatureName: row.Bone.Armature.name,
      armatureBoneNameWithAxis:
        dataValues.armatureBoneName + '.' + dataValues.axisName,
      bodyBoneNameWithAxis: dataValues.bodyBoneName + '.' + dataValues.axisName,
      calibrationVolt: JSON.parse(dataValues.data).calibrationVolt,
      voltSign: JSON.parse(dataValues.data).voltSign,
    };
  });
  console.log({
    mappedResult,
    // result,
  });
  const config = await db.Config.findOne({});
  dataHolder.maxVolt = Number(config.maxVolt);
  dataHolder.maxAnlge = Number(config.maxAnlge);
};

populateConfigDataHolder().then(() => console.log({ dataHolder }));
module.exports = {
  dataHolder,
  populateConfigDataHolder,
};
