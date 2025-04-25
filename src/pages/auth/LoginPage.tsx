// src/pages/auth/LoginPage.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppLayout,
  Box,
  ContentLayout,
  Grid,
  SpaceBetween,
  Link,
} from '@cloudscape-design/components';
import LoginForm from '@/components/auth/LoginForm';
import TopNavigationHeader from '@layouts/TopNavigationHeader';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import './LoginPage.css'; // 스타일 추가

const LoginPage: React.FC = () => {
  const { t } = useTranslation(['auth', 'common']);
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  // 이미 로그인한 경우 홈 페이지로 리다이렉트
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/');
    }
  }, [isAuthenticated, loading, navigate]);

  const handleLoginSuccess = () => {
    navigate('/');
  };

  return (
    <>
      <div id="top-navigation">
        <TopNavigationHeader />
      </div>
      
      <div className="login-page-container">
        <ContentLayout disableOverlap>
          <Grid
            gridDefinition={[{ 
              colspan: { default: 12, xs: 10, s: 8, m: 6, l: 4 }, 
              offset: { default: 0, xs: 1, s: 2, m: 3, l: 4 } 
            }]}
          >
            <Box 
              padding="l" 
              className="login-card"
            >
              <SpaceBetween size="xl">
                <Box textAlign="center" padding={{ bottom: 'l' }}>
                  <img
                    src="/assets/aws-logo.svg"
                    alt="AWS Logo"
                    className="aws-logo"
                  />
                </Box>
                
                <LoginForm onLoginSuccess={handleLoginSuccess} />
                
                <Box textAlign="center" color="text-body-secondary">
                  <SpaceBetween size="s" direction="horizontal">
                    <Link href="/quiz/start">{t('auth:quiz_participation')}</Link>
                    <Box color="text-body-secondary" fontSize="body-s">|</Box>
                    <Link href="/survey/start">{t('auth:survey_participation')}</Link>
                  </SpaceBetween>
                </Box>
              </SpaceBetween>
            </Box>
          </Grid>
        </ContentLayout>
      </div>
    </>
  );
};

export default LoginPage;