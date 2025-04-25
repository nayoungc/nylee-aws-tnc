// App.tsx
import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { AppProvider } from '@/contexts/AppContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import LoginPage from '@/pages/auth/LoginPage';
// 이 중 하나 선택 (Dashboard 생성했으면 Dashboard, 아니면 HomePage)
import HomePage from '@/pages/HomePage'; 
// import Dashboard from '@/pages/Dashboard';
import TncPage from '@/pages/public/TncPage'; // TNC 페이지 추가
import { AuthProvider } from '@/hooks/useAuth';
import '@/i18n';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <AuthProvider>
          <NotificationProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<HomePage />} /> {/* 또는 <Dashboard /> */}
              <Route path="/tnc" element={<TncPage />} /> {/* TNC 페이지 추가 */}
              {/* 추가 라우트 */}
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </AppProvider>
    </BrowserRouter>
  );
};

export default App;