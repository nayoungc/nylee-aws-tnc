// src/index.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { Amplify } from 'aws-amplify';
import { amplifyConfig } from './amplify-config';
import '@cloudscape-design/global-styles/index.css';

// Amplify 설정 (Gen 2 스타일)
Amplify.configure(amplifyConfig);

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);