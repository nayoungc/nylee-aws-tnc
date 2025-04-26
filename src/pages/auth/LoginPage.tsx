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
  Form
} from '@cloudscape-design/components';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import AuthLayout from '@components/layout/AuthLayout'; // 이 컴포넌트는 별도로 만들어야 함

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

  // AuthLayout 컴포넌트가 없다면 이 div로 대체하세요
  const AuthLayoutWrapper: React.FC<{children: React.ReactNode}> = ({ children }) => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: '#f2f3f3'
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 1px 4px 0 rgba(0, 0, 0, 0.1)',
        padding: '30px',
        marginBottom: '20px'
      }}>
        {children}
      </div>
    </div>
  );
  
  const LayoutComponent = AuthLayout || AuthLayoutWrapper;

  return (
    <LayoutComponent>
      <SpaceBetween direction="vertical" size="l">
        {/* 로고 및 제목 */}
        <Box textAlign="center" padding={{ bottom: 'l' }}>
          <img
            src="/images/aws.png" 
            alt="AWS Logo"
            style={{ 
              maxWidth: '180px', 
              marginBottom: '20px' 
            }}
          />
          <Box
            fontSize="heading-xl"
            fontWeight="bold"
            color="text-label"
            padding={{ top: 'm' }}
          >
            {t('auth:account_login')}
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
              >
                {t('auth:sign_in')}
              </Button>
              
              <Box textAlign="right" padding={{ top: 'm' }}>
                <Link 
                  to="/forgot-password" 
                  style={{
                    textDecoration: 'none',
                    color: '#0972d3',
                    fontSize: '14px'
                  }}
                >
                  {t('auth:forgot_password')}
                </Link>
              </Box>
            </SpaceBetween>
          }
        >
          <SpaceBetween size="l">
            <FormField label={t('auth:username')}>
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
              />
            </FormField>

            <FormField label={t('auth:password')}>
              <Input
                type="password"
                value={password}
                onChange={({ detail }) => setPassword(detail.value)}
                onKeyDown={({ detail }) => {
                  if (detail.key === 'Enter') handleSignIn();
                }}
              />
            </FormField>
          </SpaceBetween>
        </Form>

        {/* 계정 생성 링크 */}
        <Box textAlign="center">
          <Box fontSize="body-s" color="text-body-secondary">
            {t('auth:no_account')}{' '}
            <Link
              to="/register"
              style={{
                textDecoration: 'none',
                color: '#0972d3'
              }}
            >
              {t('auth:create_account')}
            </Link>
          </Box>
        </Box>

        {/* 하단 저작권 */}
        <Box textAlign="center" color="text-body-secondary" fontSize="body-s">
          &copy; {new Date().getFullYear()} Amazon Web Services, Inc. 또는 계열사
        </Box>
      </SpaceBetween>
    </LayoutComponent>
  );
};

export default LoginPage;