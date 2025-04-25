// src/components/AuthRequired.tsx
import React from 'react';
import { Box, Alert, SpaceBetween, Button } from '@cloudscape-design/components';
import { useAuth } from '../contexts/AuthContext';
import { useTypedTranslation } from '@utils/i18n-utils';

interface AuthRequiredProps {
  children: React.ReactNode;
  requiredRole?: string;
  fallback?: React.ReactNode;
}

export const AuthRequired: React.FC<AuthRequiredProps> = ({
  children,
  requiredRole,
  fallback
}) => {
  const { isAuthenticated, userRole, loading, loginRedirect } = useAuth();
  const { t } = useTypedTranslation();

  // 로딩 중이면 아무것도 표시하지 않음
  if (loading) {
    return null;
  }

  // 인증되지 않은 경우
  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <Box padding="m">
        <Alert type="info" header={t('common.auth_required') || "로그인 필요"}>
          <SpaceBetween direction="vertical" size="m">
            <div>{t('common.please_login') || "이 기능을 사용하려면 로그인이 필요합니다."}</div>
            <Button variant="primary" onClick={() => loginRedirect(window.location.pathname)}>
              {t('common.login') || "로그인하기"}
            </Button>
          </SpaceBetween>
        </Alert>
      </Box>
    );
  }
  
  // 역할이 필요하고 사용자 역할이 일치하지 않는 경우
  if (requiredRole && userRole !== requiredRole) {
    return (
      <Box padding="m">
        <Alert type="error" header={t('common.unauthorized') || "접근 권한 없음"}>
          {t('common.role_required', { role: requiredRole }) || 
            `이 페이지는 \${requiredRole} 권한이 필요합니다.`}
        </Alert>
      </Box>
    );
  }

  // 인증되고 권한도 있는 경우 children 렌더링
  return <>{children}</>;
};