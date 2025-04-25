import React from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import AWS from 'aws-sdk';
import App from './App';
import './styles/theme.css';
import './styles/auth.css';
import './i18n';

// AuthProvider 임포트
import { AuthProvider } from './contexts/AuthContext';

import awsExports from './aws-exports';

// Amplify 설정
async function initializeApp() {
  console.log('Amplify 설정 적용 시작');
  try {
    Amplify.configure(awsExports);
    console.log('Amplify Gen 2 설정 완료', Amplify.getConfig());

    // AWS SDK 리전 설정
    const region = awsExports.API?.GraphQL?.region || 'us-east-1';
    AWS.config.region = region;
    console.log('AWS SDK 리전 설정:', region);
  } catch (error) {
    console.error('Amplify 설정 실패:', error);
  }
}

// 앱 초기화 후 렌더링
initializeApp().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>
  );
});



