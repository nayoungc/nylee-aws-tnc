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

// 기본 설정 적용
Amplify.configure(awsExports);

// 설정 로그 - 자세한 로그로 API 설정 확인
console.log('Amplify 설정 완료:', JSON.stringify({
  Auth: Amplify.getConfig().Auth,
  API: Amplify.getConfig().API,
  api: (awsExports as any).api // 소문자 api 확인
}, null, 2));

// 추가 로깅으로 API 설정 확인
console.log('Amplify API 설정:', 
  JSON.stringify(Amplify.getConfig().API || '설정 없음', null, 2)
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);