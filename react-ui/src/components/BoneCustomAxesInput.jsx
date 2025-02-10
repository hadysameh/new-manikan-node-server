/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const changeBoneAxisConfig = async ({ id, customAxisId, data }) => {
  const res = await axios.put(
    'http://localhost:3000/api/calibrationpageoptions/updateboneaxisconfig/' +
      id,
    {
      customAxisId,
      data,
    }
  );
  return res;
};

export function BoneCustomAxesInput({
  boneAxisConfigData,
  boneCustomAxes,
  socketMessage,
}) {
  const queryClient = useQueryClient();

  const boneNameWithAxis =
    boneAxisConfigData.armatureBoneName + '.' + boneAxisConfigData.axisName;

  const currentBoneAxisVolt = socketMessage?.[boneNameWithAxis];

  const [voltSign, setVoltSign] = useState();
  const [customAxisId, setCustomAxisId] = useState();

  const { data, isPending, isSuccess, mutate } = useMutation({
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
      mutate({
        customAxisId,
        voltSign,
        calibrationVolt: currentBoneAxisVolt,
      });
    };

    // Listen to the custom event
    window.addEventListener('calibrate-volts', handleButtonClick);

    // Clean up the listener when the component unmounts
    return () => {
      window.removeEventListener('calibrate-volts', handleButtonClick);
    };
  }, []);

  useEffect(() => {
    setVoltSign(boneAxisConfigData?.voltSign);
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
        <p>{boneNameWithAxis}</p>
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
