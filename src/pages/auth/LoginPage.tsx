import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  ContentLayout,
  Grid,
  Link
} from '@cloudscape-design/components';
import LoginForm from '@/components/auth/LoginForm';
import TopNavigationHeader from '@/components/layout/TopNavigationHeader';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';

const LoginPage: React.FC = () => {
  const { t } = useTranslation(['auth', 'common']);
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

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
      {/* 헤더 영역 */}
      <div style={{ 
        paddingBottom: 'var(--space-l)',
        borderBottom: '1px solid var(--color-border-divider)',
        backgroundColor: '#232f3e',
        boxShadow: '0 2px 10px rgba(0,0,0,0.15)'
      }}>
        <TopNavigationHeader />
      </div>
      
      {/* 메인 콘텐츠 */}
      <div style={{
        position: 'relative',
        minHeight: 'calc(100vh - 70px)',
        overflow: 'hidden'
      }}>
        {/* 배경 효과 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, #f7f9fc 0%, #e3edf7 40%, #d7e9f7 100%)',
          zIndex: -2
        }} />
        
        {/* 추가 배경 장식 */}
        <div style={{
          position: 'absolute',
          top: '5%',
          right: '5%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,127,215,0.05) 0%, rgba(0,127,215,0) 70%)',
          zIndex: -1
        }} />
        
        <div style={{
          position: 'absolute',
          bottom: '5%',
          left: '10%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,153,0,0.05) 0%, rgba(255,153,0,0) 70%)',
          zIndex: -1
        }} />
        
        {/* 컨텐츠 영역 */}
        <div style={{
          padding: 'var(--space-xxxl) var(--space-l)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'inherit'
        }}>
          <ContentLayout disableOverlap>
            <Grid
              gridDefinition={[{ 
                colspan: { default: 12, xs: 10, s: 8, m: 6, l: 4 }, 
                offset: { default: 0, xs: 1, s: 2, m: 3, l: 4 } 
              }]}
            >
              {/* 메인 카드 */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.08), 0 1px 5px rgba(0,0,0,0.06)',
                overflow: 'hidden'
              }}>
                {/* 로고 헤더 */}
                <div style={{
                  backgroundColor: '#fff',
                  padding: 'var(--space-l)',
                  textAlign: 'center',
                  borderBottom: '1px solid var(--color-border-divider-subtle)'
                }}>
                  <img
                    src="/assets/aws-logo.svg"
                    alt="AWS Logo"
                    style={{ 
                      maxWidth: '160px',
                      height: 'auto'
                    }}
                  />
                </div>
                
                {/* 로그인 폼 */}
                <div style={{
                  padding: 'var(--space-l)',
                }}>
                  <LoginForm onLoginSuccess={handleLoginSuccess} />
                </div>
              </div>
              
              {/* 하단 링크 */}
              <div style={{
                marginTop: 'var(--space-l)',
                padding: 'var(--space-m)',
                borderRadius: '8px',
                backgroundColor: 'rgba(255,255,255,0.5)',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '12px'
              }}>
                <a href="/quiz/start" style={{
                  color: 'var(--color-text-link-default)',
                  fontSize: '14px',
                  textDecoration: 'none',
                  fontWeight: 500
                }}>
                  {t('auth:quiz_participation')}
                </a>
                <span style={{ color: 'var(--color-text-body-secondary)' }}>|</span>
                <a href="/survey/start" style={{
                  color: 'var(--color-text-link-default)',
                  fontSize: '14px',
                  textDecoration: 'none',
                  fontWeight: 500
                }}>
                  {t('auth:survey_participation')}
                </a>
              </div>
              
              {/* 푸터 */}
              <Box textAlign="center" padding={{ top: 'l' }}>
                <Box fontSize="body-s" color="text-body-secondary">
                  {t('common:footer.copyright', { year: new Date().getFullYear() })}
                </Box>
              </Box>
            </Grid>
          </ContentLayout>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;