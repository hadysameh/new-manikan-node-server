/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';

const calibrateVoltSign = async ({ boneAxisName, voltSign }) => {
  const res = await axios.post('http://localhost:3000/calibrateVoltSign', {
    boneAxisName,
    voltSign,
  });
  return res;
};

export default function BoneAxisAnlgeInput({ boneAxisName, socketMessage }) {
  const { mutateAsync, isPending, isSuccess } = useMutation({
    mutationFn: calibrateVoltSign,
  });
  const [bonAxisAngle, setbonAxisAngle] = useState();
  const [boneVoltCalibrationSign, setboneVoltCalibrationSign] = useState(1);

  useEffect(() => {
    if (isSuccess) {
      setboneVoltCalibrationSign((prev) => -1 * prev);
    }
  }, [isSuccess]);

  useEffect(() => {
    if (socketMessage) {
      const boneAnlge = socketMessage[boneAxisName];
      if (boneAnlge) {
        setbonAxisAngle(socketMessage[boneAxisName]);
        console.log({ [boneAxisName]: socketMessage[boneAxisName] });
      }
    }
  }, [socketMessage]);

  return (
    <div>
      <p className="text-center"> {boneAxisName}</p>

      <div className="d-flex gap-2">
        {isPending ? (
          <div class="spinner-border text-primary" role="status">
            {/* <span class="sr-only">Loading...</span> */}
          </div>
        ) : (
          <div>
            <button
              className="btn btn-primary"
              onClick={() =>
                mutateAsync({ boneAxisName, boneVoltCalibrationSign })
              }
            >
              {boneVoltCalibrationSign > 0 ? '+' : '-'}
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
