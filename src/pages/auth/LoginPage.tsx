import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppLayout,
  Box,
  ContentLayout,
  Grid,
  SpaceBetween,
  Link,
  Container,
  Header
} from '@cloudscape-design/components';
import LoginForm from '@/components/auth/LoginForm';
import TopNavigationHeader from '@/components/layout/TopNavigationHeader';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';

const LoginPage: React.FC = () => {
  const { t } = useTranslation(['auth', 'common']);
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/');
    }
  }, [isAuthenticated, loading, navigate]);

  const handleLoginSuccess = () => {
    navigate('/');
  };

  return (
    <div>
      <div style={{ paddingBottom: 'var(--space-l)', borderBottom: '1px solid var(--color-border-divider)' }}>
        <TopNavigationHeader />
      </div>
      
      <div 
        style={{
          padding: 'var(--space-xxxl)',
          minHeight: 'calc(100vh - 70px)',
          background: 'linear-gradient(to bottom, #f2f8fd, #e4f0f9)',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <ContentLayout disableOverlap>
          <Grid
            gridDefinition={[{ 
              colspan: { default: 12, xs: 10, s: 8, m: 6, l: 4 }, 
              offset: { default: 0, xs: 1, s: 2, m: 3, l: 4 } 
            }]}
          >
            <Container
              header={
                <Box padding={{ top: 'l', bottom: 'l' }} textAlign="center">
                  <img
                    src="/assets/aws-logo.svg"
                    alt="AWS Logo"
                    style={{ 
                      maxWidth: '180px', 
                      height: 'auto'
                    }}
                  />
                </Box>
              }
              footer={
                <Box textAlign="center" color="text-body-secondary" padding={{ top: 's', bottom: 's' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Link href="/quiz/start" fontSize="body-s">{t('auth:quiz_participation')}</Link>
                    <Box color="text-body-secondary" fontSize="body-s" padding={{ horizontal: 'xs' }}>|</Box>
                    <Link href="/survey/start" fontSize="body-s">{t('auth:survey_participation')}</Link>
                  </div>
                </Box>
              }
            >
              <div style={{
                padding: 'var(--space-l)',
                backgroundColor: 'var(--color-background-paper)',
                borderRadius: 'var(--border-radius-container)',
                boxShadow: 'var(--shadow-container)'
              }}>
                <LoginForm onLoginSuccess={handleLoginSuccess} />
              </div>
            </Container>

            <Box textAlign="center" padding={{ top: 'l' }}>
              <Box fontSize="body-s" color="text-body-secondary">
                {t('common:footer.copyright', { year: new Date().getFullYear() })}
              </Box>
            </Box>
          </Grid>
        </ContentLayout>
      </div>
    </div>
  );
};

export default LoginPage;