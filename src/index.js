import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { HelmetProvider } from 'react-helmet-async';
import { TextWidget } from '@livechat/widget-react'
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HelmetProvider>
       <TextWidget organizationId="a23c3071-aa4f-4b29-af01-92b2c8c744a0" />
      <GoogleOAuthProvider clientId="168896484730-4paet7335kr2on6c64j2hdgrpbqg58oa.apps.googleusercontent.com">
        <App />
      </GoogleOAuthProvider>
    </HelmetProvider>
  </React.StrictMode>
);

reportWebVitals();