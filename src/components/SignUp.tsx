import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// @utils/auth 대신 직접 aws-amplify에서 임포트
import { signUp } from 'aws-amplify/auth';
import { useTypedTranslation } from '@utils/i18n-utils';
import AuthLayout from '../layouts/AuthLayout';
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

// 비밀번호 강도 검증 함수 (선택사항)
const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 8) {
    return { isValid: false, message: '비밀번호는 최소 8자 이상이어야 합니다.' };
  }
  
  // 대문자, 소문자, 숫자, 특수문자 포함 검증
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  
  if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
    return { 
      isValid: false, 
      message: '비밀번호는 대문자, 소문자, 숫자, 특수문자를 모두 포함해야 합니다.' 
    };
  }
  
  return { isValid: true };
};

const SignUp: React.FC = () => {
  const { t } = useTypedTranslation();
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
    // 에러 메시지 초기화
    if (error) setError(null);
  };

  // handleSignUp 유틸리티 대신 직접 Amplify signUp 사용
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
    
    // 비밀번호 강도 검증 (선택적으로 사용)
    // const passwordValidation = validatePassword(formState.password);
    // if (!passwordValidation.isValid) {
    //   setError(String(t('auth.password_requirements') || passwordValidation.message));
    //   return;
    // }
    
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
      // Gen 2 방식으로 회원가입 시도
      const userAttributes: Record<string, string> = {
        email: formState.email,
        profile: 'instructor', // 추가 속성 전달
      };
      
      // 전화번호가 있는 경우 추가
      if (formState.usePhoneNumber && formState.phoneNumber) {
        userAttributes.phone_number = formState.phoneNumber;
      }
      
      const result = await signUp({
        username: formState.username,
        password: formState.password,
        options: {
          userAttributes
        }
      });
      
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
      else if (result.isSignUpComplete) {
        navigate('/signin', {
          state: { 
            username: formState.username,
            message: String(t('auth.signup_success') || '회원가입이 완료되었습니다. 로그인해주세요.')
          }
        });
      }
    } catch (err: any) {
      console.error('회원가입 오류:', err);
      
      // Gen 2 오류 처리 개선
      const errorMessage = err.message || '';
      
      if (err.name === 'UsernameExistsException' || errorMessage.includes('already exists')) {
        setError(String(t('auth.username_exists') || '이미 사용 중인 사용자 이름입니다'));
      } else if (err.name === 'InvalidPasswordException' || errorMessage.includes('password')) {
        setError(String(t('auth.invalid_password') || 
          '비밀번호가 요구사항을 충족하지 않습니다. 대문자, 소문자, 숫자, 특수문자를 포함한 8자 이상이어야 합니다.'));
      } else if (err.name === 'InvalidParameterException') {
        if (errorMessage.includes('phone')) {
          setError(String(t('auth.invalid_phone') || '올바른 형식의 전화번호를 입력하세요 (+국가코드포함)'));
        } else if (errorMessage.includes('email')) {
          setError(String(t('auth.invalid_email') || '올바른 이메일 형식이 아닙니다'));
        } else {
          setError(errorMessage || String(t('auth.invalid_parameter') || '입력값이 올바르지 않습니다'));
        }
      } else {
        setError(errorMessage || String(t('auth.signup_error') || '회원가입 중 오류가 발생했습니다'));
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
              autoFocus
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
                type="text"
                inputMode="tel"
                value={formState.phoneNumber}
                onChange={({ detail }) => handleChange('phoneNumber', detail.value)}
                placeholder="+82101234567"
              />
            </FormField>
          )}
          
          <FormField 
            label={String(t('auth.password') || '비밀번호')}
            description={String(t('auth.password_hint') || '8자 이상의 대문자, 소문자, 숫자, 특수문자 조합')}
          >
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