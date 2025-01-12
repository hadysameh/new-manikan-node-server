/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';

export function BoneAnlgeInput({
  boneAxisName,
  angle,
  isPositiveSign,
  setAxisBoneData,
}) {
  const [isPosistveSign, setIsPosistveSign] = useState(isPositiveSign);

  return (
    <div>
      <p className="text-center"> {boneAxisName}</p>

      <div className="d-flex gap-2">
        <div>
          <button
            className="btn btn-primary"
            onClick={() => setIsPosistveSign((prev) => !prev)}
          >
            {isPosistveSign ? '+' : '-'}
          </button>
        </div>
        <div>
          <input type="text" className="form-control" value={angle} disabled />
        </div>
      </div>
    </div>
  );
}
