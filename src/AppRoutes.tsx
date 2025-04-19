import React, { useEffect, useState, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

// 인증 관련 컴포넌트
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import ConfirmSignUp from './components/ConfirmSignUp';
import ProtectedRoute from './components/ProtectedRoute';
import ForgotPassword from './components/ForgotPassword'; // ForgotPassword 컴포넌트 추가 권장
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
import { Hub } from 'aws-amplify/utils'; // Hub 추가하여 인증 이벤트 감지

// 다국어 지원
import { useTranslation } from 'react-i18next';

const AppRoutes: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [userAttributes, setUserAttributes] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  // 인증 상태 확인 함수 - 재사용을 위해 useCallback으로 래핑
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

      // 사용자 객체가 있으면 인증된 것으로 간주
      setAuthenticated(true);
    } catch (error) {
      console.log('사용자 미인증:', error);
      setAuthenticated(false);
      setUserAttributes(null);

      // 인증이 필요한 페이지에 있으면 로그인으로 리다이렉트
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

  // Hub 이벤트 리스너 설정 - 로그인/로그아웃 이벤트 감지
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
          // 세션 만료 처리
          setAuthenticated(false);
          setUserAttributes(null);
          navigate('/signin', {
            state: { message: t('auth.session_expired') || '세션이 만료되었습니다. 다시 로그인해주세요.' }
          });
          break;
      }
    });

    // 컴포넌트 언마운트 시 리스너 제거 - 함수 직접 호출
    return () => {
      listener(); // .remove() 메서드 대신 함수 자체를 호출
    };
  }, [checkAuthState, navigate, t]);



  // 로그인 상태에 따라 리다이렉션
  useEffect(() => {
    const authPaths = ['/signin', '/login', '/signup', '/confirm-signup', '/forgot-password'];
    if (authenticated && authPaths.includes(location.pathname)) {
      navigate('/');
    }
  }, [authenticated, location.pathname, navigate]);

  // 로딩 중 표시 - Cloudscape 스타일로 개선 가능
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
        <div className="loading-spinner"></div> {/* CSS로 스피너 스타일 추가 */}
        <div>{t('common.loading') || '로딩 중...'}</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* 인증 관련 라우트 */}
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
      {/* 비밀번호 찾기 라우트 추가 */}
      <Route
        path="/forgot-password"
        element={authenticated ? <Navigate to="/" /> : <ForgotPassword />}
      />

      {/* 홈 라우트 - 역할에 따라 리디렉션 */}
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
            <MainLayout title="Dashboard">
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* 나머지 강사용 라우트들 */}
      <Route
        path="/courses/catalog"
        element={
          <ProtectedRoute
            authenticated={authenticated}
            userAttributes={userAttributes}
            requiredRole="instructor"
          >
            <MainLayout title={t('nav.course_catalog') || 'Course Catalog'}>
              <CourseCatalog />
            </MainLayout>
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
            <MainLayout title={t('nav.my_courses') || 'My Courses'}>
              <MyCourses />
            </MainLayout>
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
            <MainLayout title={t('nav.session_management') || 'Session Management'}>
              <SessionManagement />
            </MainLayout>
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
            <MainLayout title={t('nav.pre_quiz') || 'Pre-Quiz Management'}>
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
            userAttributes={userAttributes}
            requiredRole="instructor"
          >
            <MainLayout title={t('nav.post_quiz') || 'Post-Quiz Management'}>
              <PostQuizManagement />
            </MainLayout>
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
            <MainLayout title={t('nav.survey') || 'Survey Management'}>
              <SurveyManagement />
            </MainLayout>
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
            <MainLayout title={t('nav.ai_generator') || 'AI Question Generator'}>
              <AiGenerator />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* 교육생용 라우트 */}
      {/* 학생용 공개 페이지 - 인증 불필요 */}
      <Route
        path="/courses"
        element={
          <MainLayout title={t('nav.available_courses') || '수강 가능한 과정'}>
            <StudentHome />
          </MainLayout>
        }
      />

      <Route
        path="/course/:courseId"
        element={
          <MainLayout title={t('nav.course_detail') || '과정 상세'}>
            <CourseDetailPage />
          </MainLayout>
        }
      />

      {/* 홈 라우트 수정 - 인증 여부에 따라 다르게 리디렉션 */}
      <Route
        path="/"
        element={
          !authenticated ?
            <Navigate to="/courses" /> :
            (userAttributes?.profile === 'instructor' ?
              <Navigate to="/dashboard" /> :
              <Navigate to="/courses" />)
        }
      />

      <Route
        path="/new-password"
        element={authenticated ? <Navigate to="/" /> : <NewPassword />}
      />

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


      {/* 404 페이지 - 찾을 수 없는 페이지 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;