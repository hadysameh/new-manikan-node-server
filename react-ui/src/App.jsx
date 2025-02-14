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
import 'bootstrap/dist/css/bootstrap.min.css';
import { BoneCustomAxesInput } from './components/BoneCustomAxesInput';
import axios from 'axios';

const getPageOptions = async () => {
  const { data } = await axios.get(
    'http://localhost:3000/api/calibrationpageoptions/'
  );
  return data;
};

const getAndSelectArmatureData = async (armatureId) => {
  const { data } = await axios.get(
    `http://localhost:3000/api/calibrationpageoptions/selectandgetarmaturedata/${armatureId}`
  );
  return data;
};

function App() {
  const [voltsSocketMessage, setVoltsSocketMessage] = useState();
  const [anglessocketMessage, setAnglesSocketMessage] = useState();
  const [selectedArmatureId, setSelectedArmatureId] = useState();

  const {
    data: pageOptions,
    isLoading: isPageOptionsLoading,
    isSuccess: isPageOptionsFetched,
  } = useQuery({
    queryKey: ['calibrationpageoptions', selectedArmatureId],
    queryFn: getPageOptions,
    staleTime: Infinity,
  });

  const { data: bonesAxesConfig, isLoading: isCalibratedCustomAxesLoading } =
    useQuery({
      queryKey: ['selectandgetarmaturedata', selectedArmatureId],
      queryFn: () => getAndSelectArmatureData(selectedArmatureId),
      enabled: isPageOptionsFetched && !!selectedArmatureId,
      staleTime: Infinity,
    });
  useEffect(() => {
    if (pageOptions && isPageOptionsFetched) {
      const activeArmature = pageOptions?.data?.armatures?.find(
        (armature) => armature.isActive === true
      );
      setSelectedArmatureId(activeArmature?.id);
    }
  }, [pageOptions]);

  useEffect(() => {
    // Listen for messages from the server
    socket.on('volts', (message) => {
      setVoltsSocketMessage(message);
    });
    socket.on('angles', (message) => {
      setAnglesSocketMessage(message);
    });
    // Cleanup on component unmount
    return () => {
      socket.off('volts');
      socket.off('angles');
    };
  }, []);

  const rightColumn = [];
  const leftColumn = [];

  for (let index = 0; index < bonesAxesConfig?.data?.length; index++) {
    const boneAxisConfig = bonesAxesConfig?.data?.[index];
    if (index < bonesAxesConfig?.data?.length / 2) {
      rightColumn.push(boneAxisConfig);
    } else {
      leftColumn.push(boneAxisConfig);
    }
  }
  return (
    <>
      <div>
        <div className="my-3">
          <select
            className="form-select "
            onChange={({ target }) => {
              setSelectedArmatureId(target.value);
            }}
            value={selectedArmatureId}
          >
            {pageOptions?.data?.armatures?.map((armature) => (
              <option value={armature.id}>{armature.name}</option>
            ))}
          </select>
        </div>
        <div className="row">
          {bonesAxesConfig?.data?.map((boneAxisConfig) => (
            <div className="col-4">
              <BoneCustomAxesInput
                boneAxisConfigData={boneAxisConfig}
                boneCustomAxes={pageOptions?.data?.customAxes}
                boneLocalAxes={pageOptions?.data?.axes}
                voltsSocketMessage={voltsSocketMessage}
                anglessocketMessage={anglessocketMessage}
              />
              <br />
            </div>
          ))}
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            const event = new CustomEvent('calibrate-volts');
            window.dispatchEvent(event);
          }}
        >
          calibrate volts
        </button>
      </div>
    </>
  );
}

export default App;
