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
      const { isSignedIn, nextStep } = await handleSignIn(
        formState.username,
        formState.password
      );
      
      if (isSignedIn) {
        navigate('/');
      } else if (nextStep.signInStep === 'CONFIRM_SIGN_UP') {
        navigate('/confirm-signup', { 
          state: { username: formState.username } 
        });
      }
    } catch (err: any) {
      if (err.message === 'User does not exist.') {
        setError(t('auth.user_not_exist'));
      } else {
        setError(err.message || t('auth.login_error_generic'));
      }
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