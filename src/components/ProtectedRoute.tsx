import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
// MainLayout import 제거

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
  const location = useLocation();
  
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
  
  // MainLayout을 제거하고 자식 컴포넌트만 반환
  return <>{children}</>;
};

export default ProtectedRoute;