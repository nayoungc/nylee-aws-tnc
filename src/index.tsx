// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AppProvider } from '@contexts/AppContext';
import { Amplify } from 'aws-amplify';
import { AuthProvider } from '@hooks/useAuth';
import './i18n';
import '@cloudscape-design/global-styles/index.css';

import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Amplify v6 형식에 맞게 구성
Amplify.configure({
  // v6에서는 Auth 구성이 변경됨
  Auth: {
    Cognito: {
      userPoolId: "us-east-1_zrHUYDT0e",
      userPoolClientId: "3o43ivb8om0tbvkok0tuvpcv3s",
      identityPoolId: "us-east-1:668fc65c-a9a2-414c-8054-cc8da182e981"
    }
  },
  Storage: {
    S3: {
      bucket: "nylee-aws-tnc",
      region: "us-east-1"
    }
  },
  API: {
    GraphQL: {
      endpoint: "https://34jyk55wjngtlbwbbzdjfraooe.appsync-api.us-east-1.amazonaws.com/graphql",
      region: "us-east-1",
      defaultAuthMode: "userPool",

      
      
    }
  }
});

// 디버깅을 위한 로그 출력
console.log('Amplify 구성 완료');

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