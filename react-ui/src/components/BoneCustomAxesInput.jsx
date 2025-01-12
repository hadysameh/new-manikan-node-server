/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';

export function BoneCustomAxesInput({
  boneName,
  bonesWithCustomAxesData,
  setCustomAndLocalAxesRelation,
}) {
  const boneCustomAxes = ['custom_x_axis_local', 'custom_z_axis_local'];
  const boneLocalAxes = ['bone_z_axis', 'bone_x_axis', 'bone_y_axis'];
  return (
    <div className="my-2">
      <p className=" text-center">bone name:{boneName}</p>
      {boneCustomAxes.map((boneCustomAxisName) => (
        <div className="d-flex gap-1 ">
          <p className="pt-3 text-center">{boneCustomAxisName}</p>
          <select
            class="form-select "
            id="inputGroupSelect01"
            onChange={({ target }) => {
              const boneLocalAxis = target.value;
              setCustomAndLocalAxesRelation(
                boneName,
                boneCustomAxisName,
                boneLocalAxis
              );
              console.log({
                boneName,
                boneCustomAxisName,
                boneLocalAxis,
              });
            }}
            defaultValue={bonesWithCustomAxesData[boneName][boneCustomAxisName]}
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
