// src/components/auth/ProtectedRoute.tsx
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = []
}) => {
  const { isAuthenticated, loading, getUserRoles, checkAuth } = useAuth();
  const location = useLocation();

  // 컴포넌트가 마운트될 때 인증 상태 재확인
  useEffect(() => {
    const verifyAuth = async () => {
      await checkAuth();
    };
    verifyAuth();
  }, [checkAuth]);

  console.log('Protected route check:', {
    path: location.pathname,
    isAuthenticated,
    requiredRoles,
    loading
  });

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
      }}>
        <div className="spinner"></div>
        <p>인증 확인 중...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // 원래 접근하려던 경로 저장
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // 역할 체크가 필요한 경우
  if (requiredRoles.length > 0) {
    const userRoles = getUserRoles();
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

    if (!hasRequiredRole) {
      console.log('접근 권한 없음: 필요한 역할', requiredRoles, '사용자 역할', userRoles);
      return <Navigate to="/home" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;