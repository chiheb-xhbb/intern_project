import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Create the root element for React 18
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the main App component wrapped in StrictMode for development
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

/**
 * Performance monitoring - optional feature
 * To enable performance measurement, pass a function to log results
 * Example: reportWebVitals(console.log)
 * Learn more: https://bit.ly/CRA-vitals
 */
reportWebVitals();
