// index.tsx
import './styles/theme.css';
import './styles/auth.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './i18n';

import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';

// Amplify 설정 전 로그
console.log('Amplify 설정 전 awsExports:', JSON.stringify({
  Auth: awsExports.Auth,
  API: awsExports.API,
  api: (awsExports as any).api // 타입 단언 사용
}, null, 2));

Amplify.configure(awsExports);

// Amplify 설정 후 로그
console.log('Amplify 설정 완료:', JSON.stringify({
  Auth: Amplify.getConfig().Auth,
  API: Amplify.getConfig().API
  // api 속성은 제거 (TypeScript 오류 방지)
}, null, 2));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);