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
  const armatureData = await db.Armature.findOne({
    attributes: ['name'],
    where: { isActive: true },
    include: [
      {
        model: db.Bone,
        attributes: ['bodyBoneName', 'armatureBoneName'],
        include: [
          {
            model: db.CustomAxis,
            attributes: ['name'],

            through: { attributes: ['axisId', 'customAxisId', 'data'] },
          },
          {
            model: db.Axis,
            attributes: ['name'],

            through: { attributes: ['axisId', 'customAxisId', 'data'] },
          },
        ],
      },
      {
        model: db.BoneAxisConfig,
      },
    ],
  });

  const config = await db.Config.findOne({});
  dataHolder.armatureName = armatureData.name;
  const { Bones } = armatureData;

  Bones.forEach((bone) => {
    console.log({ bone: JSON.stringify(bone) });
    dataHolder[bone.bodyBoneName] = {
      armatureBoneName: bone.armatureBoneName,
    };
    const { CustomAxes, Axes } = bone;
    for (let index = 0; index < CustomAxes.length; index++) {
      const customAxis = CustomAxes[index];
      const axis = Axes[index];
      const customAxisName = customAxis.name;
      const axisName = axis.name;
      dataHolder[bone.bodyBoneName][customAxisName] = axisName;

      const boneJsonData = axis?.BoneAxisConfig?.data
        ? JSON.parse(axis?.BoneAxisConfig?.data)
        : null;
      if (!boneJsonData) {
        continue;
      }
      dataHolder[bone.bodyBoneName].voltSign = boneJsonData.voltSign;
      dataHolder[bone.bodyBoneName].calibrationVolt =
        boneJsonData.calibrationVolt;
    }
  });
  dataHolder.maxVolt = Number(config.maxVolt);
  dataHolder.maxAnlge = Number(config.maxAnlge);
};

// custom_x_axis_local: 1
// custom_z_axis_local: 2
// custom_y_axis_local: 3;
// ===============

// x:1
// y:2
// z:3;
// =============
// LeftUpLeg:3
// LeftLeg:4
// LeftForeArm:7
// LeftArm:8
// RightUpLeg:11
// RightLeg: 12
// RightForeArm:15
// RightArm: 16

populateConfigDataHolder().then(() => console.log({ dataHolder }));
module.exports = {
  dataHolder,
  populateConfigDataHolder,
};
