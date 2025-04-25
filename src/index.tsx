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



// import { Amplify } from 'aws-amplify';
// import { fetchAuthSession } from 'aws-amplify/auth';
// import awsExports from './aws-exports';

// // Amplify 설정
// Amplify.configure(awsExports);

// // 인증 상태를 초기에 확인
// window.addEventListener('load', async () => {
//   try {
//     const session = await fetchAuthSession();
//     const useMock = !session.credentials || 
//                     sessionStorage.getItem('useMockData') === 'true' || 
//                     process.env.NODE_ENV === 'development';
    
//     if (useMock) {
//       console.log('모의 데이터 모드가 활성화되었습니다.');
//       sessionStorage.setItem('useMockData', 'true');
//     }
//   } catch (error) {
//     console.warn('인증 세션 확인 중 오류:', error);
//     sessionStorage.setItem('useMockData', 'true');
//   }
// });

