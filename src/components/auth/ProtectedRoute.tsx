import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Spinner } from '@cloudscape-design/components';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'instructor')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = ['admin', 'instructor'] 
}) => {
  const { isAuthenticated, isLoading, isAdmin, isInstructor } = useAuth();
  
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spinner size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 역할 기반 접근 제어
  const hasRequiredRole = (
    (allowedRoles.includes('admin') && isAdmin) || 
    (allowedRoles.includes('instructor') && isInstructor)
  );

  if (!hasRequiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;