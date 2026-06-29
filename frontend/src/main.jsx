import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { EmergencyProvider } from './context/EmergencyContext';
import { LocationProvider } from './context/LocationContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LocationProvider>
        <EmergencyProvider>
          <App />
        </EmergencyProvider>
      </LocationProvider>
    </BrowserRouter>
  </React.StrictMode>
);
