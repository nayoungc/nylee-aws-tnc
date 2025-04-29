// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AppProvider } from '@contexts/AppContext';
import { Amplify } from 'aws-amplify';
import { Hub } from 'aws-amplify/utils';
import { AuthProvider } from '@hooks/useAuth';
import { setupAuthListener } from './utils/authListener';
import './i18n';
import '@cloudscape-design/global-styles/index.css';

// Amplify 구성
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: "us-east-1_zrHUYDT0e",
      userPoolClientId: "3o43ivb8om0tbvkok0tuvpcv3s",
      identityPoolId: "us-east-1:668fc65c-a9a2-414c-8054-cc8da182e981",
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
      defaultAuthMode: "userPool"
    }
  }
});

console.log('Amplify 구성 완료');

// auth 이벤트 리스너 설정
setupAuthListener();

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