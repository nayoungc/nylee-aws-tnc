import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { handleSignUp } from '../utils/auth';
import { useTranslation } from 'react-i18next';
import { useTypedTranslation } from '../hooks/useTypedTranslation';
import AuthLayout from './AuthLayout';
import { 
  Form, 
  SpaceBetween, 
  Button, 
  FormField, 
  Input, 
  Select,
  Box,
  Alert
} from '@cloudscape-design/components';

const SignUp: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    preferredLanguage: 'en',
    level: 'intermediate'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormState({ ...formState, [field]: value });
  };

  const handleSignUpClick = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (formState.password !== formState.confirmPassword) {
        throw new Error(t('auth.password_mismatch'));
      }
      
      const { nextStep } = await handleSignUp(
        formState.username,
        formState.password,
        formState.email,
        formState.preferredLanguage,
        formState.level
      );
      
      navigate('/confirm-signup', { 
        state: { username: formState.username, email: formState.email } 
      });
    } catch (err: any) {
      setError(err.message || t('auth.signup_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Box fontSize="heading-xl" fontWeight="bold">
        {t('auth.sign_up')}
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
              onClick={handleSignUpClick}
              data-testid="signup-button"
            >
              {t('auth.sign_up')}
            </Button>
            
            <Box textAlign="center" padding={{ top: 's' }}>
              {t('auth.have_account')} <Link to="/signin">{t('auth.sign_in')}</Link>
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
          
          <FormField label={t('auth.email')}>
            <Input
              type="email"
              value={formState.email}
              onChange={({ detail }) => handleChange('email', detail.value)}
            />
          </FormField>
          
          <FormField label={t('auth.password')}>
            <Input
              type="password"
              value={formState.password}
              onChange={({ detail }) => handleChange('password', detail.value)}
            />
          </FormField>
          
          <FormField label={t('auth.confirm_password')}>
            <Input
              type="password"
              value={formState.confirmPassword}
              onChange={({ detail }) => handleChange('confirmPassword', detail.value)}
            />
          </FormField>
          
          <FormField label={t('user.preferred_language')}>
            <Select
              selectedOption={{ 
                value: formState.preferredLanguage, 
                label: formState.preferredLanguage === 'en' ? t('language.english') : t('language.korean')
              }}
              onChange={({ detail }) => handleChange('preferredLanguage', detail.selectedOption.value || 'en')}
              options={[
                { value: 'en', label: t('language.english') },
                { value: 'ko', label: t('language.korean') }
              ]}
            />
          </FormField>
          
          <FormField label={t('user.level')}>
            <Select
              selectedOption={{ 
                value: formState.level, 
                label: t(`conversation.difficulty.\${formState.level}`)
              }}
              onChange={({ detail }) => handleChange('level', detail.selectedOption.value || 'intermediate')}
              options={[
                { value: 'beginner', label: t('conversation.difficulty.beginner') },
                { value: 'intermediate', label: t('conversation.difficulty.intermediate') },
                { value: 'advanced', label: t('conversation.difficulty.advanced') }
              ]}
            />
          </FormField>
        </SpaceBetween>
      </Form>
    </AuthLayout>
  );
};

export default SignUp;