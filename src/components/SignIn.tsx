import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { signIn } from 'aws-amplify/auth';
import { useTypedTranslation } from '@utils/i18n-utils';
import { useAuth } from '@contexts/AuthContext';
import AuthLayout from '@layouts/AuthLayout';
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
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, checkAuthStatus } = useAuth();
  
  // 인증 확인 완료 여부를 추적하기 위한 ref
  const authCheckCompletedRef = useRef(false);

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
  // 리디렉션 중 상태 추가
  const [isRedirecting, setIsRedirecting] = useState(false);

  // 페이지 로드 시 한 번만 인증 상태 확인
  useEffect(() => {
    // 이미 확인 완료된 경우 중복 실행 방지
    if (authCheckCompletedRef.current) return;
    
    const verifyAuth = async () => {
      try {
        console.log('인증 상태 확인 시작 - SignIn 컴포넌트');
        // 실제 인증 상태만 확인하고 자격 증명 초기화를 강제하지 않음
        const isAuth = await checkAuthStatus(false);
        
        if (isAuth) {
          console.log('이미 인증된 사용자입니다. 리다이렉트합니다.');
          setIsRedirecting(true);
          navigate(returnUrl);
        }
      } catch (err) {
        console.error('인증 상태 확인 중 오류:', err);
      } finally {
        // 확인 완료 표시
        authCheckCompletedRef.current = true;
      }
    };
    
    // 인증 확인 시작
    verifyAuth();
  }, [navigate, returnUrl]); 

  const handleChange = (field: string, value: string) => {
    setFormState({ ...formState, [field]: value });
  };

  // 로그인 처리 함수 개선
  const handleSignInClick = async () => {
    if (!formState.username || !formState.password) {
      setError(t('auth.fields_required') || '사용자 이름과 비밀번호를 모두 입력해주세요');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // 로그인 시도
      console.log('로그인 시도:', formState.username);
      const result = await signIn({
        username: formState.username,
        password: formState.password
      });

      console.log('로그인 결과:', result);

      if (result.isSignedIn) {
        // 로그인 성공 시 리디렉션 상태 설정
        setIsRedirecting(true);
        setSuccessMessage('로그인 성공! 리디렉션 중...');
        
        // 잠시 대기하여 토큰이 설정될 시간을 확보
        await new Promise(resolve => setTimeout(resolve, 500));
        
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
        console.log('이미 로그인된 상태입니다. 리디렉션합니다.');
        setIsRedirecting(true);
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

  // 이미 인증되었거나 리디렉션 중인 경우 로딩 상태 표시
  if (isAuthenticated || isRedirecting) {
    return (
      <AuthLayout>
        <SpaceBetween direction="vertical" size="l">
          <Box textAlign="center" padding={{ bottom: 'l' }}>
            <img
              src="/images/aws.png"
              alt="AWS Logo"
              style={{ maxWidth: '180px', marginBottom: '20px' }}
            />
          </Box>
          <Alert type="info">
            {t('auth.already_authenticated') || '이미 인증되어 있습니다. 리디렉션 중...'}
          </Alert>
        </SpaceBetween>
      </AuthLayout>
    );
  }

  // 나머지 JSX 부분은 동일하게 유지
  return (
    <AuthLayout>
      <SpaceBetween direction="vertical" size="l">
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