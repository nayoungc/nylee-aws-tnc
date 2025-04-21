// src/AppRoutes.tsx
import React from 'react'; 
import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext'; // AuthContext 사용
import { useTypedTranslation } from '@utils/i18n-utils';

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
import CoursesManagement from './pages/instructor/CoursesManagement';
import CourseCreation from './pages/instructor/CourseCreation';
import CourseCatalog from './pages/instructor/CourseCatalog';
import QuizManagement from './pages/instructor/QuizManagement';
import QuizCreator from './pages/instructor/QuizCreator';
import SurveyManagement from './pages/instructor/SurveyManagement';
import SurveyCreator from './pages/instructor/SurveyCreator';
import ReportGenerator from './pages/instructor/ReportGenerator';
import AdminPage from './pages/admin/AdminPage';
import Analytics from './pages/instructor/Analytics';

// 교육생용 페이지 컴포넌트
import SurveyPage from './pages/courses/SurveyPage';
import PreQuizPage from './pages/courses/PreQuizPage';
import PostQuizPage from './pages/courses/PostQuizPage';
import CourseHome from './pages/courses/CourseHome';
import CourseList from './pages/courses/CourseList';

// 레이아웃 컴포넌트
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';

// 리디렉션을 위한 별도 컴포넌트들
const CoursesHomeRedirect: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  return <Navigate to={`/tnc/\${courseId}`} replace />;
};

const CoursePathRedirect: React.FC = () => {
  const { courseId, path } = useParams<{ courseId: string; path: string }>();
  return <Navigate to={`/tnc/\${courseId}/\${path}`} replace />;
};

