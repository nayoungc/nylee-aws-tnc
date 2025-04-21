// src/App.tsx
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import '@cloudscape-design/global-styles/index.css';
import '@aws-amplify/ui-react/styles.css';
import { AuthProvider } from './contexts/AuthContext'; // 새로 추가

// 다국어 지원
import './i18n';

// 앱 내부 컴포넌트
import AppRoutes from './AppRoutes';
import './styles/global.css';

// AuthProvider 추가
const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
};

export default App;