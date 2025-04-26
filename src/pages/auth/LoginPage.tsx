// src/pages/auth/LoginPage.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// CloudScape 컴포넌트 개별적으로 가져오기
import Container from '@cloudscape-design/components/container';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Link from '@cloudscape-design/components/link';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Checkbox from '@cloudscape-design/components/checkbox';
import Alert from '@cloudscape-design/components/alert';
import Icon from '@cloudscape-design/components/icon';

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

  return (
    <AuthLayout>
      <div style={{ maxWidth: '480px', margin: '0 auto', width: '100%' }}>
        <Container
          media={{
            content: (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f6f6f6', height: '100%' }}>
                <img
                  src="/images/aws.png"
                  alt="AWS Logo"
                  style={{ maxWidth: '180px', maxHeight: '70%' }}
                />
              </div>
            ),
            height: 180,
            position: "top"
          }}
          footer={
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '0 8px'
            }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <Link href="#en" onFollow={() => {/* 언어 변경 로직 */}}>English</Link>
                <Link href="#ko" onFollow={() => {/* 언어 변경 로직 */}}>한국어</Link>
                <Link href="#ja" onFollow={() => {/* 언어 변경 로직 */}}>日本語</Link>
              </div>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px',
                fontSize: '12px',
                color: 'var(--color-text-body-secondary)'
              }}>
                <Icon
                  name="lock-private"
                  size="small"
                  variant="subtle"
                />
                <span>{t('auth:secure_connection')}</span>
              </div>
            </div>
          }
          header={
            <SpaceBetween direction="vertical" size="xxs">
              <Box textAlign="center" variant="h1">{t('auth:account_login')}</Box>
              <Box textAlign="center" variant="small" color="text-body-secondary">
                {t('auth:sign_in_to_continue')}
              </Box>
            </SpaceBetween>
          }
        >
          <SpaceBetween direction="vertical" size="l">
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

            <SpaceBetween direction="vertical" size="l">
              {/* 사용자명 필드 */}
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

              {/* 비밀번호 필드 */}
              <FormField 
                label={t('auth:password')}
                info={
                  <Link
                    href="/forgot-password"
                  >
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
              
              {/* 아이디 기억하기 체크박스 */}
              <Checkbox
                checked={rememberMe}
                onChange={({ detail }) => setRememberMe(detail.checked)}
              >
                {t('auth:remember_me')}
              </Checkbox>
            </SpaceBetween>

            <SpaceBetween direction="vertical" size="m">
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
                  <Link
                    href="/register"
                  >
                    {t('auth:create_account')}
                  </Link>
                </span>
              </Box>
            </SpaceBetween>
          </SpaceBetween>
        </Container>
        
        {/* 저작권 정보 */}
        <Box textAlign="center" margin={{ top: 's' }} color="text-body-secondary" fontSize="body-s">
          &copy; {new Date().getFullYear()} Your Company. All rights reserved.
        </Box>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;