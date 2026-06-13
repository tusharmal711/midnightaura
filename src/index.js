import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { GoogleOAuthProvider } from '@react-oauth/google';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="300600477815-2488eg0m59ksnb0idqm3kh28om018743.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  
  </React.StrictMode>
);


reportWebVitals();
