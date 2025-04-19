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
  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  if (authenticated === false) {
    return <Navigate to="/signin" replace />;
  }

  // 인증 상태 로딩 중
  if (authenticated === null) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>인증 상태 확인 중...</div>
      </div>
    );
  }

  // 역할 검사 (강사 역할이 필요한 경우)
  if (requiredRole === 'instructor' && userAttributes?.profile !== 'instructor') {
    return <Navigate to="/" replace />;
  }

  // 모든 조건을 통과하면 자식 컴포넌트 렌더링
  return <>{children}</>;
};

export default ProtectedRoute;