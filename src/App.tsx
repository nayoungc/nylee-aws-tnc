import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { configureAmplify } from './amplify-config';
import { AuthProvider } from './auth/auth-context';
import LoginPage from './pages/auth/login';
import RegisterPage from './pages/auth/register';
import DashboardPage from './pages/dashboard';
import '@cloudscape-design/global-styles/index.css';

// Amplify 설정
configureAmplify();

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<DashboardPage />} />
          {/* 추가 경로 설정 */}
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
