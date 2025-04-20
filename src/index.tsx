// src/index.tsx
import './styles/theme.css';
import './styles/auth.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

import { Amplify } from 'aws-amplify';
import { resourceConfig } from './amplifyconfiguration';

// Amplify Gen 2 설정 적용
Amplify.configure(resourceConfig);

console.log('Amplify 현재 설정:', Amplify.getConfig());

// i18n 초기화
import './i18n';

// API 설정 가져오기
import { configureAmplify } from './api-config';

// Amplify 초기화
configureAmplify();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);