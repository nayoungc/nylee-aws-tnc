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
  const { username: initialUsername } = location.state || { username: '' };
  
  const [formState, setFormState] = useState({
    username: initialUsername || '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormState({ ...formState, [field]: value });
  };

  const handleSignInClick = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('로그인 시도:', formState.username);
      const result = await handleSignIn(
        formState.username,
        formState.password
      );
      
      console.log('로그인 결과:', result);
      
      // 로그인 성공 조건 확인 변경
      if (result.isSignedIn || result.nextStep?.signInStep === 'DONE') {
        console.log('로그인 성공, 홈으로 이동');
        window.location.href = '/'; // navigate() 대신 강제 이동
      } else if (result.nextStep?.signInStep === 'CONFIRM_SIGN_UP') {
        navigate('/confirm-signup', { 
          state: { username: formState.username } 
        });
      }
    } catch (err: any) {
      console.error('로그인 오류:', err);
      // 오류 처리...
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Box fontSize="heading-xl" fontWeight="bold">
        {t('auth.sign_in')}
      </Box>
      
      {error && (
        <Alert type="error" dismissible>
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
              {t('auth.sign_in')}
            </Button>
            
            <Box textAlign="center" padding={{ top: 's' }}>
              {t('auth.no_account')} <Link to="/signup">{t('auth.sign_up')}</Link>
            </Box>
          </SpaceBetween>
        }
      >
        <SpaceBetween size="l">
          <FormField label={t('auth.username')}>
            <Input
              type="text"
              value={formState.username}
              onChange={({ detail }) => handleChange('username', detail.value)}
            />
          </FormField>
          
          <FormField label={t('auth.password')}>
            <Input
              type="password"
              value={formState.password}
              onChange={({ detail }) => handleChange('password', detail.value)}
            />
          </FormField>
        </SpaceBetween>
      </Form>
    </AuthLayout>
  );
};

export default SignIn;