// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import MainLayout from '@layouts/MainLayout';
import LoginPage from '@pages/auth/LoginPage';
import HomePage from '@pages/HomePage';
// import QuizzesPage from './pages/QuizzesPage';
// import SurveysPage from './pages/SurveysPage';

// i18n 설정 임포트
import './i18n';

// Cloudscape 글로벌 스타일
import '@cloudscape-design/global-styles/index.css';

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* 로그인 페이지 */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* 메인 레이아웃을 사용하는 페이지들 */}
          <Route path="/" element={
            <MainLayout>
              <HomePage />
            </MainLayout>
          } />
          {/* <Route path="/quizzes" element={
            <MainLayout activeHref="/quizzes">
              <QuizzesPage />
            </MainLayout>
          } />
          <Route path="/surveys" element={
            <MainLayout activeHref="/surveys">
              <SurveysPage />
            </MainLayout>
          } /> */}
        </Routes>
      </Router>
    </AppProvider>
  );
};

export default App;