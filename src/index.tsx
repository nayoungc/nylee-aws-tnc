// src/index.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { configureAmplify } from './amplify-config';
import { Amplify } from "aws-amplify";

import '@cloudscape-design/global-styles/index.css';
import outputs from "amplify_outputs.json";

// Amplify Gen 2 초기화
Amplify.configure(outputs);

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

