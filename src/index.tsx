// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AppProvider } from './contexts/AppContext';
import { Amplify } from 'aws-amplify';
import { AuthProvider } from './hooks/useAuth'; // AuthProvider 임포트 추가
import './i18n';

// Amplify 초기화 추가
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: "us-east-1_AFeIVnWIU",
      userPoolClientId: "6tdhvgmafd2uuhbc2naqg96g12"
    }
  },
  Storage: {
    S3: {
      bucket: "nylee-aws-tnc",
      region: "us-east-1"
    }
  }
});

// 앱 렌더링
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider> {/* AuthProvider 추가 */}
        <AppProvider>
          <App />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);