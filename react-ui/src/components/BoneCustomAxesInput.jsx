/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const calibrateCustomAxis = async ({ boneName, customAxis, localAxis }) => {
  const res = await axios.post(
    'http://localhost:3000/api/calibratecustomaxis',
    {
      boneName,
      customAxis,
      localAxis,
    }
  );
  return res;
};

export function BoneCustomAxesInput({
  boneName,
  calibratedCustomAxes,
  isCalibratedCustomAxesLoading,
}) {
  const queryClient = useQueryClient();
  const boneCustomAxes = ['custom_x_axis_local', 'custom_z_axis_local'];
  const boneLocalAxes = ['bone_z_axis', 'bone_x_axis', 'bone_y_axis'];
  const {
    mutateAsync: mutateCustomAxis,
    isPending,
    isSuccess: isCustomAxisMutated,
  } = useMutation({
    mutationFn: calibrateCustomAxis,
    onSuccess: () => {
      queryClient.invalidateQueries(['getcalibratecustomaxis']);
    },
    onError: () => {
      queryClient.invalidateQueries(['getcalibratecustomaxis']);
    },
  });
  useEffect(() => {
    if (calibratedCustomAxes) {
      console.log(
        'calibratedCustomAxes[boneName]',
        calibratedCustomAxes[boneName]
      );
    }
  }, []);
  return (
    <div className="my-2">
      <p className=" text-center">bone name:{boneName}</p>
      {calibratedCustomAxes &&
        calibratedCustomAxes[boneName] &&
        boneCustomAxes.map((boneCustomAxisName) => (
          <div className="d-flex gap-1 ">
            <p className="pt-3 text-center">{boneCustomAxisName}</p>
            <select
              className="form-select "
              onChange={({ target }) => {
                const boneLocalAxis = target.value;
                console.log({
                  boneName,
                  customAxis: boneCustomAxisName,
                  localAxis: boneLocalAxis,
                });
                mutateCustomAxis({
                  boneName,
                  customAxis: boneCustomAxisName,
                  localAxis: boneLocalAxis,
                });
              }}
              defaultValue={calibratedCustomAxes[boneName][boneCustomAxisName]}
            >
              {boneLocalAxes.map((boneLocalAxis) => (
                <option value={boneLocalAxis}>{boneLocalAxis}</option>
              ))}
            </select>
          </div>
        ))}
    </div>
  );
}
