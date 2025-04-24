// src/components/AuthRequired.tsx
import React, { ReactNode } from 'react';
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
  children: ReactNode;
  fallback?: ReactNode;  // ReactNode 타입으로 명시
}

// JSX.Element 반환 타입 명시
export const AuthRequired = ({ 
  children, 
  fallback 
}: AuthRequiredProps): JSX.Element => {
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
    // fallback이 제공되면 사용하고, 아니면 기본 UI 렌더링
    if (fallback) {
      // React 노드로 명시적 캐스팅
      return <>{fallback}</>;
    }
    
    return (
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