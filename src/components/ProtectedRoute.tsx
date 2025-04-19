// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  authenticated: boolean | null;
  userAttributes: any;
  requiredRole?: string;
  children: React.ReactNode; // element 대신 children 사용
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  authenticated,
  userAttributes,
  requiredRole,
  children
}) => {
  // 인증되지 않은 경우
  if (!authenticated) {
    return <Navigate to="/signin" />;
  }

  // 역할 검사가 필요하고 역할이 일치하지 않는 경우
  if (requiredRole && userAttributes?.profile !== requiredRole) {
    return <Navigate to="/" />;
  }

  // 모든 조건 충족 시 자식 컴포넌트 렌더링
  return <>{children}</>;
};

export default ProtectedRoute;