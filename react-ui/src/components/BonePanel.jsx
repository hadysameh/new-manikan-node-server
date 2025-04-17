import { useState } from 'react';
import LoadingButton from './LoadingButton';

export default function BonePanel() {
  const robotBoneAxes = ['A', 'B', 'C'];
  const blenderBoneAxes = ['X', 'Y', 'Z'];
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  return (
    <>
      <div className="container mt-4">
        <p
          style={{ cursor: 'pointer' }}
          className="text-primary cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          Ctrl_ForeArm_FK_Left
        </p>

        {/* Collapse Section */}
        <div className={`collapse ${isOpen ? 'show' : ''}`} id="tableCollapse">
          <div>
            <div>
              {/* <p onClick={() => setIsOpen(!isOpen)}>Ctrl_ForeArm_FK_Left</p> */}
              <table className="table table-sm   text-center align-middle">
                <thead>
                  <tr>
                    <th style={{ width: '25%', fontSize: '14px' }}>
                      robot-xis
                    </th>
                    <th
                      style={{ width: '25%', fontSize: '14px' }}
                      className="fs-7"
                    >
                      bone-local-axis
                    </th>
                    <th style={{ width: '25%', fontSize: '14px' }}>
                      bone angle
                    </th>
                    <th style={{ width: '25%', fontSize: '14px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {robotBoneAxes.map((robotBoneAxis) => (
                    <tr>
                      <td>{robotBoneAxis}</td>
                      <td>
                        <select className="form-select form-select-sm">
                          {blenderBoneAxes.map((option, idx) => (
                            <option key={idx} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>20</td>
                      <td>
                        {' '}
                        <LoadingButton
                          isLoading={isLoading}
                          setIsLoading={setIsLoading}
                          handleClick={() => {}}
                        />
                        {/* <button class="btn btn-primary btn-sm">calibrate</button> */}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
