// src/components/ProtectedRoute.tsx
import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  authenticated: boolean | null;
  redirectPath: string;
  children: ReactNode;
  requiredRole?: string;
  userAttributes?: Record<string, any>;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  authenticated, 
  redirectPath, 
  children,
  requiredRole,
  userAttributes
}) => {
  // 인증 여부 확인
  if (!authenticated) {
    return <Navigate to={redirectPath} replace />;
  }
  
  // 역할 검사 (필요한 경우)
  if (requiredRole && userAttributes) {
    const userRole = userAttributes.profile;
    if (userRole !== requiredRole) {
      return <Navigate to="/" replace />;
    }
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;