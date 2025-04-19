// src/AppRoutes.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import {
  fetchAuthSession,
  getCurrentUser,
  fetchUserAttributes,
  signOut
} from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { useTranslation } from 'react-i18next';

// 인증 관련 컴포넌트
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import ConfirmSignUp from './components/ConfirmSignUp';
import ForgotPassword from './components/ForgotPassword';
import NewPassword from './components/NewPassword';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingScreen from './components/LoadingScreen';

// 페이지 컴포넌트
import Dashboard from './pages/Dashboard';
import StudentHome from './pages/StudentHome';
import CourseCatalog from './pages/instructor/CourseCatalog';
import MyCourses from './pages/instructor/MyCourses';
import SessionManagement from './pages/instructor/SessionManagement';
import PreQuizManagement from './pages/instructor/PreQuizManagement';
import PostQuizManagement from './pages/instructor/PostQuizManagement';
import SurveyManagement from './pages/instructor/SurveyManagement';
import AiGenerator from './pages/instructor/AiGenerator';
import CourseDetailPage from './pages/instructor/CourseDetailPage';
import AdminPage from './pages/admin/AdminPage';

// AppRoutes.tsx의 관련 부분 업데이트
import StudentCourseHome from './pages/student/StudentCourseHome';
import SurveyPage from './pages/student/SurveyPage';
import PreQuizPage from './pages/student/PreQuizPage';
import PostQuizPage from './pages/student/PostQuizPage';

// 레이아웃 컴포넌트
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';

