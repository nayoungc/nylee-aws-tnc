import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { handleSignUp } from '../utils/auth';
import { useTranslation } from 'react-i18next';
import AuthLayout from './AuthLayout';
import { 
  Form, 
  SpaceBetween, 
  Button, 
  FormField, 
  Input, 
  Box,
  Alert,
  Checkbox
} from '@cloudscape-design/components';

const SignUp: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [formState, setFormState] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    usePhoneNumber: false
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: string | boolean) => {
    setFormState({ ...formState, [field]: value });
  };

  const handleSignUpClick = async () => {
    // 입력 유효성 검사
    if (!formState.username) {
      setError(String(t('auth.username_required') || '사용자 이름을 입력하세요'));
      return;
    }
    
    if (!formState.email) {
      setError(String(t('auth.email_required') || '이메일을 입력하세요'));
      return;
    }
    
    if (!formState.password) {
      setError(String(t('auth.password_required') || '비밀번호를 입력하세요'));
      return;
    }
    
    if (formState.password !== formState.confirmPassword) {
      setError(String(t('auth.password_mismatch') || '비밀번호가 일치하지 않습니다'));
      return;
    }
    
    if (formState.usePhoneNumber && !formState.phoneNumber) {
      setError(String(t('auth.phone_required') || '전화번호를 입력하세요'));
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // 회원가입 시도
      const result = await handleSignUp(
        formState.username,
        formState.password,
        formState.email,
        formState.usePhoneNumber ? formState.phoneNumber : undefined,
        // 여기에 추가 속성 전달 가능 (예: profile: 'instructor')
        { profile: 'instructor' }
      );
      
      console.log('회원가입 결과:', result);
      
      // 인증 코드 확인 필요
      if (result.nextStep?.signUpStep === 'CONFIRM_SIGN_UP') {
        navigate('/confirm-signup', { 
          state: { 
            username: formState.username,
            email: formState.email,
            destination: result.nextStep.codeDeliveryDetails?.destination 
          } 
        });
      } 
      // 회원가입 완료
      else if (result.nextStep?.signUpStep === 'DONE') {
        navigate('/signin', {
          state: { 
            username: formState.username,
            message: String(t('auth.signup_success') || '회원가입이 완료되었습니다. 로그인해주세요.')
          }
        });
      }
    } catch (err: any) {
      console.error('회원가입 오류:', err);
      
      if (err.name === 'UsernameExistsException') {
        setError(String(t('auth.username_exists') || '이미 사용 중인 사용자 이름입니다'));
      } else if (err.name === 'InvalidPasswordException') {
        setError(String(t('auth.invalid_password') || '비밀번호가 요구사항을 충족하지 않습니다'));
      } else {
        setError(err.message || String(t('auth.signup_error') || '회원가입 중 오류가 발생했습니다'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Box fontSize="heading-xl" fontWeight="bold">
        {String(t('auth.sign_up') || '회원가입')}
      </Box>
      
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
              onClick={handleSignUpClick}
              data-testid="signup-button"
            >
              {String(t('auth.sign_up') || '회원가입')}
            </Button>
            
            <Box textAlign="center" padding={{ top: 's' }}>
              {String(t('auth.have_account') || '이미 계정이 있으신가요?')} 
              <Link to="/signin">{String(t('auth.sign_in') || '로그인')}</Link>
            </Box>
          </SpaceBetween>
        }
      >
        <SpaceBetween size="l">
          <FormField label={String(t('auth.username') || '사용자 이름')}>
            <Input
              type="text"
              value={formState.username}
              onChange={({ detail }) => handleChange('username', detail.value)}
            />
          </FormField>
          
          <FormField label={String(t('auth.email') || '이메일')}>
            <Input
              type="email"
              value={formState.email}
              onChange={({ detail }) => handleChange('email', detail.value)}
            />
          </FormField>
          
          <Checkbox
            checked={formState.usePhoneNumber}
            onChange={({ detail }) => handleChange('usePhoneNumber', detail.checked)}
          >
            {String(t('auth.include_phone') || '전화번호 포함')}
          </Checkbox>
          
          {formState.usePhoneNumber && (
            <FormField 
              label={String(t('auth.phone_number') || '전화번호')}
              description={String(t('auth.phone_format') || '국제 형식으로 입력: +82101234567')}
            >
              <Input
                type="text"  // "tel" 대신 "text" 사용
                inputMode="tel"  // HTML5 inputMode 속성으로 모바일에서 전화번호 키패드 표시
                value={formState.phoneNumber}
                onChange={({ detail }) => handleChange('phoneNumber', detail.value)}
                placeholder="+82101234567"
              />
            </FormField>
          )}
          
          <FormField label={String(t('auth.password') || '비밀번호')}>
            <Input
              type="password"
              value={formState.password}
              onChange={({ detail }) => handleChange('password', detail.value)}
            />
          </FormField>
          
          <FormField label={String(t('auth.confirm_password') || '비밀번호 확인')}>
            <Input
              type="password"
              value={formState.confirmPassword}
              onChange={({ detail }) => handleChange('confirmPassword', detail.value)}
              onKeyDown={({ detail }) => {
                if (detail.key === 'Enter') handleSignUpClick();
              }}
            />
          </FormField>
        </SpaceBetween>
      </Form>
    </AuthLayout>
  );
};

export default SignUp;