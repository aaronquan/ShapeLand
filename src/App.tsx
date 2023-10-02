import React, {useEffect} from 'react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import { queryClient } from './scripts/apiCall';

import './App.css';

import { Canvas } from './components/Canvas';
import { useKeys } from './hooks/Keys';
import MainPage from './pages/main';

//export const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
    <div className="App">
      <header className="App-header">
        <MainPage/>
      </header>
    </div>
    </QueryClientProvider>
  );
}

export default App;
