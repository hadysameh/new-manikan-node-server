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
import BonePanel from './components/BonePanel';

function App() {
  // }
  return (
    <>
      <BonePanel />
    </>
  );
}

export default App;
