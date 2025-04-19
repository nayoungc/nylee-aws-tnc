import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import '@cloudscape-design/global-styles/index.css';
import '@aws-amplify/ui-react/styles.css';

// Amplify 설정
import { Amplify } from 'aws-amplify';

// 다국어 지원
import './i18n'; // i18n 설정 파일

// 앱 내부 컴포넌트 - useNavigate 사용 가능
import AppRoutes from './AppRoutes';

// Amplify 설정 
try {
  const config = require('./amplifyconfiguration.json');
  Amplify.configure(config);
} catch (e) {
  console.error('Amplify 설정을 불러올 수 없습니다:', e);
  // 기본 설정 제공
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: "us-east-1_AFeIVnWIU",
        userPoolClientId: "6tdhvgmafd2uuhbc2naqg96g12",
        loginWith: {
          email: true,
          phone: false,
          username: true
        }
      }
    }
    //region: "us-east-1"
  });
}

// 여기서는 useNavigate를 사용하지 않고, Router만 제공하는 컴포넌트
const App: React.FC = () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default App;