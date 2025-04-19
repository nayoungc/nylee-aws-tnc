import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

// 인증 관련 컴포넌트
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import ConfirmSignUp from './components/ConfirmSignUp';
import ProtectedRoute from './components/ProtectedRoute';

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

// Amplify Gen 2 임포트
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';

// 다국어 지원
import { useTranslation } from 'react-i18next';

const AppRoutes: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [userAttributes, setUserAttributes] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  // 인증 상태 확인
  useEffect(() => {
    async function checkAuthState() {
      try {
        const user = await getCurrentUser();
        const attributes = await fetchUserAttributes();
        
        console.log('인증된 사용자:', attributes);
        setAuthenticated(true);
        setUserAttributes(attributes);
      } catch (error) {
        console.log('사용자 미인증:', error);
        setAuthenticated(false);
        setUserAttributes(null);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuthState();
  }, []);

  // 로그인 상태에 따라 리다이렉션
  useEffect(() => {
    if (authenticated && (location.pathname === '/signin' || location.pathname === '/login')) {
      navigate('/');
    }
  }, [authenticated, location.pathname, navigate]);

  // 로딩 중 표시
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
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
      
      {/* 나머지 라우트들 - 동일하게 유지 */}
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
      <Route 
        path="/student" 
        element={
          <ProtectedRoute 
            authenticated={authenticated} 
            userAttributes={userAttributes}
          >
            <MainLayout title={t('nav.student_home') || 'Student Home'}>
              <StudentHome />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* 404 페이지 - 찾을 수 없는 페이지 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;