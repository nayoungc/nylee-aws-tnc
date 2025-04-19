import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { handleSignUp } from '../utils/auth';
// 하나의 훅만 사용 
import { useTranslation } from 'react-i18next';
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
        throw new Error(String(t('auth.password_mismatch'))); // String() 추가
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
      setError(err.message || String(t('auth.signup_error'))); // String() 추가
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Box fontSize="heading-xl" fontWeight="bold">
        {String(t('auth.sign_up'))}
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
              {String(t('auth.sign_up'))}
            </Button>
            
            <Box textAlign="center" padding={{ top: 's' }}>
              {String(t('auth.have_account'))} <Link to="/signin">{String(t('auth.sign_in'))}</Link>
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
            />
          </FormField>
          
          <FormField label={String(t('auth.email'))}>
            <Input
              type="email"
              value={formState.email}
              onChange={({ detail }) => handleChange('email', detail.value)}
            />
          </FormField>
          
          <FormField label={String(t('auth.password'))}>
            <Input
              type="password"
              value={formState.password}
              onChange={({ detail }) => handleChange('password', detail.value)}
            />
          </FormField>
          
          <FormField label={String(t('auth.confirm_password'))}>
            <Input
              type="password"
              value={formState.confirmPassword}
              onChange={({ detail }) => handleChange('confirmPassword', detail.value)}
            />
          </FormField>
          
          <FormField label={String(t('user.preferred_language'))}>
            <Select
              selectedOption={{ 
                value: formState.preferredLanguage, 
                label: String(formState.preferredLanguage === 'en' ? t('language.english') : t('language.korean'))
              }}
              onChange={({ detail }) => handleChange('preferredLanguage', detail.selectedOption.value || 'en')}
              options={[
                { value: 'en', label: String(t('language.english')) },
                { value: 'ko', label: String(t('language.korean')) }
              ]}
            />
          </FormField>
          
          <FormField label={String(t('user.level'))}>
            <Select
              selectedOption={{ 
                value: formState.level, 
                label: String(t(`conversation.difficulty.\${formState.level}`)) // 백슬래시 제거
              }}
              onChange={({ detail }) => handleChange('level', detail.selectedOption.value || 'intermediate')}
              options={[
                { value: 'beginner', label: String(t('conversation.difficulty.beginner')) },
                { value: 'intermediate', label: String(t('conversation.difficulty.intermediate')) },
                { value: 'advanced', label: String(t('conversation.difficulty.advanced')) }
              ]}
            />
          </FormField>
        </SpaceBetween>
      </Form>
    </AuthLayout>
  );
};

export default SignUp;