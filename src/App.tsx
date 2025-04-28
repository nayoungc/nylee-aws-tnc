// src / App.tsx
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from '@/contexts/AppContext';
import { AuthProvider } from '@/hooks/useAuth';
import i18n, { initI18n } from '@/i18n';

import { NotificationProvider } from '@/contexts/NotificationContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

import SurveyManagementPage from '@/pages/survey/SurveyManagementPage';
import QuizManagementPage from './pages/quiz/QuizManagementPage';


import HomePage from '@/pages/public/HomePage';
import TncPage from '@/pages/public/TncPage';
import LoginPage from './pages/auth/LoginPage';

import CourseCatalogPage from '@pages/catalog/CourseCatalogPage';

import CourseManagementPage from '@pages/admin/CourseManagementPage';
import SystemManagementPage from '@/pages/admin/SystemManagementPage';

import NotFoundPage from './pages/errors/NotFoundPage';
import { checkAndRefreshToken } from './utils/apiClient';

// 로딩 컴포넌트 추가
const LoadingComponent: React.FC<{ message?: string }> = ({ message = "로딩 중..." }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
};

// QueryClient 생성
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 10 * 1000, //10초
    },
  },
});

// 토큰 자동 갱신 관리
useEffect(() => {
  // 앱 초기 실행 시 토큰 확인
  checkAndRefreshToken();

  // 토큰 정기적으로 확인 (5분마다)
  const tokenCheckInterval = setInterval(() => {
    checkAndRefreshToken();
  }, 5 * 60 * 1000);

  return () => clearInterval(tokenCheckInterval);
}, []);

// 디버그용 로케이션 컴포넌트
const RouteLogger = () => {
  const location = useLocation();
  console.log('Current route:', location.pathname);
  return null;
};

const App: React.FC = () => {
  const [isI18nInitialized, setIsI18nInitialized] = useState(i18n.isInitialized);

  useEffect(() => {
    const handleInitialized = () => {
      setIsI18nInitialized(true);
    };

    if (i18n.isInitialized) {
      setIsI18nInitialized(true);
    } else {
      // i18next가 초기화될 때까지 대기
      initI18n.then(() => {
        setIsI18nInitialized(true);
      });

      i18n.on('initialized', handleInitialized);
    }

    return () => {
      i18n.off('initialized', handleInitialized);
    };
  }, []);

  // i18next가 초기화될 때까지 로딩 화면 표시
  if (!isI18nInitialized) {
    return <LoadingComponent message="번역 데이터를 불러오는 중..." />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppProvider>
          <AuthProvider>
            <NotificationProvider>
              <RouteLogger />
              <Routes>
                {/* 기존 라우트 */}
                <Route path="/" element={<Navigate to="/tnc" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/tnc" element={<TncPage />} />

                {/* 과정 카탈로그 - 강사와 관리자만 접근 가능 */}
                <Route path="/instructor/catalog" element={
                  <ProtectedRoute requiredRoles={['instructor', 'admin']}>
                    <CourseCatalogPage />
                  </ProtectedRoute>
                } />

                <Route path="/resources" element={
                  <ProtectedRoute requiredRoles={['instructor', 'admin']}>
                    <HomePage />
                  </ProtectedRoute>
                } />

                <Route path="/admin/quiz-management" element={
                  <ProtectedRoute requiredRoles={['admin']}>
                    <QuizManagementPage />
                  </ProtectedRoute>
                } />

                {/* 설문조사 관리 라우트 추가 */}
                <Route path="/admin/survey-management" element={
                  <ProtectedRoute requiredRoles={['admin']}>
                    <SurveyManagementPage />
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