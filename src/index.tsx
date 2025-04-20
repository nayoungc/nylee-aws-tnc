// src/index.tsx
import './styles/theme.css';
import './styles/auth.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './i18n';

// Amplify 설정
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';

// 단일 Amplify 설정 적용
Amplify.configure(awsExports);
console.log('Amplify 설정 완료:', Amplify.getConfig());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);