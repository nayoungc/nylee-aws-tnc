// src/components/ProtectedRoute.tsx 수정
import React from 'react';
import { Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

interface ProtectedRouteProps {
  authenticated: boolean | null;
  redirectPath: string;
  children: React.ReactNode;
  requiredRole?: string;
  userAttributes?: any;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  authenticated,
  redirectPath,
  children,
  requiredRole,
  userAttributes
}) => {
  // 인증 검사
  if (!authenticated) {
    return <Navigate to={redirectPath} replace />;
  }
  
  // 역할 검사 (필요한 경우)
  if (requiredRole) {
    const userRole = userAttributes?.profile;
    if (requiredRole === 'admin' && userRole !== 'admin') {
      return <Navigate to="/dashboard" replace />;
    }
    if (requiredRole === 'instructor' && 
        userRole !== 'instructor' && userRole !== 'admin') {
      return <Navigate to="/courses" replace />;
    }
  }
  
  // /admin 경로는 MainLayout을 적용하지 않음
  if (location.pathname === '/admin') {
    return <>{children}</>;
  }
  
  // 다른 모든 보호된 경로에 MainLayout 적용
  return <MainLayout>{children}</MainLayout>;
};

export default ProtectedRoute;