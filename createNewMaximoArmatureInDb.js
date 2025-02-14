const db = require('./models');
const { groupBy } = require('lodash');
const armatureData = {
  name: 'system-test',
};

(async () => {
  const transaction = await db.sequelize.transaction();
  try {
    const createdArmature = await db.Armature.create(armatureData, {
      transaction,
    });

    const createdArmatureId = createdArmature.id;
    // const createdArmatureId = 1;

    let bonesForMaximoArmature = [
      {
        bodyBoneName: 'LeftUpLeg',
        armatureBoneName: 'Ctrl_UpLeg_FK_Left',
        armatureId: createdArmatureId,
      },
      {
        bodyBoneName: 'LeftLeg',
        armatureBoneName: 'Ctrl_Leg_FK_Left',
        armatureId: createdArmatureId,
      },
      {
        bodyBoneName: 'LeftForeArm',
        armatureBoneName: 'Ctrl_ForeArm_FK_Left',
        armatureId: createdArmatureId,
      },
      {
        bodyBoneName: 'LeftArm',
        armatureBoneName: 'Ctrl_Arm_FK_Left',
        armatureId: createdArmatureId,
      },
      {
        bodyBoneName: 'RightUpLeg',
        armatureBoneName: 'Ctrl_UpLeg_FK_Right',
        armatureId: createdArmatureId,
      },
      {
        bodyBoneName: 'RightLeg',
        armatureBoneName: 'Ctrl_Leg_FK_Right',
        armatureId: createdArmatureId,
      },
      {
        bodyBoneName: 'RightForeArm',
        armatureBoneName: 'Ctrl_ForeArm_FK_Right',
        armatureId: createdArmatureId,
      },
      {
        bodyBoneName: 'RightArm',
        armatureBoneName: 'Ctrl_Arm_FK_Right',
        armatureId: createdArmatureId,
      },
    ];

    for (let index = 0; index < bonesForMaximoArmature.length; index++) {
      const boneForMaximoArmature = bonesForMaximoArmature[index];
      const createdBone = await db.Bone.create(boneForMaximoArmature, {
        transaction,
      });
      bonesForMaximoArmature[index].id = createdBone.dataValues.id;
    }

    const groupedBonesByName = groupBy(bonesForMaximoArmature, 'bodyBoneName');

    const bonesAxesConfig = [
      {
        bodyBoneName: 'LeftArm',
        boneId: 8,
        axisId: 1,
        customAxisId: 2,
        voltSign: 1,
        calibrationVolt: 274,
      },

      {
        bodyBoneName: 'LeftArm',
        boneId: 8,
        axisId: 2,
        customAxisId: null,
        voltSign: -1,
        calibrationVolt: 497,
      },

      {
        bodyBoneName: 'LeftArm',
        boneId: 8,
        axisId: 3,
        customAxisId: 1,
        voltSign: -1,
        calibrationVolt: 1017,
      },

      {
        bodyBoneName: 'LeftUpLeg',
        boneId: 3,
        axisId: 1,
        customAxisId: 1,
        voltSign: 1,
        calibrationVolt: 558,
      },

      {
        bodyBoneName: 'LeftUpLeg',
        boneId: 3,
        axisId: 2,
        customAxisId: null,
        voltSign: 1,
        calibrationVolt: 611,
      },

      {
        bodyBoneName: 'LeftUpLeg',
        boneId: 3,
        axisId: 3,
        customAxisId: 2,
        voltSign: -1,
        calibrationVolt: 524,
      },

      {
        bodyBoneName: 'LeftLeg',
        boneId: 4,
        axisId: 1,
        customAxisId: null,
        voltSign: 1,
        calibrationVolt: 865,
      },

      {
        bodyBoneName: 'LeftForeArm',
        boneId: 7,
        axisId: 3,
        customAxisId: null,
        voltSign: -1,
        calibrationVolt: 889,
      },

      {
        bodyBoneName: 'RightUpLeg',
        boneId: 11,
        axisId: 1,
        customAxisId: 1,
        voltSign: 1,
        calibrationVolt: 654,
      },

      {
        bodyBoneName: 'RightUpLeg',
        boneId: 11,
        axisId: 2,
        customAxisId: null,
        voltSign: -1,
        calibrationVolt: 514,
      },

      {
        bodyBoneName: 'RightUpLeg',
        boneId: 11,
        axisId: 3,
        customAxisId: 2,
        voltSign: 1,
        calibrationVolt: 406,
      },

      {
        bodyBoneName: 'RightLeg',
        boneId: 12,
        axisId: 1,
        customAxisId: null,
        voltSign: 1,
        calibrationVolt: 1008,
      },

      {
        bodyBoneName: 'RightForeArm',
        boneId: 15,
        axisId: 3,
        customAxisId: null,
        voltSign: -1,
        calibrationVolt: 316,
      },

      {
        bodyBoneName: 'RightArm',
        boneId: 16,
        axisId: 1,
        customAxisId: 2,
        voltSign: -1,
        calibrationVolt: 477,
      },

      {
        bodyBoneName: 'RightArm',
        boneId: 16,
        axisId: 2,
        customAxisId: null,
        voltSign: -1,
        calibrationVolt: 426,
      },

      {
        bodyBoneName: 'RightArm',
        boneId: 16,
        axisId: 3,
        customAxisId: 1,
        voltSign: -1,
        calibrationVolt: 858,
      },
    ];

    for (let index = 0; index < bonesAxesConfig.length; index++) {
      const boneAxisConfig = bonesAxesConfig[index];
      const bodyBoneData =
        groupedBonesByName[boneAxisConfig['bodyBoneName']][0];
      const boneId = bodyBoneData.id;
      bonesAxesConfig[index].boneId = bodyBoneData.id;
      // boneAxisConfig.boneId = bodyBoneData.id;
      console.log({ boneAxisConfig, boneId });

      const createdBoneAxisConfig = await db.BoneAxisConfig.create(
        { ...boneAxisConfig, boneId },
        {
          transaction,
        }
      );
    }

    await transaction.commit();
  } catch (error) {
    console.log(error);
    await transaction.rollback();
  }
})();
