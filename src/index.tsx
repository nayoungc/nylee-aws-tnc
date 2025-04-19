import './styles/theme.css';
import './styles/auth.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// i18n 초기화
import './i18n';

// Amplify Gen 2 설정 임포트
import { Amplify } from 'aws-amplify';
import amplifyconfig from './amplifyconfiguration.json';

// Amplify Gen 2 초기화 - 애플리케이션 진입점에서 한 번만 설정
Amplify.configure(amplifyconfig);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);