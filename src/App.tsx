import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import '@cloudscape-design/global-styles/index.css';

// 레이아웃
import Header from './components/Header';

// 페이지
import Dashboard from './pages/Dashboard';
import StudentHome from './pages/StudentHome';
import Login from './pages/Login';

// 강사용 페이지
import CourseCatalog from './pages/instructor/CourseCatalog';
import MyCourses from './pages/instructor/MyCourses';
import SessionManagement from './pages/instructor/SessionManagement';
import PreQuizManagement from './pages/instructor/PreQuizManagement';
import PostQuizManagement from './pages/instructor/PostQuizManagement';
import SurveyManagement from './pages/instructor/SurveyManagement';
import AiGenerator from './pages/instructor/AiGenerator';

// Hooks
import { useAuth } from './hooks/useAuth';

// 권한 검사 컴포넌트
const ProtectedRoute = ({ 
  children, 
  requiredRole = null
}: { 
  children: React.ReactNode, 
  requiredRole?: string | null 
}) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user['custom:role'] !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  const { user } = useAuth();

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* 홈 페이지 - 역할에 따라 다른 대시보드 */}
        <Route path="/" element={
          user ? (
            user['custom:role'] === 'instructor' 
              ? <Navigate to="/dashboard" replace /> 
              : <Navigate to="/student" replace />
          ) : <Navigate to="/login" replace />
        } />

        {/* 강사용 라우트 */}
        <Route path="/dashboard" element={
          <ProtectedRoute requiredRole="instructor">
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/courses/catalog" element={
          <ProtectedRoute requiredRole="instructor">
            <CourseCatalog />
          </ProtectedRoute>
        } />
        
        <Route path="/courses/my-courses" element={
          <ProtectedRoute requiredRole="instructor">
            <MyCourses />
          </ProtectedRoute>
        } />
        
        <Route path="/courses/sessions" element={
          <ProtectedRoute requiredRole="instructor">
            <SessionManagement />
          </ProtectedRoute>
        } />

        <Route path="/assessments/pre-quiz" element={
          <ProtectedRoute requiredRole="instructor">
            <PreQuizManagement />
          </ProtectedRoute>
        } />

        <Route path="/assessments/post-quiz" element={
          <ProtectedRoute requiredRole="instructor">
            <PostQuizManagement />
          </ProtectedRoute>
        } />

        <Route path="/assessments/survey" element={
          <ProtectedRoute requiredRole="instructor">
            <SurveyManagement />
          </ProtectedRoute>
        } />

        <Route path="/assessments/ai-generator" element={
          <ProtectedRoute requiredRole="instructor">
            <AiGenerator />
          </ProtectedRoute>
        } />
        
        {/* 교육생용 라우트 */}
        <Route path="/student" element={
          <ProtectedRoute>
            <StudentHome />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
};

export default App;