import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Amplify } from 'aws-amplify';

// Amplify 설정 로드 시도
try {
  const config = require('./amplifyconfiguration.json');
  Amplify.configure(config);
} catch (e) {
  console.warn('No Amplify configuration found, using mock data for development');
  // 개발 모드에서는 기본 설정으로 진행
  Amplify.configure({
    // 필요한 기본 설정
  });
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);