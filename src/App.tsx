// app/App.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@cloudscape-design/components';
import TopNavigationHeader from '@/components/layout/TopNavigationHeader';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import LoginPage from '@/pages/LoginPage';
import HomePage from '@/pages/HomePage';
import { useAuth } from '@/hooks/useAuth';

// 알림 컨텍스트 및 공급자 임포트
import { NotificationProvider, useNotification } from '@/contexts/NotificationContext';

// 알림을 표시하는 컴포넌트
const NotificationSystem: React.FC = () => {
  const { notifications, dismissNotification } = useNotification();
  
  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <div 
          key={notification.id} 
          className={`notification notification-\${notification.type}`}
        >
          {notification.content}
          {notification.dismissible && (
            <button onClick={() => dismissNotification(notification.id)}>
              닫기
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

// 메인 레이아웃 컴포넌트
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <div id="top-navigation">
        <TopNavigationHeader />
      </div>
      <NotificationSystem />
      {children}
    </>
  );
};

const App: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  
  return (
    <NotificationProvider>
      <MainLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* 어드민 라우트 그룹 - 관리자 권한 체크는 AdminProtectedRoute에서 처리 */}
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/courses" element={<Navigate to="/admin" replace state={{ activeTab: 'courses' }} />} />
          <Route path="/admin/customers" element={<Navigate to="/admin" replace state={{ activeTab: 'customers' }} />} />
          <Route path="/admin/instructors" element={<Navigate to="/admin" replace state={{ activeTab: 'instructors' }} />} />
          
          {/* 404 페이지 리다이렉션 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    </NotificationProvider>
  );
};

export default App;