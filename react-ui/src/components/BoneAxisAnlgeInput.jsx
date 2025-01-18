/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useMutation, useQuery } from '@tanstack/react-query';

const calibrateVoltSign = async ({ boneAxisName, voltSign }) => {
  console.log({ boneAxisName, voltSign });
  const res = await axios.post('http://localhost:3000/api/calibratevoltsign', {
    boneAxisName,
    voltSign,
  });
  return res;
};

export default function BoneAxisAnlgeInput({
  boneAxisName,
  socketMessage,
  calibrationSigns,
  isCalibrationSignsLoading,
}) {
  const {
    mutate: mutateVoltSign,
    isPending,
    isSuccess: isVoltSignsMutated,
  } = useMutation({
    mutationFn: calibrateVoltSign,
  });

  const [bonAxisAngle, setbonAxisAngle] = useState();
  const [voltSign, setVoltSign] = useState(1);

  useEffect(() => {
    if (calibrationSigns) {
      console.log({
        'calibrationSigns[boneAxisName]': calibrationSigns[boneAxisName],
      });
      setbonAxisAngle(calibrationSigns[boneAxisName]);
    }
  }, [calibrationSigns]);

  useEffect(() => {
    if (isVoltSignsMutated) {
      setVoltSign((prev) => -1 * prev);
    }
  }, [isVoltSignsMutated]);

  useEffect(() => {
    if (socketMessage) {
      const boneAnlge = socketMessage[boneAxisName];
      if (boneAnlge) {
        setbonAxisAngle(socketMessage[boneAxisName]);
        // console.log({ [boneAxisName]: socketMessage[boneAxisName] });
      }
    }
  }, [socketMessage]);

  return (
    <div>
      <p className="text-center"> {boneAxisName}</p>

      <div className="d-flex gap-2">
        {isPending || isCalibrationSignsLoading ? (
          <div className="spinner-border text-primary" role="status">
            {/* <span class="sr-only">Loading...</span> */}
          </div>
        ) : (
          <div>
            <button
              className="btn btn-primary"
              onClick={() =>
                mutateVoltSign({ boneAxisName, voltSign: -1 * voltSign })
              }
            >
              {voltSign > 0 ? '+' : '-'}
            </button>
          </div>
        )}
        <div>
          <input
            type="text"
            className="form-control"
            value={bonAxisAngle}
            disabled
          />
        </div>
      </div>
    </div>
  );
}
