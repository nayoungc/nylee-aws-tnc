// App.tsx (과정 카탈로그 라우트 추가)
import React from 'react';
import { Routes, Route } from 'react-router-dom'; // BrowserRouter 제거
import { AppProvider } from '@/contexts/AppContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import LoginPage from '@/pages/auth/LoginPage';
import HomePage from '@/pages/HomePage'; // 또는 Dashboard
import TncPage from '@/pages/public/TncPage';
import ProtectedRoute from '@/components/auth/ProtectedRoute'; // ProtectedRoute 추가
import InstructorCatalogPage from '@/pages/catalog/CourseCatalogPage'; // 카탈로그 페이지 임포트
import { AuthProvider } from '@/hooks/useAuth';
import '@/i18n';

const App: React.FC = () => {
  return (
    <AppProvider>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/tnc" element={<TncPage />} />
            
            {/* 과정 카탈로그 - 강사와 관리자만 접근 가능 */}
            <Route path="/instructor/catalog" element={
              <ProtectedRoute requiredRoles={['instructor', 'admin']}>
                <InstructorCatalogPage />
              </ProtectedRoute>
            } />
            
            {/* 추가 라우트 */}
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </AppProvider>
  );
};

export default App;