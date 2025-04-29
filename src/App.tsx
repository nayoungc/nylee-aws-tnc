// App.tsx
// App.tsx (임포트 부분만 수정)
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from '@/contexts/AppContext';
import { AuthProvider } from '@/hooks/useAuth';
import i18n, { initI18n } from '@/i18n';

import { NotificationProvider } from '@/contexts/NotificationContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// 로그인/로그아웃 페이지
import LoginPage from './pages/auth/LoginPage';
import LogoutPage from './pages/auth/LogoutPage';  // 추가된 로그아웃 페이지

// 기존 페이지들
import SurveyManagementPage from '@/pages/survey/SurveyManagementPage';
import QuizManagementPage from './pages/quiz/QuizManagementPage';
import HomePage from '@/pages/public/HomePage';
import TncPage from '@/pages/public/TncPage';
import CourseCatalogPage from '@/pages/courseCatalog/CourseCatalogPage';
import CourseManagementPage from '@pages/admin/CourseManagementPage';
import SystemManagementPage from '@/pages/admin/SystemManagementPage';
import NotFoundPage from './pages/errors/NotFoundPage';
import UnauthorizedPage from './pages/errors/UnauthorizedPage'; // 권한 없음 페이지 추가

// 수정된 임포트 경로 (authDebugger.ts가 utils 폴더에 위치)
import { checkAndRefreshToken } from './utils/apiClient';
import { debugAuthState } from './utils/authDebugger';

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

// 임시 페이지 컴포넌트 - 실제 컴포넌트가 없는 경우 사용
const TemporaryPage: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ padding: '2rem' }}>
    <h1>{title}</h1>
    <p>이 페이지는 현재 개발 중입니다.</p>
  </div>
);

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

// 디버그용 로케이션 컴포넌트
const RouteLogger = () => {
  const location = useLocation();
  console.log('Current route:', location.pathname);
  return null;
};



const App: React.FC = () => {
  const [isI18nInitialized, setIsI18nInitialized] = useState(i18n.isInitialized);

  // 토큰 자동 갱신 관리
  useEffect(() => {
    // 앱 시작시 인증 상태 확인
    debugAuthState();
    
    // 토큰 확인 및 갱신
    checkAndRefreshToken();
    
    // 주기적으로 인증 상태 및 토큰 확인
    const interval = setInterval(() => {
      debugAuthState();
      checkAndRefreshToken();
    }, 5 * 60 * 1000); // 5분마다
    
    return () => clearInterval(interval);
  }, []);

  

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
        <NotificationProvider>
          <RouteLogger />
          <Routes>
            {/* 공용 라우트 */}
            <Route path="/" element={<Navigate to="/tnc" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/logout" element={<LogoutPage />} /> {/* 로그아웃 페이지 추가 */}
            <Route path="/home" element={<HomePage />} />
            <Route path="/tnc" element={<TncPage />} />
            <Route path="/help" element={<TemporaryPage title="도움말" />} />
            <Route path="/feedback" element={<TemporaryPage title="피드백" />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} /> {/* 권한 없음 페이지 */}

            {/* 강사 라우트 */}
            <Route path="/instructor/catalog" element={
              <ProtectedRoute requiredRoles={['instructor', 'admin']}>
                <CourseCatalogPage />
              </ProtectedRoute>
            } />
            <Route path="/instructor/quiz" element={
              <ProtectedRoute requiredRoles={['instructor', 'admin']}>
                <QuizManagementPage />
              </ProtectedRoute>
            } />
            <Route path="/instructor/survey" element={
              <ProtectedRoute requiredRoles={['instructor', 'admin']}>
                <SurveyManagementPage />
              </ProtectedRoute>
            } />
            <Route path="/resources" element={
              <ProtectedRoute>
                <HomePage />
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
            <Route path="/admin/quiz-management" element={
              <ProtectedRoute requiredRoles={['admin']}>
                <QuizManagementPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/survey-management" element={
              <ProtectedRoute requiredRoles={['admin']}>
                <SurveyManagementPage />
              </ProtectedRoute>
            } />

            {/* 404 페이지 추가 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </NotificationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;