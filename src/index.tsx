// src/index.tsx
import './styles/theme.css';
import './styles/auth.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Amplify Gen 2 설정 임포트
import { Amplify } from 'aws-amplify';
// i18n 초기화 BEFORE amplify config
import './i18n';

// 반드시 다른 import 다음에 와야 함
import amplifyconfig from './amplifyconfiguration.json';


// Amplify Gen 2 초기화 - 애플리케이션 진입점에서 한 번만 설정
console.log('Initializing Amplify with config:', amplifyconfig);
Amplify.configure(amplifyconfig);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);