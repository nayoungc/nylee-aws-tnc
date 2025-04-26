// src/App.tsx
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from '@/contexts/AppContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import HomePage from '@/pages/public/HomePage';
import TncPage from '@/pages/public/TncPage';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import InstructorCatalogPage from '@pages/instructors/CourseCatalogPage';
import CourseManagementPage from '@pages/admin/CourseManagementPage';
import SystemManagementPage from '@/pages/admin/SystemManagementPage';
import { AuthProvider } from '@/hooks/useAuth';
import '@/i18n';
import LoginPage from './pages/auth/LoginPage';
import NotFoundPage from './pages/errors/NotFoundPage'; 


// QueryClient 생성
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 10 * 1000, // 10초
    },
  },
});

// 디버그용 로케이션 컴포넌트
const RouteLogger = () => {
  const location = useLocation();
  console.log('Current route:', location.pathname);
  return null;
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}> {/* React Query 제공자 추가 */}
      <ThemeProvider>
        <AppProvider>
          <AuthProvider>
            <NotificationProvider>
              <RouteLogger /> {/* 현재 경로 로깅 */}
              <Routes>
                {/* 기존 라우트 */}
                <Route path="/" element={<Navigate to="/tnc" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/home" element={<HomePage />} /> {/* 주석 제거 */}
                <Route path="/tnc" element={<TncPage />} />

                {/* 과정 카탈로그 - 강사와 관리자만 접근 가능 */}
                <Route path="/instructor/catalog" element={
                  <ProtectedRoute requiredRoles={['instructor', 'admin']}>
                    <InstructorCatalogPage />
                  </ProtectedRoute>
                } />

                {/* 누락된 경로 추가 */}
                <Route path="/instructor/courses" element={
                  <ProtectedRoute requiredRoles={['instructor', 'admin']}>
                    <InstructorCatalogPage /> {/* 임시로 같은 페이지 사용 */}
                  </ProtectedRoute>
                } />

                <Route path="/resources" element={
                  <ProtectedRoute requiredRoles={['instructor', 'admin']}>
                    <HomePage /> {/* 임시로 홈페이지 사용, 리소스 페이지 필요 */}
                  </ProtectedRoute>
                } />

                {/* 관리자 라우트 */}
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

                {/* 404 페이지 추가 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </NotificationProvider>
          </AuthProvider>
        </AppProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;