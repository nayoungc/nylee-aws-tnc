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
import { useAppTranslation } from '@/hooks/useAppTranslation';
import AuthLayout from '@components/layout/AuthLayout';

const LoginPage: React.FC = () => {
  const { t, i18n } = useAppTranslation();
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
      setError(t('fields_required'));
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
      
      setSuccessMessage(t('login_success_redirecting'));
      
      setTimeout(() => {
        navigate('/tnc');
      }, 800);
    } catch (err: any) {
      setError(err.message || t('login_error_generic'));
    } finally {
      setIsLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <AuthLayout titleKey="account_login">
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
                  src="/assets/aws.png"
                  alt={t('app_logo_alt')}
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
                <Box>{t('secure_connection')}</Box>
                <Box margin={{ left: 'm' }}>
                  &copy; {currentYear} Amazon Web Services, Inc.
                </Box>
              </SpaceBetween>
            </Box>
          }
          header={
            <Box textAlign="center" padding={{ top: 's', bottom: 'xs' }}>
              <Box variant="h1" padding={{ bottom: 'xxs' }}>
                {t('account_login')}
              </Box>
              <Box variant="p" color="text-body-secondary">
                {t('sign_in_to_continue')}
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
                label={t('username')}
                constraintText={t('username_constraint')}
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
                  placeholder={t('username_placeholder')}
                />
              </FormField>

              <FormField 
                label={t('password')}
                info={
                  <Link href="/forgot-password">
                    {t('forgot_password')}
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
                  placeholder={t('password_placeholder')}
                />
              </FormField>
              
              <Checkbox
                checked={rememberMe}
                onChange={({ detail }) => setRememberMe(detail.checked)}
              >
                {t('remember_me')}
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
                {t('sign_in')}
              </Button>
              
              {/* 계정 생성 링크 */}
              <Box textAlign="center">
                <span style={{ fontSize: '14px', color: 'var(--color-text-body-secondary)' }}>
                  {t('no_account')}{' '}
                  <Link href="/register">
                    {t('create_account')}
                  </Link>
                </span>
              </Box>
            </SpaceBetween>

            {/* 언어 선택 */}
            <Box textAlign="center" padding={{ top: 's', bottom: 's' }}>
              <SpaceBetween direction="horizontal" size="xs">
                <Link href="#en" onFollow={() => i18n.changeLanguage('en')}>
                  {t('language_english')}
                </Link>
                <Link href="#ko" onFollow={() => i18n.changeLanguage('ko')}>
                  {t('language_korean')}
                </Link>
                <Link href="#ja" onFollow={() => i18n.changeLanguage('ja')}>
                  {t('language_japanese')}
                </Link>
              </SpaceBetween>
            </Box>
          </SpaceBetween>
        </Container>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;