import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Amplify } from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css'; 

// Amplify 설정 로드 - amplifyconfiguration.json 사용
try {
  const config = require('./amplifyconfiguration.json');
  Amplify.configure(config);
  console.log('Amplify 설정이 성공적으로 로드되었습니다.');
} catch (e) {
  console.error('Amplify 구성 파일을 로드할 수 없습니다:', e);
  // 설정 파일이 없는 경우에는 빈 설정으로 초기화만 하고 경고
  Amplify.configure({});
  alert('인증 설정을 로드할 수 없습니다. 관리자에게 문의하세요.');
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);