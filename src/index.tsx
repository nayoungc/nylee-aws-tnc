// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AppProvider } from '@contexts/AppContext';
import { Amplify } from 'aws-amplify';
import { AuthProvider } from '@hooks/useAuth';
import './i18n';

// amplify_outputs.json 파일 임포트
import amplifyConfig from '../amplify_outputs.json';

// Amplify 초기화
try {
  console.log('Initializing Amplify with configuration');
  Amplify.configure(amplifyConfig);
  
  // 디버깅 정보 출력
  console.log('Auth config:', Amplify.getConfig().Auth);
  console.log('API config:', Amplify.getConfig().API);
} catch (error) {
  console.error('Failed to initialize Amplify:', error);
}

// 앱 렌더링
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);