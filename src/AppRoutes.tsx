// src/AppRoutes.tsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
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

// 강사용 페이지 컴포넌트
import Dashboard from './pages/instructor/Dashboard';
import CourseCatalog from './pages/instructor/CourseCatalog';
import MyCourses from './pages/instructor/MyCourses';
import PreQuizManagement from './pages/instructor/PreQuizManagement';
import PostQuizManagement from './pages/instructor/PostQuizManagement';
import SurveyManagement from './pages/instructor/SurveyManagement';
import AdminPage from './pages/admin/AdminPage';

// 교육생용 페이지 컴포넌트
import StudentHome from './pages/StudentHome';
import StudentCourseHome from './pages/student/StudentCourseHome';
import SurveyPage from './pages/student/SurveyPage';
import PreQuizPage from './pages/student/PreQuizPage';
import PostQuizPage from './pages/student/PostQuizPage';
import CourseDetailPage from './pages/CourseDetailPage'; // 통합 과정 상세 페이지

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
  const authCheckInProgress = useRef(false);

  // 인증 상태 확인 함수
  const checkAuthState = useCallback(async () => {
    setIsLoading(true);
    try {
      // 이미 인증 확인 중이면 반복 요청 방지
      if (authCheckInProgress.current) return;
      authCheckInProgress.current = true;
      
      const user = await getCurrentUser();
      
      try {
        const attributes = await fetchUserAttributes();
        setUserAttributes(attributes);
      } catch (attrError) {
        // 로그만 남기고 중단하지 않음
        console.warn('속성 가져오기 실패:', attrError);
      }
  
      const session = await fetchAuthSession();
      if (!session.tokens) {
        throw new Error('No valid tokens');
      }
  
      setAuthenticated(true);
    } catch (error) {
      console.log('사용자 미인증:', error);
      setAuthenticated(false);
      setUserAttributes(null);
  
      // 공개 경로가 아닌 경우에만 리디렉션
      const isPublicPath = (path: string) => {
        const publicPaths = ['/signin', '/signup', '/confirm-signup', 
          '/forgot-password', '/new-password', '/courses'];
        
        const exactMatch = publicPaths.includes(path);
        const prefixMatch = path.startsWith('/course/');
        
        return exactMatch || prefixMatch;
      }
      
      if (!isPublicPath(location.pathname)) {
        navigate('/signin');
      }      
    } finally {
      setIsLoading(false);
      authCheckInProgress.current = false;
    }
  }, [navigate, location.pathname]);

  // 초기 인증 상태 확인
  useEffect(() => {
    checkAuthState();
  }, [checkAuthState]);

  // Amplify Gen 2 Auth Hub 이벤트 리스너
  useEffect(() => {
    const listener = Hub.listen('auth', ({ payload }) => {
      console.log('Auth 이벤트:', payload.event);
  
      switch (payload.event) {
        case 'signedIn':
          if (!authenticated) checkAuthState();
          break;
        case 'signedOut':
          setAuthenticated(false);
          setUserAttributes(null);
          // 이미 로그인 페이지가 아닌 경우에만 리디렉션
          if (!location.pathname.startsWith('/signin')) {
            navigate('/signin');
          }
          break;
        case 'tokenRefresh_failure':
          setAuthenticated(false);
          setUserAttributes(null);
          // 이미 로그인 페이지가 아닌 경우에만 리디렉션
          if (!location.pathname.startsWith('/signin')) {
            navigate('/signin', {
              state: { message: t('auth.session_expired') || '세션이 만료되었습니다.' }
            });
          }
          break;
      }
    });
  
    return () => listener();
  }, [checkAuthState, navigate, t, authenticated, location.pathname]);

  // 로딩 중 화면
  if (isLoading) {
    return <LoadingScreen message={t('common.loading') || '로딩 중...'} />;
  }

  return (
    <Routes>
      {/* 인증 페이지 라우트 */}
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

      {/* 루트 리디렉션 */}
      <Route
        path="/"
        element={
          authenticated ? (
            userAttributes?.profile === 'instructor' ? (
              <Navigate to="/instructor/dashboard" />
            ) : (
              <Navigate to="/courses" />
            )
          ) : (
            <Navigate to="/courses" />
          )
        }
      />
      
      {/* 통합된 과정 경로 - 상세 및 교육생 기능 */}
      <Route path="/course/:courseId">
        {/* 과정 홈페이지 */}
        <Route index element={<MainLayout><StudentCourseHome /></MainLayout>} />
        {/* 교육생 평가 페이지 */}
        <Route path="survey" element={<MainLayout><SurveyPage /></MainLayout>} />
        <Route path="pre-quiz" element={<MainLayout><PreQuizPage /></MainLayout>} />
        <Route path="post-quiz" element={<MainLayout><PostQuizPage /></MainLayout>} />
      </Route>

      {/* 강사용 페이지 (URL 구조 변경) */}
      <Route path="/instructor">
        {/* 대시보드 */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute
              authenticated={authenticated}
              redirectPath="/signin"
              requiredRole="instructor"
              userAttributes={userAttributes}
            >
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        {/* 과정 관리 */}
        <Route
          path="courses"
          element={
            <ProtectedRoute
              authenticated={authenticated}
              redirectPath="/signin"
              requiredRole="instructor"
              userAttributes={userAttributes}
            >
              <MainLayout>
                <MyCourses />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* 평가 도구 관리 */}
        <Route path="assessments">
          <Route
            path="pre-quiz"
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
            path="post-quiz"
            element={
              <ProtectedRoute
                authenticated={authenticated}
                redirectPath="/signin"
                requiredRole="instructor"
                userAttributes={userAttributes}
              >
                <MainLayout>
                  <PostQuizManagement />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="survey"
            element={
              <ProtectedRoute
                authenticated={authenticated}
                redirectPath="/signin"
                requiredRole="instructor"
                userAttributes={userAttributes}
              >
                <MainLayout>
                  <SurveyManagement />
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Route>

        {/* 분석 및 보고서 (필요한 경우 추가) */}
        <Route path="analytics">
          {/* 추가 분석 라우트 */}
        </Route>
      </Route>

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
            <MainLayout>
              <AdminPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* 이전 URL 경로 리디렉션 */}
      {/* 강사 페이지 리디렉션 */}
      <Route path="/dashboard" element={<Navigate to="/instructor/dashboard" replace />} />
      <Route path="/courses/my-courses" element={<Navigate to="/instructor/courses" replace />} />
      <Route path="/assessments/pre-quiz" element={<Navigate to="/instructor/assessments/pre-quiz" replace />} />
      <Route path="/assessments/post-quiz" element={<Navigate to="/instructor/assessments/post-quiz" replace />} />
      <Route path="/assessments/survey" element={<Navigate to="/instructor/assessments/survey" replace />} />
      
      {/* 교육생 페이지 리디렉션 */}
      <Route path="/student/:courseId" element={<Navigate to="/course/:courseId" replace />} />
      <Route path="/student/:courseId/survey" element={<Navigate to="/course/:courseId/survey" replace />} />
      <Route path="/student/:courseId/pre-quiz" element={<Navigate to="/course/:courseId/pre-quiz" replace />} />
      <Route path="/student/:courseId/post-quiz" element={<Navigate to="/course/:courseId/post-quiz" replace />} />

      {/* 404 라우트 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;