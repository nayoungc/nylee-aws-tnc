// LoginPage.tsx
import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  SpaceBetween,
  Button,
  FormField,
  Input,
  Alert,
  Form,
} from '@cloudscape-design/components';
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

  // 로그인된 경우 리다이렉트
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/tnc');
    }
  }, [isAuthenticated, loading, navigate]);

  const handleSignIn = async () => {
    if (!username || !password) {
      setError(t('auth:fields_required'));
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      await login(username, password);
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
      <SpaceBetween direction="vertical" size="l">
        {/* 로고 및 제목 */}
        <Box textAlign="center" padding={{ bottom: 'l' }}>
          <img
            src="/images/aws.png" 
            alt="AWS Logo"
            style={{ 
              maxWidth: '150px', 
              marginBottom: '16px' 
            }}
          />
          <Box
            fontSize="heading-xl"
            fontWeight="heavy"
            color="text-label"
          >
            {t('auth:account_login')}
          </Box>
          <Box
            fontSize="body-m"
            color="text-body-secondary"
            padding={{ top: 's' }}
          >
            {t('auth:sign_in_to_continue')}
          </Box>
        </Box>

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
        <Form
          actions={
            <SpaceBetween direction="vertical" size="xs">
              <Button
                variant="primary"
                loading={isLoading}
                onClick={handleSignIn}
                fullWidth
                // style={{ 
                //   height: '38px', 
                //   fontSize: '14px',
                //   boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                // }}
              >
                {t('auth:sign_in')}
              </Button>
            </SpaceBetween>
          }
        >
          <SpaceBetween size="l">
            <FormField 
              label={t('auth:username')}
              constraintText="Email address or username"
            >
              <Input
                type="text"
                value={username}
                onChange={({ detail }) => setUsername(detail.value)}
                onKeyDown={({ detail }) => {
                  if (detail.key === 'Enter') {
                    const passwordInput = document.querySelector('input[type="password"]');
                    if (passwordInput) (passwordInput as HTMLElement).focus();
                  }
                }}
                autoFocus
                placeholder="Enter your username"
              />
            </FormField>

            <FormField 
              label={t('auth:password')}
              info={
                <Link 
                  to="/forgot-password" 
                  style={{
                    textDecoration: 'none',
                    color: '#0972d3',
                    fontSize: '13px'
                  }}
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
                placeholder="Enter your password"
              />
            </FormField>
          </SpaceBetween>
        </Form>

        <Box padding={{ top: 's', bottom: 's' }}>
  <hr style={{
    border: 'none',
    borderTop: '1px solid #e9ebed',
    margin: '0'
  }} />
</Box>

        {/* 계정 생성 링크 */}
        {/* <Box textAlign="center">
          <Box fontSize="body-m" color="text-body-secondary">
            {t('auth:no_account')}{' '}
            <Link
              to="/register"
              style={{
                textDecoration: 'none',
                color: '#0972d3',
                fontWeight: '500'
              }}
            >
              {t('auth:create_account')}
            </Link>
          </Box>
        </Box> */}
      </SpaceBetween>
    </AuthLayout>
  );
};

export default LoginPage;