import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import '@cloudscape-design/global-styles/index.css';
import '@aws-amplify/ui-react/styles.css';

// 레이아웃
import Header from './components/Header';

// 인증 컴포넌트
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import ConfirmSignUp from './components/ConfirmSignUp';
import ProtectedRoute from './components/ProtectedRoute';

// 페이지
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
import { Amplify } from 'aws-amplify';
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';

const App: React.FC = () => {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [userAttributes, setUserAttributes] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 인증 상태 확인
  useEffect(() => {
    async function checkAuthState() {
      try {
        // 현재 사용자 정보 가져오기
        const user = await getCurrentUser();
        const attributes = await fetchUserAttributes();
        
        setAuthenticated(true);
        setUserAttributes(attributes);
      } catch (error) {
        console.log('사용자가 로그인하지 않았습니다', error);
        setAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuthState();
  }, []);

  // 로딩 중 표시
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>로딩 중...</div>
      </div>
    );
  }

  return (
    <Router>
      {/* 로그인한 경우에만 헤더 표시 */}
      {authenticated && <Header />}
      
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
              (userAttributes?.email?.endsWith('@amazon.com') ? 
                <Navigate to="/dashboard" /> : 
                <Navigate to="/student" />)
          } 
        />

        {/* 강사용 라우트 */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute requiredRole="instructor">
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/courses/catalog" 
          element={
            <ProtectedRoute requiredRole="instructor">
              <CourseCatalog />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/courses/my-courses" 
          element={
            <ProtectedRoute requiredRole="instructor">
              <MyCourses />
            </ProtectedRoute>
          }
        />
        
        <Route 
          path="/courses/sessions" 
          element={
            <ProtectedRoute requiredRole="instructor">
              <SessionManagement />
            </ProtectedRoute>
          }
        />

        <Route 
          path="/assessments/pre-quiz" 
          element={
            <ProtectedRoute requiredRole="instructor">
              <PreQuizManagement />
            </ProtectedRoute>
          }
        />

        <Route 
          path="/assessments/post-quiz" 
          element={
            <ProtectedRoute requiredRole="instructor">
              <PostQuizManagement />
            </ProtectedRoute>
          }
        />

        <Route 
          path="/assessments/survey" 
          element={
            <ProtectedRoute requiredRole="instructor">
              <SurveyManagement />
            </ProtectedRoute>
          }
        />

        <Route 
          path="/assessments/ai-generator" 
          element={
            <ProtectedRoute requiredRole="instructor">
              <AiGenerator />
            </ProtectedRoute>
          }
        />
        
        {/* 교육생용 라우트 */}
        <Route 
          path="/student" 
          element={
            <ProtectedRoute>
              <StudentHome />
            </ProtectedRoute>
          }
        />

        {/* 404 페이지 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;