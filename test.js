const { groupBy } = require('lodash');
const db = require('./models');

db.Bone.findAll({
  include: [
    {
      model: db.Armature,
      attributes: ['name'],

      where: {
        id: 1,
      },
    },
  ],
  // attributes: [[db.sequelize.col(`Armature.name`), 'name']],
}).then((bones) => {
  let mappedBones = bones.map((bone) => bone.dataValues);
  mappedBones = groupBy(mappedBones, 'boneName');
  console.log('mappedBones', mappedBones);
});
