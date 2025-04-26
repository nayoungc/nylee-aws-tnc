// App.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from '@/contexts/AppContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import LoginPage from '@/pages/auth/LoginPage';
import HomePage from '@/pages/public/HomePage';
import TncPage from '@/pages/public/TncPage';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import InstructorCatalogPage from '@/pages/catalog/CourseCatalogPage';
import { AuthProvider } from '@/hooks/useAuth';
import '@/i18n';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppProvider>
        <AuthProvider>
          <NotificationProvider>
            <Routes>
              {/* 루트 경로를 TncPage로 리디렉션 */}
              <Route path="/" element={<Navigate to="/tnc" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/home" element={<HomePage />} />
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
    </ThemeProvider>
  );
};

export default App;