const { Op } = require('sequelize');
const db = require('./models');
const { groupBy } = require('lodash');
const fs = require('fs');
let dataHolder = {
  armatureName: '',
  armatureId: null,
  threeAxesLimbBones: ['LeftUpLeg', 'RightUpLeg', 'LeftArm', 'RightArm'],
  singleAxisLimbBones: ['LeftForeArm', 'RightForeArm', 'LeftLeg', 'RightLeg'],
  axes: ['X', 'Y', 'Z'],
  initialized: false,
};

const populateConfigDataHolder = async () => {
  dataHolder.initialized = false;
  const config = await db.Config.findOne({});

  const bones = await db.Bone.findAll({
    include: [
      {
        model: db.Armature,
        attributes: ['name'],

        where: {
          id: config.activeArmatureId,
        },
      },
    ],
  });

  dataHolder.armatureName = bones[0].Armature.name;
  dataHolder.maxVolt = Number(config.maxVolt);
  dataHolder.maxAnlge = Number(config.maxAnlge);
  const mappedBones = groupBy(bones, 'boneName');
};

populateConfigDataHolder();

module.exports = {
  dataHolder,
  populateConfigDataHolder,
};
