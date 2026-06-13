import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { GoogleOAuthProvider } from '@react-oauth/google';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="168896484730-4paet7335kr2on6c64j2hdgrpbqg58oa.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  
  </React.StrictMode>
);


reportWebVitals();
