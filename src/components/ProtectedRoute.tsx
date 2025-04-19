import React, { useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

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
    // 이미 리디렉션 중인지 확인
    const isRedirecting = useRef(false);
    
    if (!isRedirecting.current) {
      isRedirecting.current = true;
      return <Navigate to={redirectPath} replace />;
    }
    return null;
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