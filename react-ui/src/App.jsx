import './App.css';
import { useEffect, useState } from 'react';
import BoneAnlgeInput from './components/BoneAxisAnlgeInput';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BoneCustomAxesInput } from './components/BoneCustomAxesInput';

function App() {
  const bonesAxesCalibrationDataSchema = {
    'mixamorig:LeftUpLeg.X': { isPositiveSign: true, angle: 0 },
    'mixamorig:LeftUpLeg.Y': { isPositiveSign: true, angle: 0 },
    'mixamorig:LeftUpLeg.Z': { isPositiveSign: true, angle: 0 },
    'mixamorig:LeftLeg.Z': { isPositiveSign: true, angle: 0 },
    'mixamorig:LeftForeArm.Z': { isPositiveSign: true, angle: 0 },
    'mixamorig:LeftArm.Y': { isPositiveSign: true, angle: 0 },
    'mixamorig:LeftArm.X': { isPositiveSign: true, angle: 0 },
    'mixamorig:LeftArm.Z': { isPositiveSign: true, angle: 0 },
    'mixamorig:RightUpLeg.X': { isPositiveSign: true, angle: 0 },
    'mixamorig:RightUpLeg.Y': { isPositiveSign: true, angle: 0 },
    'mixamorig:RightUpLeg.Z': { isPositiveSign: true, angle: 0 },
    'mixamorig:RightLeg.Z': { isPositiveSign: true, angle: 0 },
    'mixamorig:RightForeArm.Z': { isPositiveSign: true, angle: 0 },
    'mixamorig:RightArm.Y': { isPositiveSign: true, angle: 0 },
    'mixamorig:RightArm.X': { isPositiveSign: true, angle: 0 },
    'mixamorig:RightArm.Z': { isPositiveSign: true, angle: 0 },
    'mixamorig:LeftLeg.X': { isPositiveSign: true, angle: 0 },
    'mixamorig:RightLeg.X': { isPositiveSign: true, angle: 0 },
  };

  const bonesWithCustomAxesSchema = {
    'mixamorig:LeftArm': {
      custom_x_axis_local: 'bone_x_axis',
      custom_z_axis_local: 'bone_z_axis',
    },
    'mixamorig:RightArm': {
      custom_x_axis_local: 'bone_x_axis',
      custom_z_axis_local: 'bone_z_axis',
    },
    'mixamorig:LeftUpLeg ': {
      custom_x_axis_local: 'bone_x_axis',
      custom_z_axis_local: 'bone_z_axis',
    },
    'mixamorig:RightUpLeg': {
      custom_x_axis_local: 'bone_x_axis',
      custom_z_axis_local: 'bone_z_axis',
    },
  };

  const [maxVolt, setMaxVolt] = useState(4.75);

  const [bonesAxesCalibrationData, setBonesAxesCalibrationData] = useState({
    ...bonesAxesCalibrationDataSchema,
  });

  const [bonesWithCustomAxesData, setBonesWithCustomAxesData] = useState({
    ...bonesWithCustomAxesSchema,
  });

  const setBoneAxisangle = (boneAxisName, angle) => {
    setBonesAxesCalibrationData((prev) => {
      const newStat = { ...prev };
      newStat[boneAxisName] = { ...newStat[boneAxisName], angle };
      return newStat;
    });
  };

  const setIsBoneAxisVoltPositive = (boneAxisName, isPositiveSign) => {
    setBonesAxesCalibrationData((prev) => {
      const newStat = { ...prev };
      newStat[boneAxisName] = { ...newStat[boneAxisName], isPositiveSign };
      return newStat;
    });
  };

  const setCustomAndLocalAxesRelation = (
    boneName,
    customAxisName,
    localAxisName
  ) => {
    setBonesWithCustomAxesData((prev) => {
      const newStat = { ...prev };
      newStat[boneName] = {
        ...newStat[boneName],
        [customAxisName]: localAxisName,
      };
      return newStat;
    });
  };
  return (
    <>
      <div className="d-flex w-25">
        <p className="w-50">max volt:</p>
        <input type="text" className="form-control" value={maxVolt} />
      </div>
      <div className="row">
        <div className="col-9">
          <div className="row">
            {Object.keys(bonesAxesCalibrationData).map((boneAxisName) => (
              <div className="col-6">
                <BoneAnlgeInput
                  boneAxisName={boneAxisName}
                  boneAxisBoneData={bonesAxesCalibrationData[boneAxisName]}
                  setBoneAxisangle={setBoneAxisangle}
                  setIsBoneAxisVoltPositive={setIsBoneAxisVoltPositive}
                />
              </div>
            ))}
            <div className="my-4">
              <button className="btn btn-primary">Claibrate angles</button>
            </div>
          </div>
        </div>
        <div className="col-3">
          {Object.keys(bonesWithCustomAxesData).map((boneName) => (
            <>
              <BoneCustomAxesInput
                boneName={boneName}
                bonesWithCustomAxesData={bonesWithCustomAxesData}
                setCustomAndLocalAxesRelation={setCustomAndLocalAxesRelation}
              />
              <hr />
            </>
          ))}
        </div>
      </div>
    </>
  );
}

export default App;
