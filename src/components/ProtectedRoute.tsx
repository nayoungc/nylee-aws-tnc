// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  authenticated: boolean | null;
  userAttributes: any;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  authenticated,
  userAttributes,
  requiredRole
}) => {
  if (authenticated === false) {
    return <Navigate to="/signin" replace />;
  }

  if (authenticated === null) {
    // 로딩 상태
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>인증 상태 확인 중...</div>
      </div>
    );
  }

  // 역할이 필요한 경우 확인
  if (requiredRole === 'instructor' && userAttributes?.profile !== 'instructor') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;