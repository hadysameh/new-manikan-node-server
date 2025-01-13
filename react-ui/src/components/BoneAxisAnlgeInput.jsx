/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';

export default function BoneAxisAnlgeInput({
  boneAxisName,
  boneAxisBoneData,
  setBoneAxisCalibrationVolt,
  setIsBoneAxisVoltPositive,
}) {
  return (
    <div>
      <p className="text-center"> {boneAxisName}</p>

      <div className="d-flex gap-2">
        <div>
          <button
            className="btn btn-primary"
            onClick={() =>
              setIsBoneAxisVoltPositive(
                boneAxisName,
                !boneAxisBoneData.isPositiveSign
              )
            }
          >
            {boneAxisBoneData.isPositiveSign ? '+' : '-'}
          </button>
        </div>
        <div>
          <input
            type="text"
            className="form-control"
            value={boneAxisBoneData.angle}
            disabled
          />
        </div>
      </div>
    </div>
  );
}
