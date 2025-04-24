// src/components/AuthRequired.tsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Box,
  Spinner,
  Alert,
  Button,
  SpaceBetween
} from '@cloudscape-design/components';

interface AuthRequiredProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AuthRequired: React.FC<AuthRequiredProps> = ({ 
  children, 
  fallback 
}) => {
  const { isAuthenticated, loading, loginRedirect } = useAuth();
  
  if (loading) {
    return (
      <Box padding="l" textAlign="center">
        <Spinner size="large" />
        <Box padding="s">인증 상태 확인 중...</Box>
      </Box>
    );
  }
  
  if (!isAuthenticated) {
    return fallback || (
      <Container>
        <Alert type="info" header="로그인 필요">
          <SpaceBetween direction="vertical" size="m">
            <Box>
              이 기능을 사용하려면 로그인이 필요합니다.
            </Box>
            <Button variant="primary" onClick={() => loginRedirect()}>
              로그인하기
            </Button>
          </SpaceBetween>
        </Alert>
      </Container>
    );
  }
  
  return <>{children}</>;
};