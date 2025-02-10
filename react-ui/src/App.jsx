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
  const [maxVolt, setMaxVolt] = useState(4.75);

  const {
    data: pageOptions,
    isLoading: isPageOptionsLoading,
    isSuccess: isPageOptionsFetched,
  } = useQuery({
    queryKey: ['calibrationpageoptions'],
    queryFn: getPageOptions,
    staleTime: Infinity,
  });

  const { data: bonesAxesConfig, isLoading: isCalibratedCustomAxesLoading } =
    useQuery({
      queryKey: ['selectandgetarmaturedata'],
      queryFn: () => getAndSelectArmatureData(1),
      enabled: isPageOptionsFetched,
      staleTime: Infinity,
    });
  // console.log(pageOptions, bonesAxesConfig);

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
