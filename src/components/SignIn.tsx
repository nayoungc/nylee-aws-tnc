// src/components/SignIn.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { signIn } from 'aws-amplify/auth';
import { useTypedTranslation } from '@utils/i18n-utils';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout from '../layouts/AuthLayout';
import {
  Form,
  SpaceBetween,
  Button,
  FormField,
  Input,
  Box,
  Alert,
} from '@cloudscape-design/components';

const SignIn: React.FC = () => {
  const { t } = useTypedTranslation();
  const { checkAuthStatus } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // URL에서 returnUrl 파라미터 추출
  const queryParams = new URLSearchParams(location.search);
  const returnUrl = queryParams.get('returnTo') || '/';
  
  const { username: initialUsername, message } = location.state || { username: '', message: '' };

  const [formState, setFormState] = useState({
    username: initialUsername || '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(message || null);

  const handleChange = (field: string, value: string) => {
    setFormState({ ...formState, [field]: value });
  };

  const handleSignInClick = async () => {
    if (!formState.username || !formState.password) {
      setError(t('auth.fields_required') || '사용자 이름과 비밀번호를 모두 입력해주세요');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      console.log('로그인 시도:', formState.username);
      const result = await signIn({
        username: formState.username,
        password: formState.password
      });

      console.log('로그인 결과:', result);

      if (result.isSignedIn) {
        // 로그인 성공 - 인증 상태 갱신
        await checkAuthStatus(true);
        
        // 리디렉션
        navigate(returnUrl);
      } else if (result.nextStep?.signInStep === 'CONFIRM_SIGN_UP') {
        navigate('/confirm-signup', {
          state: { username: formState.username }
        });
      } else if (result.nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        navigate('/new-password', {
          state: {
            username: formState.username,
            challengeName: 'NEW_PASSWORD_REQUIRED'
          }
        });
      }
    } catch (err: any) {
      console.error('로그인 오류:', err);
      
      // 에러 처리 로직
      if (err.name === 'UserNotFoundException' || err.message?.includes('user') && err.message?.includes('exist')) {
        setError(t('auth.user_not_exist') || '사용자가 존재하지 않습니다');
      } else if (err.name === 'NotAuthorizedException' || err.message?.includes('password') && err.message?.includes('incorrect')) {
        setError(t('auth.incorrect_password') || '잘못된 비밀번호입니다');
      } else if (err.name === 'UserNotConfirmedException' || err.message?.includes('confirm')) {
        setError(t('auth.account_not_verified') || '계정이 확인되지 않았습니다');
        setTimeout(() => {
          navigate('/confirm-signup', { state: { username: formState.username } });
        }, 2000);
      } else {
        setError(err.message || t('auth.login_error_generic') || '로그인 중 오류가 발생했습니다');
      }
    } finally {
      setLoading(false);
    }
  };

  // 나머지 컴포넌트 코드는 수정 없음
  return (
    <AuthLayout>
      <SpaceBetween direction="vertical" size="l">
        {/* 로고 이미지와 컨텐츠 */}
        <Box textAlign="center" padding={{ bottom: 'l' }}>
          <img
            src="/images/aws.png"
            alt="AWS Logo"
            style={{ maxWidth: '180px', marginBottom: '20px' }}
          />
          <Box
            fontSize="heading-xl"
            fontWeight="bold"
            color="text-label"
            padding={{ top: 'm' }}
          >
            {String(t('auth.sign_in'))}
          </Box>
        </Box>

        {/* 알림 메시지 및 폼 컨텐츠 */}
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

        <Form
          actions={
            <SpaceBetween direction="vertical" size="xs">
              <Button
                variant="primary"
                loading={loading}
                onClick={handleSignInClick}
                data-testid="signin-button"
                fullWidth
              >
                {String(t('auth.sign_in'))}
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
                  {String(t('auth.forgot_password') || '비밀번호 찾기')}
                </Link>
              </Box>
            </SpaceBetween>
          }
        >
          <SpaceBetween size="l">
            <FormField label={String(t('auth.username'))}>
              <Input
                type="text"
                value={formState.username}
                onChange={({ detail }) => handleChange('username', detail.value)}
                onKeyDown={({ detail }) => {
                  if (detail.key === 'Enter') {
                    const passwordInput = document.querySelector('input[type="password"]');
                    if (passwordInput) (passwordInput as HTMLElement).focus();
                  }
                }}
                autoFocus
              />
            </FormField>

            <FormField label={String(t('auth.password'))}>
              <Input
                type="password"
                value={formState.password}
                onChange={({ detail }) => handleChange('password', detail.value)}
                onKeyDown={({ detail }) => {
                  if (detail.key === 'Enter') handleSignInClick();
                }}
              />
            </FormField>
          </SpaceBetween>
        </Form>

        <Box textAlign="center" color="text-body-secondary" fontSize="body-s">
          &copy; {new Date().getFullYear()} Amazon Web Services, Inc. 또는 계열사
        </Box>
      </SpaceBetween>
    </AuthLayout>
  );
};

export default SignIn;