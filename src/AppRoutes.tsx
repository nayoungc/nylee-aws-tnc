import React, { useEffect, useState, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

// 인증 관련 컴포넌트
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import ConfirmSignUp from './components/ConfirmSignUp';
import ProtectedRoute from './components/ProtectedRoute';
import ForgotPassword from './components/ForgotPassword';
import NewPassword from './components/NewPassword';

// 레이아웃 컴포넌트
import MainLayout from './components/MainLayout';

// 페이지 컴포넌트
import Dashboard from './pages/Dashboard';
import StudentHome from './pages/StudentHome';

// 강사용 페이지
import CourseCatalog from './pages/instructor/CourseCatalog';
import MyCourses from './pages/instructor/MyCourses';
import SessionManagement from './pages/instructor/SessionManagement';
import PreQuizManagement from './pages/instructor/PreQuizManagement';
import PostQuizManagement from './pages/instructor/PostQuizManagement';
import SurveyManagement from './pages/instructor/SurveyManagement';
import AiGenerator from './pages/instructor/AiGenerator';
import CourseDetailPage from './pages/instructor/CourseDetailPage';

// 어드민 페이지
import AdminPage from './pages/admin/AdminPage';

// Amplify Gen 2 임포트
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

// 다국어 지원
import { useTranslation } from 'react-i18next';

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
      const user = await getCurrentUser();

      try {
        const attributes = await fetchUserAttributes();
        console.log('인증된 사용자:', attributes);
        setUserAttributes(attributes);
      } catch (attrError) {
        console.warn('속성 가져오기 실패, 기본 인증은 유지:', attrError);
      }

      setAuthenticated(true);
    } catch (error) {
      console.log('사용자 미인증:', error);
      setAuthenticated(false);
      setUserAttributes(null);

      if (location.pathname !== '/signin' &&
        location.pathname !== '/signup' &&
        location.pathname !== '/confirm-signup' &&
        location.pathname !== '/forgot-password' &&
        location.pathname !== '/new-password') {
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

  // Hub 이벤트 리스너 설정
  useEffect(() => {
    const listener = Hub.listen('auth', (data) => {
      const { payload } = data;
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
            state: { message: t('auth.session_expired') || '세션이 만료되었습니다. 다시 로그인해주세요.' }
          });
          break;
      }
    });

    return () => {
      listener();
    };
  }, [checkAuthState, navigate, t]);

  // 로그인 상태에 따른 리다이렉션
  useEffect(() => {
    const authPaths = ['/signin', '/login', '/signup', '/confirm-signup', '/forgot-password'];
    if (authenticated && authPaths.includes(location.pathname)) {
      navigate('/');
    }
  }, [authenticated, location.pathname, navigate]);

  // 로딩 중 표시
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div className="loading-spinner"></div>
        <div>{t('common.loading') || '로딩 중...'}</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* 인증 관련 라우트 - 레이아웃 없음 */}
      <Route path="/signin" element={authenticated ? <Navigate to="/" /> : <SignIn />} />
      <Route path="/signup" element={authenticated ? <Navigate to="/" /> : <SignUp />} />
      <Route path="/confirm-signup" element={authenticated ? <Navigate to="/" /> : <ConfirmSignUp />} />
      <Route path="/forgot-password" element={authenticated ? <Navigate to="/" /> : <ForgotPassword />} />
      <Route path="/new-password" element={authenticated ? <Navigate to="/" /> : <NewPassword />} />

      {/* 인증된 라우트 - 메인 레이아웃 적용 */}
      <Route element={<MainLayout />}>
        {/* 홈 리다이렉션 */}
        <Route
          path="/"
          element={
            !authenticated ?
              <Navigate to="/signin" /> :
              (userAttributes?.profile === 'instructor' ?
                <Navigate to="/dashboard" /> :
                <Navigate to="/student" />)
          }
        />

        {/* 강사용 라우트 */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              authenticated={authenticated}
              userAttributes={userAttributes}
              requiredRole="instructor"
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
              userAttributes={userAttributes}
              requiredRole="instructor"
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
              userAttributes={userAttributes}
              requiredRole="instructor"
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
              userAttributes={userAttributes}
              requiredRole="instructor"
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
              userAttributes={userAttributes}
              requiredRole="instructor"
            >
              <PreQuizManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/assessments/post-quiz"
          element={
            <ProtectedRoute
              authenticated={authenticated}
              userAttributes={userAttributes}
              requiredRole="instructor"
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
              userAttributes={userAttributes}
              requiredRole="instructor"
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
              userAttributes={userAttributes}
              requiredRole="instructor"
            >
              <AiGenerator />
            </ProtectedRoute>
          }
        />

        {/* 교육생용 라우트 */}
        <Route
          path="/courses"
          element={<StudentHome />}
        />

        <Route
          path="/course/:courseId"
          element={<CourseDetailPage />}
        />
      </Route>

      {/* 관리자 페이지 - 별도 레이아웃 */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute
            authenticated={authenticated}
            userAttributes={userAttributes}
            requiredRole="admin"
          >
            <AdminPage />
          </ProtectedRoute>
        }
      />

      {/* 404 페이지 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;