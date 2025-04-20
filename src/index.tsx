import './styles/theme.css';
import './styles/auth.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// i18n 초기화
import './i18n';

// 단일 Amplify 설정 방식으로 수정
import { Amplify } from 'aws-amplify';
// api-config.ts에서 설정 객체만 가져오기 (configure 호출 없이)
import { awsConfig } from './api-config';

// 단 한 번만 configure 호출
Amplify.configure(awsConfig);

console.log('Amplify 설정 완료:', Amplify.getConfig());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);