import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import '@cloudscape-design/global-styles/index.css';
import '@aws-amplify/ui-react/styles.css';

// 다국어 지원
import './i18n'; // i18n 설정 파일

// 앱 내부 컴포넌트
import AppRoutes from './AppRoutes';
import './styles/global.css';

// 앱 컴포넌트에서는 Amplify 설정 제거
const App: React.FC = () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default App;