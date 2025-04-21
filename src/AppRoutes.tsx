import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import {
  fetchAuthSession,
  getCurrentUser,
  fetchUserAttributes
} from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { useTranslation } from 'react-i18next';

// 인증 관련 컴포넌트
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import ConfirmSignUp from './components/ConfirmSignUp';
import ForgotPassword from './components/ForgotPassword';
import NewPassword from './components/NewPassword';
import ProtectedRoute from './components/ProtectedRoute';  // 이 임포트가 있는지 확인

import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import PreQuizPage from './pages/courses/PreQuizPage';
import PostQuizPage from './pages/courses/PostQuizPage';
import SurveyPage from './pages/courses/SurveyPage';
import Dashboard from './pages/instructor/Dashboard';
import AdminPage from './pages/admin/AdminPage';
import CourseHome from './pages/courses/CourseHome';
import CourseList from './pages/courses/CourseList';
import Analytics from './pages/instructor/Analytics';
import CourseCatalog from './pages/instructor/CourseCatalog';
import CourseCreation from './pages/instructor/CourseCreation';
import CoursesManagement from './pages/instructor/CoursesManagement';
import QuizCreator from './pages/instructor/QuizCreator';
import QuizManagement from './pages/instructor/QuizManagement';
import ReportGenerator from './pages/instructor/ReportGenerator';
import SurveyCreator from './pages/instructor/SurveyCreator';
import SurveyManagement from './pages/instructor/SurveyManagement';




// 컴포넌트 임포트...

const AppRoutes: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [userAttributes, setUserAttributes] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  // 인증 관련 코드...

  // 강사 전용 라우트를 위한 래퍼 컴포넌트
  const InstructorRoute = ({ children }: { children: React.ReactNode }) => (
    <ProtectedRoute
      authenticated={authenticated}
      redirectPath="/signin"
      requiredRole="instructor"
      userAttributes={userAttributes}
    >
      <MainLayout>{children}</MainLayout>
    </ProtectedRoute>
  );

  // 관리자 전용 라우트를 위한 래퍼 컴포넌트
  const AdminRoute = ({ children }: { children: React.ReactNode }) => (
    <ProtectedRoute
      authenticated={authenticated}
      redirectPath="/signin"
      requiredRole="admin"
      userAttributes={userAttributes}
    >
      <MainLayout>{children}</MainLayout>
    </ProtectedRoute>
  );

  return (
    <Routes>
      {/* 인증 페이지 라우트 */}
      <Route path="/signin" element={
        authenticated ?
          (userAttributes?.profile === 'admin' ?
            <Navigate to="/admin" /> :
            <Navigate to="/instructor/dashboard" />
          ) :
          <AuthLayout><SignIn /></AuthLayout>
      } />
      <Route path="/signup" element={
        authenticated ? <Navigate to="/" /> : <AuthLayout><SignUp /></AuthLayout>
      } />
      <Route path="/confirm-signup" element={
        authenticated ? <Navigate to="/" /> : <AuthLayout><ConfirmSignUp /></AuthLayout>
      } />
      <Route path="/forgot-password" element={
        authenticated ? <Navigate to="/" /> : <AuthLayout><ForgotPassword /></AuthLayout>
      } />
      <Route path="/new-password" element={
        authenticated ? <Navigate to="/" /> : <AuthLayout><NewPassword /></AuthLayout>
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
        <Route path="dashboard" element={<InstructorRoute><Dashboard /></InstructorRoute>} />

        {/* 과정 관리 */}
        <Route path="courses" element={<InstructorRoute><CoursesManagement /></InstructorRoute>} />
        <Route path="courses/create" element={<InstructorRoute><CourseCreation /></InstructorRoute>} />
        <Route path="courses/catalog" element={<InstructorRoute><CourseCatalog /></InstructorRoute>} />

        {/* 평가 도구 관리 */}
        <Route path="assessments">
          <Route path="quiz" element={<InstructorRoute><QuizManagement /></InstructorRoute>} />
          <Route path="quiz-creator" element={<InstructorRoute><QuizCreator /></InstructorRoute>} />
          <Route path="survey" element={<InstructorRoute><SurveyManagement /></InstructorRoute>} />
          <Route path="survey-creator" element={<InstructorRoute><SurveyCreator /></InstructorRoute>} />
        </Route>

        {/* 분석 및 보고서 */}
        <Route path="analytics">
          <Route path="comparison" element={<InstructorRoute><div>사전/사후 비교 분석</div></InstructorRoute>} />
          <Route path="reports" element={<InstructorRoute><ReportGenerator /></InstructorRoute>} />
          <Route path="insights" element={<InstructorRoute><Analytics /></InstructorRoute>} />
        </Route>
      </Route>

      {/* 관리자 라우트 */}
      <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
      
      {/* 최소한의 이전 URL 경로 리디렉션 */}
      <Route path="/dashboard" element={<Navigate to="/instructor/dashboard" replace />} />
      
      {/* 404 라우트 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
