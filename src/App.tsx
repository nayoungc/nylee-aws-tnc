// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import Home from './pages/Home';
import ProtectedRoute from './components/auth/ProtectedRoute';
import '@cloudscape-design/global-styles/index.css';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* 교육생 접근 경로 */}
        <Route path="/quiz/start" element={<div>퀴즈 시작 페이지</div>} />
        <Route path="/survey/start" element={<div>설문조사 시작 페이지</div>} />
        
        {/* 인증이 필요한 경로 */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/courses" 
          element={
            <ProtectedRoute>
              <div>과정 관리 페이지</div>
            </ProtectedRoute>
          }
        />
        <Route 
          path="/quizzes" 
          element={
            <ProtectedRoute>
              <div>퀴즈 관리 페이지</div>
            </ProtectedRoute>
          }
        />
        <Route 
          path="/surveys" 
          element={
            <ProtectedRoute>
              <div>설문조사 관리 페이지</div>
            </ProtectedRoute>
          }
        />
        <Route 
          path="/users" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <div>사용자 관리 페이지 (관리자 전용)</div>
            </ProtectedRoute>
          }
        />
        <Route 
          path="/unauthorized" 
          element={<div>권한이 없습니다</div>} 
        />
        
        {/* 기본 리다이렉션 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;