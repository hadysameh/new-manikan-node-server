/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const changeBoneAxisConfig = async ({
  id,
  customAxisId,
  voltSign,
  calibrationVolt,
}) => {
  const res = await axios.put(
    'http://localhost:3000/api/calibrationpageoptions/updateboneaxisconfig/' +
      id,
    {
      customAxisId,
      voltSign,
      calibrationVolt,
    }
  );
  return res;
};

export function BoneCustomAxesInput({
  boneAxisConfigData,
  boneCustomAxes,
  voltsSocketMessage,
  anglessocketMessage,
}) {
  const queryClient = useQueryClient();

  const armatureBoneNameWithAxis =
    boneAxisConfigData.armatureBoneName + '.' + boneAxisConfigData.axisName;

  const bodyBoneNameWithAxis =
    boneAxisConfigData.bodyBoneName + '.' + boneAxisConfigData.axisName;

  const currentBoneAxisVolt = voltsSocketMessage?.[bodyBoneNameWithAxis];
  const currentBoneAxisAngle = anglessocketMessage?.[bodyBoneNameWithAxis];

  // console.log({ anglessocketMessage });
  const [voltSign, setVoltSign] = useState();
  const [customAxisId, setCustomAxisId] = useState();

  const { mutate } = useMutation({
    mutationFn: ({
      id = boneAxisConfigData?.id,
      customAxisId,
      voltSign,
      calibrationVolt,
    }) =>
      changeBoneAxisConfig({
        id,
        customAxisId,
        voltSign,
        calibrationVolt,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['selectandgetarmaturedata']);
    },
    onError: (error) => {
      console.log({ error });
      queryClient.invalidateQueries(['selectandgetarmaturedata']);
    },
  });

  useEffect(() => {
    // Define the event handler
    const handleButtonClick = (event) => {
      const mutationData = {
        calibrationVolt: currentBoneAxisVolt,
      };
      mutate(mutationData);
    };

    // Listen to the custom event
    window.addEventListener('calibrate-volts', handleButtonClick);

    // Clean up the listener when the component unmounts
    return () => {
      window.removeEventListener('calibrate-volts', handleButtonClick);
    };
  }, []);

  useEffect(() => {
    if (boneAxisConfigData?.voltSign == 1) {
      setVoltSign(1);
    } else {
      setVoltSign(-1);
    }
    setCustomAxisId(boneAxisConfigData?.CustomAxis?.id);
  }, []);

  return (
    <div className=" ">
      <div className="d-flex gap-1 ">
        <button
          className="btn btn-primary"
          onClick={() => {
            setVoltSign((prev) => -1 * prev);
            mutate({
              voltSign: -1 * voltSign,
            });
          }}
        >
          {voltSign === 1 ? '+' : '-'}
        </button>
        <p>{armatureBoneNameWithAxis}</p>
        <input
          className="form-control"
          disabled
          value={currentBoneAxisAngle}
        ></input>
      </div>
      <div className="d-flex gap-1 ">
        <p className="pt-1 text-center">axis_calibration:</p>
        <p className="pt-1 text-center">{boneAxisConfigData.axisName}</p>

        <select
          className="form-select "
          onChange={({ target }) => {
            if (target.value === '0') {
              setCustomAxisId(null);
              mutate({ customAxisId: null });
            } else {
              setCustomAxisId(target.value);
              mutate({ customAxisId: target.value });
            }
          }}
          defaultValue={boneAxisConfigData?.CustomAxis?.id || 0}
        >
          {boneCustomAxes?.map((boneCustomAxis) => (
            <option value={boneCustomAxis.id}>{boneCustomAxis.name}</option>
          ))}
          <option value={0}>null</option>
        </select>
      </div>
      <hr />
    </div>
  );
}
