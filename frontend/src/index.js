import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Create the root element for React 18
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the main App component wrapped in StrictMode for development
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