const AppRoutes: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [userAttributes, setUserAttributes] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  // 인증 상태 확인 함수
  const checkAuthState = useCallback(async () => {
    setIsLoading(true);
    try {
      // 현재 사용자 가져오기
      const user = await getCurrentUser();

      try {
        // Amplify Gen 2 방식으로 사용자 속성 가져오기
        const attributes = await fetchUserAttributes();
        setUserAttributes(attributes);
      } catch (attrError) {
        console.warn('속성 가져오기 실패:', attrError);
      }

      // 세션 가져오기
      const session = await fetchAuthSession();
      if (!session.tokens) {
        throw new Error('No valid tokens');
      }

      setAuthenticated(true);
    } catch (error) {
      console.log('사용자 미인증:', error);
      setAuthenticated(false);
      setUserAttributes(null);

      // 보호된 경로에 있다면 로그인으로 리디렉션
      const publicPaths = ['/signin', '/signup', '/confirm-signup', '/forgot-password', '/new-password', '/courses'];
      if (!publicPaths.some(path => location.pathname.startsWith(path))) {
        navigate('/signin');
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate, location.pathname]);

  // 초기 인증 상태 확인
  useEffect(() => {
    checkAuthState();
  }, [checkAuthState]);

  // Amplify Gen 2 방식의 Auth Hub 이벤트 리스너
  useEffect(() => {
    const listener = Hub.listen('auth', ({ payload }) => {
      console.log('Auth 이벤트:', payload.event);

      switch (payload.event) {
        case 'signedIn':
          checkAuthState();
          break;
        case 'signedOut':
          setAuthenticated(false);
          setUserAttributes(null);
          navigate('/signin');
          break;
        case 'tokenRefresh_failure':
          setAuthenticated(false);
          setUserAttributes(null);
          navigate('/signin', {
            state: { message: t('auth.session_expired') || '세션이 만료되었습니다.' }
          });
          break;
      }
    });

    return () => listener();
  }, [checkAuthState, navigate, t]);

  // 로딩 중 화면
  if (isLoading) {
    return <LoadingScreen message={t('common.loading') || '로딩 중...'} />;
  }

  return (
    <Routes>
      {/* 인증 페이지 라우트 - 별도 레이아웃 */}
      <Route element={<AuthLayout />}>
        <Route
          path="/signin"
          element={authenticated ? <Navigate to="/" /> : <SignIn />}
        />
        <Route
          path="/signup"
          element={authenticated ? <Navigate to="/" /> : <SignUp />}
        />
        <Route
          path="/confirm-signup"
          element={authenticated ? <Navigate to="/" /> : <ConfirmSignUp />}
        />
        <Route
          path="/forgot-password"
          element={authenticated ? <Navigate to="/" /> : <ForgotPassword />}
        />
        <Route
          path="/new-password"
          element={authenticated ? <Navigate to="/" /> : <NewPassword />}
        />
      </Route>

      {/* 공개 페이지 라우트 - 직접 MainLayout 적용 */}
      <Route path="/courses" element={<MainLayout><StudentHome /></MainLayout>} />
      <Route path="/course/:courseId" element={<MainLayout><CourseDetailPage /></MainLayout>} />
      {/* 교육생용 라우트 (공개) */}
      <Route path="/student/:courseId" element={<StudentCourseHome />} />
      <Route path="/student/:courseId/survey" element={<SurveyPage />} />
      <Route path="/student/:courseId/pre-quiz" element={<PreQuizPage />} />
      <Route path="/student/:courseId/post-quiz" element={<PostQuizPage />} />

      {/* 보호된 라우트 - 인증 필요 */}
      <Route
        path="/"
        element={
          <ProtectedRoute
            authenticated={authenticated}
            redirectPath="/signin"
          >
            {userAttributes?.profile === 'instructor' ?
              <Navigate to="/dashboard" /> :
              <Navigate to="/courses" />}
          </ProtectedRoute>
        }
      />

      {/* 강사용 보호된 라우트 - ProtectedRoute에서 MainLayout 처리됨 */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute
            authenticated={authenticated}
            redirectPath="/signin"
            requiredRole="instructor"
            userAttributes={userAttributes}
          >
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/courses/catalog"
        element={
          <ProtectedRoute
            authenticated={authenticated}
            redirectPath="/signin"
            requiredRole="instructor"
            userAttributes={userAttributes}
          >
            <CourseCatalog />
          </ProtectedRoute>
        }
      />

      <Route
        path="/courses/my-courses"
        element={
          <ProtectedRoute
            authenticated={authenticated}
            redirectPath="/signin"
            requiredRole="instructor"
            userAttributes={userAttributes}
          >
            <MyCourses />
          </ProtectedRoute>
        }
      />

      <Route
        path="/courses/sessions"
        element={
          <ProtectedRoute
            authenticated={authenticated}
            redirectPath="/signin"
            requiredRole="instructor"
            userAttributes={userAttributes}
          >
            <SessionManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/assessments/pre-quiz"
        element={
          <ProtectedRoute
            authenticated={authenticated}
            redirectPath="/signin"
            requiredRole="instructor"
            userAttributes={userAttributes}
          >
            <PreQuizManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/assessments/pre-quiz"
        element={
          <ProtectedRoute
            authenticated={authenticated}
            redirectPath="/signin"
            requiredRole="instructor"
            userAttributes={userAttributes}
          >
            <MainLayout>
              <PreQuizManagement />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/assessments/post-quiz"
        element={
          <ProtectedRoute
            authenticated={authenticated}
            redirectPath="/signin"
            requiredRole="instructor"
            userAttributes={userAttributes}
          >
            <PostQuizManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/assessments/survey"
        element={
          <ProtectedRoute
            authenticated={authenticated}
            redirectPath="/signin"
            requiredRole="instructor"
            userAttributes={userAttributes}
          >
            <SurveyManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/assessments/ai-generator"
        element={
          <ProtectedRoute
            authenticated={authenticated}
            redirectPath="/signin"
            requiredRole="instructor"
            userAttributes={userAttributes}
          >
            <AiGenerator />
          </ProtectedRoute>
        }
      />

      {/* 관리자 라우트 */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute
            authenticated={authenticated}
            redirectPath="/signin"
            requiredRole="admin"
            userAttributes={userAttributes}
          >
            <AdminPage />
          </ProtectedRoute>
        }
      />

      {/* 404 라우트 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;