const AppRoutes: React.FC = () => {
  const navigate = useNavigate();
  const { t, tString } = useTypedTranslation();
  // AuthContext 사용 - 중복 인증 로직 제거
  const { isAuthenticated, userAttributes, loading } = useAuth();

  // 로딩 중 화면
  if (loading) {
    return <LoadingScreen message={tString('common.loading')} />;
  }

  // 강사 전용 라우트를 위한 래퍼 컴포넌트
  const InstructorRoute = ({ children }: { children: React.ReactNode }) => (
    <ProtectedRoute
      authenticated={isAuthenticated}
      redirectPath="/signin"
      requiredRole="instructor"
      userAttributes={userAttributes}
    >
      {children}
    </ProtectedRoute>
  );

  // 관리자 전용 라우트를 위한 래퍼 컴포넌트
  const AdminRoute = ({ children }: { children: React.ReactNode }) => (
    <ProtectedRoute
      authenticated={isAuthenticated}
      redirectPath="/signin"
      requiredRole="admin"
      userAttributes={userAttributes}
    >
      {children}
    </ProtectedRoute>
  );

  return (
    <Routes>
      {/* 인증 페이지 라우트 */}
      <Route path="/signin" element={
        isAuthenticated ?
          (userAttributes?.profile === 'admin' ?
            <Navigate to="/admin" /> :
            userAttributes?.profile === 'instructor' ?
            <Navigate to="/instructor/dashboard" /> :
            <Navigate to="/tnc" />
          ) :
          <AuthLayout><SignIn /></AuthLayout>
      } />
      
      <Route path="/signup" element={
        isAuthenticated ? <Navigate to="/" /> : <AuthLayout><SignUp /></AuthLayout>
      } />
      
      <Route path="/confirm-signup" element={
        isAuthenticated ? <Navigate to="/" /> : <AuthLayout><ConfirmSignUp /></AuthLayout>
      } />
      
      <Route path="/forgot-password" element={
        isAuthenticated ? <Navigate to="/" /> : <AuthLayout><ForgotPassword /></AuthLayout>
      } />
      
      <Route path="/new-password" element={
        isAuthenticated ? <Navigate to="/" /> : <AuthLayout><NewPassword /></AuthLayout>
      } />

      {/* 공개 과정 라우트 */}
      <Route path="/tnc" element={
        <MainLayout>
          <CourseList />
        </MainLayout>
      } />

      {/* 과정 상세 페이지 */}
      <Route path="/tnc/:courseId" element={
        <MainLayout>
          <CourseHome />
        </MainLayout>
      } />

      {/* 교육생 기능용 라우트 */}
      <Route path="/tnc/:courseId/survey" element={<MainLayout><SurveyPage /></MainLayout>} />
      <Route path="/tnc/:courseId/pre-quiz" element={<MainLayout><PreQuizPage /></MainLayout>} />
      <Route path="/tnc/:courseId/post-quiz" element={<MainLayout><PostQuizPage /></MainLayout>} />
      
      {/* 직접 평가 페이지 접근 라우트 */}
      <Route path="/pre-quiz/:id" element={<PreQuizPage />} />
      <Route path="/post-quiz/:id" element={<PostQuizPage />} />
      <Route path="/survey/:id" element={<SurveyPage />} />

      {/* 루트 리디렉션 */}
      <Route
        path="/"
        element={
          authenticated ? (
            userAttributes?.profile === 'admin' ? (
              <Navigate to="/admin" />
            ) : userAttributes?.profile === 'instructor' ? (
              <Navigate to="/instructor/dashboard" />
            ) : (
              <Navigate to="/tnc" />
            )
          ) : (
            <Navigate to="/tnc" />
          )
        }
      />

      {/* 필수 리디렉션 - 이전 URL 구조를 새 URL 구조로 변경 (최소한으로 유지) */}
      <Route path="/courses" element={<Navigate to="/tnc" replace />} />
      
      {/* 강사용 페이지 */}
      <Route path="/instructor">
        {/* 대시보드 */}
        <Route path="dashboard" element={
          <InstructorRoute>
            <MainLayout title={tString('nav.dashboard')}>
              <Dashboard />
            </MainLayout>
          </InstructorRoute>
        } />

        {/* 과정 관리 */}
        <Route path="courses" element={
          <InstructorRoute>
            <MainLayout title={tString('nav.course_management')}>
              <CoursesManagement />
            </MainLayout>
          </InstructorRoute>
        } />
        
        <Route path="courses/create" element={
          <InstructorRoute>
            <MainLayout title={tString('course.create_course')}>
              <CourseCreation />
            </MainLayout>
          </InstructorRoute>
        } />
        
        <Route path="courses/catalog" element={
          <InstructorRoute>
            <MainLayout title={tString('course.catalog')}>
              <CourseCatalog />
            </MainLayout>
          </InstructorRoute>
        } />

        {/* 평가 도구 관리 */}
        <Route path="assessments">
          <Route path="quiz" element={
            <InstructorRoute>
              <MainLayout title={tString('nav.quiz_management')}>
                <QuizManagement />
              </MainLayout>
            </InstructorRoute>
          } />
          
          <Route path="quiz-creator" element={
            <InstructorRoute>
              <MainLayout title={tString('assessment.create_quiz')}>
                <QuizCreator />
              </MainLayout>
            </InstructorRoute>
          } />
          
          <Route path="survey" element={
            <InstructorRoute>
              <MainLayout title={tString('nav.survey_management')}>
                <SurveyManagement />
              </MainLayout>
            </InstructorRoute>
          } />
          
          <Route path="survey-creator" element={
            <InstructorRoute>
              <MainLayout title={tString('assessment.create_survey')}>
                <SurveyCreator />
              </MainLayout>
            </InstructorRoute>
          } />
        </Route>

        {/* 분석 및 보고서 */}
        <Route path="analytics">
          <Route path="comparison" element={
            <InstructorRoute>
              <MainLayout title={tString('nav.comparison')}>
                <div>사전/사후 비교 분석</div>
              </MainLayout>
            </InstructorRoute>
          } />
          
          <Route path="reports" element={
            <InstructorRoute>
              <MainLayout title={tString('nav.reports')}>
                <ReportGenerator />
              </MainLayout>
            </InstructorRoute>
          } />
          
          <Route path="insights" element={
            <InstructorRoute>
              <MainLayout title={tString('nav.insights')}>
                <Analytics />
              </MainLayout>
            </InstructorRoute>
          } />
        </Route>
      </Route>

      {/* 관리자 라우트 */}
      <Route path="/admin" element={
        <AdminRoute>
          <MainLayout title={tString('nav.admin_page')}>
            <AdminPage />
          </MainLayout>
        </AdminRoute>
      } />
      
      {/* 404 라우트 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;