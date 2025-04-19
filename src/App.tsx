import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import '@cloudscape-design/global-styles/index.css';
import '@aws-amplify/ui-react/styles.css';

// Amplify Gen 2 설정 - 개별 패키지에서 import
import { Amplify } from 'aws-amplify';

// 다국어 지원
import './i18n'; // i18n 설정 파일

// 앱 내부 컴포넌트
import AppRoutes from './AppRoutes';

// Amplify 설정 파일 가져오기
let amplifyConfig;
try {
  // 설정 파일 직접 임포트 - 번들러가 처리
  amplifyConfig = require('./amplifyconfiguration.json');
} catch (e) {
  console.warn('amplifyconfiguration.json 파일을 찾을 수 없습니다. 기본 설정을 사용합니다.');
  // 기본 설정 제공 - Gen 2 형식
  amplifyConfig = {
    Auth: {
      Cognito: {
        userPoolId: "us-east-1_AFeIVnWIU",
        userPoolClientId: "6tdhvgmafd2uuhbc2naqg96g12",
        region: "us-east-1",
        loginWith: {
          email: true,
          phone: false,
          username: true
        }
      }
    },
    API: {
      GraphQL: {
        endpoint: "https://34jyk55wjngtlbwbbzdjfraooe.appsync-api.us-east-1.amazonaws.com/graphql",
        region: "us-east-1",
        defaultAuthMode: "userPool"
      }
    }
  };
}

// Gen 2 스타일로 Amplify 설정
Amplify.configure(amplifyConfig);

// 여기서는 useNavigate를 사용하지 않고, Router만 제공하는 컴포넌트
const App: React.FC = () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default App;