// src/components/auth/ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth'; // 경로를 실제 환경에 맞게 수정

// props 타입에 requiredRoles 추가
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[]; // 'admin', 'instructor' 같은 문자열 배열
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = [] // 기본값 빈 배열
}) => {
  const { isAuthenticated, loading, isAdmin, isInstructor } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (!isAuthenticated) {
    // 로그인 페이지로 리디렉션하면서 원래 접근하려던 경로 저장
    return <Navigate to="/login" state={{ from: location.pathname }} />;
  }

  // 역할 체크가 필요한 경우
  if (requiredRoles.length > 0) {
    // 사용자의 역할에 따라 접근 여부 결정
    const hasRequiredRole = (
      (requiredRoles.includes('admin') && isAdmin) || 
      (requiredRoles.includes('instructor') && isInstructor)
    );

    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;