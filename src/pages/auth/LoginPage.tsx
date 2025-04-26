// src/pages/auth/LoginPage.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// CloudScape 컴포넌트 개별적으로 가져오기
import SpaceBetween from '@cloudscape-design/components/space-between';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Link from '@cloudscape-design/components/link';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Checkbox from '@cloudscape-design/components/checkbox';
import Alert from '@cloudscape-design/components/alert';
import Icon from '@cloudscape-design/components/icon';
import Container from '@cloudscape-design/components/container';

import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import AuthLayout from '@components/layout/AuthLayout';

const LoginPage: React.FC = () => {
  const { t } = useTranslation(['auth', 'common']);
  const navigate = useNavigate();
  const { isAuthenticated, loading, login } = useAuth();

  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [rememberMe, setRememberMe] = React.useState(false);

  // 로그인된 경우 리다이렉트
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/tnc');
    }
  }, [isAuthenticated, loading, navigate]);

  // 아이디 기억하기 기능
  useEffect(() => {
    const savedUsername = localStorage.getItem('rememberedUsername');
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

  const handleSignIn = async () => {
    if (!username || !password) {
      setError(t('auth:fields_required'));
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      await login(username, password);
      
      // 아이디 기억하기 처리
      if (rememberMe) {
        localStorage.setItem('rememberedUsername', username);
      } else {
        localStorage.removeItem('rememberedUsername');
      }
      
      setSuccessMessage(t('auth:login_success_redirecting'));
      
      setTimeout(() => {
        navigate('/tnc');
      }, 800);
    } catch (err: any) {
      setError(err.message || t('auth:login_error_generic'));
    } finally {
      setIsLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <AuthLayout>
      <div style={{ width: '100%', maxWidth: '480px', padding: '20px' }}>
        <Container
          media={{
            content: (
              <div style={{ 
                background: '#232F3E', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                padding: '40px 0' 
              }}>
                <img
                  src="/assets/aws-login-logo.png"
                  alt="AWS Logo"
                  style={{ 
                    width: '120px',
                    height: 'auto'
                  }}
                />
              </div>
            ),
            height: 140,
            position: "top"
          }}
          footer={
            <Box 
              fontSize="body-s" 
              color="text-body-secondary"
              textAlign="center"
              padding="s"
            >
              <SpaceBetween direction="horizontal" size="xs" alignItems="center">
                <Icon name="lock-private" size="small" />
                <Box>{t('auth:secure_connection')}</Box>
                <Box margin={{ left: 'm' }}>
                  &copy; {currentYear} Amazon Web Services, Inc.
                </Box>
              </SpaceBetween>
            </Box>
          }
          header={
            <Box textAlign="center" padding={{ top: 's', bottom: 'xs' }}>
              <Box variant="h1" padding={{ bottom: 'xxs' }}>
                {t('auth:account_login')}
              </Box>
              <Box variant="p" color="text-body-secondary">
                {t('auth:sign_in_to_continue')}
              </Box>
            </Box>
          }
        >
          <SpaceBetween size="l">
            {/* 알림 메시지 */}
            {successMessage && (
              <Alert type="success" dismissible onDismiss={() => setSuccessMessage(null)}>
                {successMessage}
              </Alert>
            )}

            {error && (
              <Alert type="error" dismissible onDismiss={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* 로그인 폼 */}
            <SpaceBetween size="l">
              <FormField 
                label={t('auth:username')}
                constraintText={t('auth:username_constraint')}
              >
                <Input
                  value={username}
                  onChange={({ detail }) => setUsername(detail.value)}
                  onKeyDown={({ detail }) => {
                    if (detail.key === 'Enter') {
                      const passwordInput = document.querySelector('input[type="password"]');
                      if (passwordInput) (passwordInput as HTMLElement).focus();
                    }
                  }}
                  autoFocus
                  placeholder={t('auth:username_placeholder')}
                />
              </FormField>

              <FormField 
                label={t('auth:password')}
                info={
                  <Link href="/forgot-password">
                    {t('auth:forgot_password')}
                  </Link>
                }
              >
                <Input
                  type="password"
                  value={password}
                  onChange={({ detail }) => setPassword(detail.value)}
                  onKeyDown={({ detail }) => {
                    if (detail.key === 'Enter') handleSignIn();
                  }}
                  placeholder={t('auth:password_placeholder')}
                />
              </FormField>
              
              <Checkbox
                checked={rememberMe}
                onChange={({ detail }) => setRememberMe(detail.checked)}
              >
                {t('auth:remember_me')}
              </Checkbox>

              {/* 로그인 버튼 */}
              <Button
                variant="primary"
                loading={isLoading}
                onClick={handleSignIn}
                iconAlign="right" 
                iconName="angle-right"
                fullWidth
              >
                {t('auth:sign_in')}
              </Button>
              
              {/* 계정 생성 링크 */}
              <Box textAlign="center">
                <span style={{ fontSize: '14px', color: 'var(--color-text-body-secondary)' }}>
                  {t('auth:no_account')}{' '}
                  <Link href="/register">
                    {t('auth:create_account')}
                  </Link>
                </span>
              </Box>
            </SpaceBetween>

            {/* 언어 선택 */}
            <Box textAlign="center" padding={{ top: 's', bottom: 's' }}>
              <SpaceBetween direction="horizontal" size="xs">
                <Link href="#en">English</Link>
                <Link href="#ko">한국어</Link>
                <Link href="#ja">日本語</Link>
              </SpaceBetween>
            </Box>
          </SpaceBetween>
        </Container>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;