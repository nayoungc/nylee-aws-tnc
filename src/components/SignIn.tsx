// src/components/SignIn.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { signIn, signOut, fetchAuthSession } from 'aws-amplify/auth'; // signOut, fetchAuthSession 추가
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

  // 페이지 로드 시 인증 상태 확인 및 이미 로그인된 경우 리디렉션
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const session = await fetchAuthSession();
        if (session.tokens) {
          console.log('사용자가 이미 로그인한 상태입니다. 리다이렉트합니다.');
          navigate(returnUrl);
        }
      } catch (err) {
        // 로그인 상태가 아니면 정상적으로 로그인 페이지 표시
        console.log('로그인 상태가 아닙니다. 로그인 폼 표시');
      }
    };
    
    checkLoginStatus();
  }, [navigate, returnUrl]);

  const handleChange = (field: string, value: string) => {
    setFormState({ ...formState, [field]: value });
  };

  // 로그인 처리 함수 수정
  const handleSignInClick = async () => {
    if (!formState.username || !formState.password) {
      setError(t('auth.fields_required') || '사용자 이름과 비밀번호를 모두 입력해주세요');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // 1. 먼저 현재 세션 확인 - 이미 로그인된 상태일 수 있음
      try {
        const session = await fetchAuthSession();
        if (session.tokens) {
          console.log('이미 로그인된 사용자가 감지됨. 상태를 초기화합니다.');
          await signOut({ global: false });
          // 로그아웃 처리 시간을 위한 짧은 지연
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      } catch (sessionError) {
        // 세션 확인 오류는 무시하고 계속 진행
        console.log('세션 확인 중 오류 발생:', sessionError);
      }

      // 2. 로그인 시도
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
      
      // 이미 로그인된 사용자 오류는 특별히 처리
      if (err.name === 'UserAlreadyAuthenticatedException') {
        console.log('이미 로그인된 상태입니다. 인증 상태를 갱신하고 리디렉션합니다.');
        await checkAuthStatus(true); // 인증 상태 갱신
        navigate(returnUrl); // 원하는 페이지로 이동
        return;
      }
      
      // 기타 에러 처리 로직
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

  // 나머지 JSX 부분은 동일하게 유지
  return (
    <AuthLayout>
      <SpaceBetween direction="vertical" size="l">
        {/* 기존 JSX 유지 */}
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