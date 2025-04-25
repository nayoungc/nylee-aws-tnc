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
  const { isAuthenticated, checkAuthStatus, refreshCredentials, hasCredentials } = useAuth();

  // 인증 확인 완료 여부를 추적하기 위한 ref
  const authCheckCompletedRef = useRef(false);
  const timerRef = useRef<number | null>(null);

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
  // 부분 인증 상태 처리
  const [isPartialAuth, setIsPartialAuth] = useState(false);

  // 페이지 로드 시 한 번만 인증 상태 확인
  useEffect(() => {
    // 이미 확인 완료된 경우 중복 실행 방지
    if (authCheckCompletedRef.current) return;

    console.log('SignIn 컴포넌트: 인증 상태 확인 시작');
    authCheckCompletedRef.current = true; // 중복 확인 방지

    const verifyAuth = async () => {
      try {
        // 부분 인증 상태 확인
        if (sessionStorage.getItem('partialAuthState') === 'true' && isAuthenticated) {
          console.log('부분 인증 상태 감지 (토큰O, 자격증명X)');
          setIsPartialAuth(true);
          return;
        }

        // 인증 상태 확인
        if (isAuthenticated) {
          console.log('이미 인증된 상태입니다. 리다이렉트합니다.');
          setIsRedirecting(true);
          navigate(returnUrl);
        } else {
          console.log('인증되지 않은 상태입니다. 로그인 폼을 표시합니다.');
        }
      } catch (err) {
        console.error('인증 상태 확인 중 오류:', err);
      }
    };

    // 인증 확인 시작 (약간 지연)
    const timerId = window.setTimeout(() => {
      verifyAuth();
    }, 100);
    
    // 타이머 참조 저장
    timerRef.current = timerId;
    
    // 클린업 함수
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isAuthenticated, navigate, returnUrl]);

  // 부분 인증 상태 처리
  useEffect(() => {
    // 부분 인증 상태 확인
    const checkPartialAuth = () => {
      if (isAuthenticated && !hasCredentials) {
        setIsPartialAuth(true);
      } else {
        setIsPartialAuth(false);
      }
    };
    
    checkPartialAuth();
  }, [isAuthenticated, hasCredentials]);

  const handleChange = (field: string, value: string) => {
    setFormState({ ...formState, [field]: value });
  };

  // 자격 증명 갱신 요청
  const handleRefreshCredentials = async () => {
    setLoading(true);
    try {
      console.log('자격 증명 갱신 시도...');
      const success = await refreshCredentials();
      
      if (success) {
        setSuccessMessage('자격 증명이 성공적으로 갱신되었습니다. 리다이렉션합니다...');
        
        // 성공 시 리디렉션
        setTimeout(() => {
          navigate(returnUrl);
        }, 1500);
      } else {
        setError('자격 증명 갱신에 실패했습니다. 로그아웃 후 다시 로그인해보세요.');
      }
    } catch (err: any) {
      console.error('자격 증명 갱신 오류:', err);
      setError('자격 증명 갱신 중 오류가 발생했습니다: ' + (err.message || '알 수 없는 오류'));
    } finally {
      setLoading(false);
    }
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

        // 세션 스토리지 초기화 (부분 인증 상태 플래그 제거)
        sessionStorage.removeItem('partialAuthState');

        // 자격 증명 초기화를 위한 시간
        await new Promise(resolve => setTimeout(resolve, 800));

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
        const timerId = window.setTimeout(() => {
          navigate('/confirm-signup', { state: { username: formState.username } });
        }, 2000);
        timerRef.current = timerId;
      } else {
        setError(err.message || t('auth.login_error_generic') || '로그인 중 오류가 발생했습니다');
      }
    } finally {
      setLoading(false);
    }
  };

  // 이미 인증되었거나 리디렉션 중인 경우 로딩 상태 표시
  if ((isAuthenticated && !isPartialAuth) || isRedirecting) {
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

  // 부분 인증 상태 (토큰은 있지만 자격 증명이 없는 경우)
  if (isPartialAuth) {
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
              제한된 인증 상태
            </Box>
          </Box>

          <Alert type="warning">
          <h3>제한된 인증 상태</h3>
          <p>
            AWS 서비스 접근 권한이 제한된 상태입니다. 이는 보안 토큰은 유효하지만 
            AWS 자격 증명을 가져올 수 없기 때문입니다.
          </p>
          <p>
            다음 방법을 시도해 보세요:
          </p>
          <ul>
            <li>로그아웃 후 다시 로그인</li>
            <li>브라우저 캐시 및 쿠키 삭제</li>
            <li>관리자에게 문의</li>
          </ul>
        </Alert>

          {error && (
            <Alert type="error" dismissible onDismiss={() => setError(null)}>
              {error}
            </Alert>
          )}

          {successMessage && (
            <Alert type="success" dismissible onDismiss={() => setSuccessMessage(null)}>
              {successMessage}
            </Alert>
          )}

          <SpaceBetween direction="horizontal" size="s" alignItems="center">
            <Button 
              variant="primary" 
              onClick={handleRefreshCredentials}
              loading={loading}
            >
              자격 증명 갱신
            </Button>
            
            <Button 
              onClick={() => navigate('/signout')}
              disabled={loading}
            >
              로그아웃
            </Button>
          </SpaceBetween>
          
          <Box textAlign="center" color="text-body-secondary" fontSize="body-s">
            &copy; {new Date().getFullYear()} Amazon Web Services, Inc. 또는 계열사
          </Box>
        </SpaceBetween>
      </AuthLayout>
    );
  }

  // 일반 로그인 폼
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