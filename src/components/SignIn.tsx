import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { handleSignIn } from '../utils/auth';
import { useTranslation } from 'react-i18next';
import AuthLayout from './AuthLayout';
import { 
  Form, 
  SpaceBetween, 
  Button, 
  FormField, 
  Input, 
  Box,
  Alert
} from '@cloudscape-design/components';

const SignIn: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
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
    // 입력 유효성 검사
    if (!formState.username || !formState.password) {
      setError(t('auth.fields_required') || '사용자 이름과 비밀번호를 모두 입력해주세요');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      console.log('로그인 시도:', formState.username);
      const result = await handleSignIn(
        formState.username,
        formState.password
      );
      
      console.log('로그인 결과:', result);
      
      if (result.isSignedIn) {
        // 로그인 성공 - 홈으로 이동
        navigate('/');
      } else if (result.nextStep?.signInStep === 'CONFIRM_SIGN_UP') {
        // 계정 확인 필요
        navigate('/confirm-signup', { 
          state: { username: formState.username } 
        });
      } else if (result.nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        // 임시 비밀번호 변경 필요 - 전체 result 객체 전달
        navigate('/new-password', { 
          state: { 
            username: formState.username, 
            challengeResult: result // 전체 결과 객체 전달
          } 
        });
      }
    } catch (err: any) {
      console.error('로그인 오류:', err);
      
      // 오류 유형에 따른 메시지 표시
      if (err.name === 'UserNotFoundException') {
        setError(t('auth.user_not_exist') || '사용자가 존재하지 않습니다');
      } else if (err.name === 'NotAuthorizedException') {
        setError(t('auth.incorrect_password') || '잘못된 비밀번호입니다');
      } else if (err.name === 'UserNotConfirmedException') {
        setError(t('auth.account_not_verified') || '계정이 확인되지 않았습니다');
        // 인증 페이지로 이동 옵션 추가
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

  return (
    <AuthLayout>
      <Box fontSize="heading-xl" fontWeight="bold">
        {String(t('auth.sign_in'))}
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
            >
              {String(t('auth.sign_in'))}
            </Button>
            
            <Box textAlign="center" padding={{ top: 's' }}>
              {String(t('auth.no_account'))} <Link to="/signup">{String(t('auth.sign_up'))}</Link>
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
    </AuthLayout>
  );
};

export default SignIn;