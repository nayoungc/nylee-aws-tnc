import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppLayout,
  Box,
  Container,
  ContentLayout,
  Header,
  SpaceBetween,
  Grid,
} from '@cloudscape-design/components';
import LoginForm from '@components/auth/LoginForm';
import { useAuth } from '../../hooks/useAuth';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  // 이미 로그인한 경우 홈 페이지로 리다이렉트
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleLoginSuccess = () => {
    navigate('/');
  };

  return (
    <AppLayout
      content={
        <ContentLayout>
          <SpaceBetween size="l">
            <Container>
              <Grid
                gridDefinition={[{ colspan: { default: 12, xs: 10, s: 8, m: 6, l: 6 }, offset: { default: 0, xs: 1, s: 2, m: 3, l: 3 } }]}
              >
                <SpaceBetween size="xl">
                  <Box textAlign="center" padding={{ top: 'xl', bottom: 'l' }}>
                    <Header variant="h1" description="AWS T&C 교육 정보 사이트">
                      관리자 로그인
                    </Header>
                  </Box>
                  
                  <LoginForm onLoginSuccess={handleLoginSuccess} />
                  
                  <Box textAlign="center">
                    <a href="/quiz/start">퀴즈 참여하기</a>
                    {' | '}
                    <a href="/survey/start">설문조사 참여하기</a>
                  </Box>
                </SpaceBetween>
              </Grid>
            </Container>
          </SpaceBetween>
        </ContentLayout>
      }
      navigationHide
      toolsHide
    />
  );
};

export default LoginPage;