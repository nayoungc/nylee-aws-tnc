// src/App.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from '@/contexts/AppContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import LoginPage from '@/pages/auth/LoginPage';
import HomePage from '@/pages/public/HomePage';
import TncPage from '@/pages/public/TncPage';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import InstructorCatalogPage from '@pages/instructors/CourseCatalogPage';
import CourseManagementPage from '@pages/admin/CourseManagementPage'; // 새 페이지 임포트
import SystemManagementPage from '@/pages/admin/SystemManagementPage'; // 새 페이지 임포트
import { AuthProvider } from '@/hooks/useAuth';
import '@/i18n';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppProvider>
        <AuthProvider>
          <NotificationProvider>
            <Routes>
              {/* 기존 라우트 */}
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

              {/* 새로운 관리자 라우트 */}
              <Route path="/admin/course-management" element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <CourseManagementPage />
                </ProtectedRoute>
              } />

              <Route path="/admin/system-management" element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <SystemManagementPage />
                </ProtectedRoute>
              } />
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </AppProvider>
    </ThemeProvider>
  );
};

export default App;