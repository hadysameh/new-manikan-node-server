import './App.css';
import { useEffect, useState } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import socket from './socket';
import BoneAnlgeInput from './components/BoneAxisAnlgeInput';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BoneCustomAxesInput } from './components/BoneCustomAxesInput';

const queryClient = new QueryClient();
function App() {
  const [socketMessage, setSocketMessage] = useState();

  useEffect(() => {
    // Listen for messages from the server
    socket.on('arduinoData', (message) => {
      // setbonAxisAngle;
      setSocketMessage(message);
    });

    // Cleanup on component unmount
    return () => {
      socket.disconnect();
    };
  }, []);
  const bonesAxesNames = [
    'mixamorig:LeftUpLeg.X',
    'mixamorig:LeftUpLeg.Y',
    'mixamorig:LeftUpLeg.Z',
    'mixamorig:LeftLeg.X',
    'mixamorig:LeftForeArm.Z',
    'mixamorig:LeftArm.Y',
    'mixamorig:LeftArm.X',
    'mixamorig:LeftArm.Z',
    'mixamorig:RightUpLeg.X',
    'mixamorig:RightUpLeg.Y',
    'mixamorig:RightUpLeg.Z',
    'mixamorig:RightLeg.X',
    'mixamorig:RightForeArm.Z',
    'mixamorig:RightArm.Y',
    'mixamorig:RightArm.X',
    'mixamorig:RightArm.Z',
    'mixamorig:LeftLeg.X',
    'mixamorig:RightLeg.X',
  ];

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

  // const [bonesAxesCalibrationData, setBonesAxesCalibrationData] = useState({
  //   ...bonesAxesCalibrationDataSchema,
  // });

  // const [bonesWithCustomAxesData, setBonesWithCustomAxesData] = useState({
  //   ...bonesWithCustomAxesSchema,
  // });

  // const setBoneAxisangle = (boneAxisName, angle) => {
  //   setBonesAxesCalibrationData((prev) => {
  //     const newStat = { ...prev };
  //     newStat[boneAxisName] = { ...newStat[boneAxisName], angle };
  //     return newStat;
  //   });
  // };

  // const setIsBoneAxisVoltPositive = (boneAxisName, isPositiveSign) => {
  //   setBonesAxesCalibrationData((prev) => {
  //     const newStat = { ...prev };
  //     newStat[boneAxisName] = { ...newStat[boneAxisName], isPositiveSign };
  //     return newStat;
  //   });
  // };

  // const setCustomAndLocalAxesRelation = (
  //   boneName,
  //   customAxisName,
  //   localAxisName
  // ) => {
  //   setBonesWithCustomAxesData((prev) => {
  //     const newStat = { ...prev };
  //     newStat[boneName] = {
  //       ...newStat[boneName],
  //       [customAxisName]: localAxisName,
  //     };
  //     return newStat;
  //   });
  // };
  return (
    <QueryClientProvider client={queryClient}>
      <div className="d-flex w-25">
        <p className="w-50">max volt:</p>
        <input type="text" className="form-control" value={maxVolt} />
      </div>
      <div className="row">
        <div className="col-9">
          <div className="row">
            {bonesAxesNames.map((boneAxisName) => (
              <div className="col-6">
                <BoneAnlgeInput
                  boneAxisName={boneAxisName}
                  socketMessage={socketMessage}
                />
              </div>
            ))}
            <div className="my-4">
              <button className="btn btn-primary">Claibrate angles</button>
            </div>
          </div>
        </div>
        <div className="col-3">
          {Object.keys(bonesWithCustomAxesSchema).map((boneName) => (
            <>
              {/* <BoneCustomAxesInput boneName={boneName} /> */}
              <hr />
            </>
          ))}
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
