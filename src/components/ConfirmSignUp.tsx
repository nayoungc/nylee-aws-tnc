import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { handleConfirmSignUp } from '../utils/auth';
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

const ConfirmSignUp: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { username } = location.state || { username: '' };
  
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmClick = async () => {
    if (!username) {
      setError(t('auth.username_required'));
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await handleConfirmSignUp(username, code);
      navigate('/');
    } catch (err: any) {
      setError(err.message || t('auth.confirm_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Box fontSize="heading-xl" fontWeight="bold">
        {t('auth.confirm_signup')}
      </Box>
      
      <Box variant="p" color="text-body-secondary">
        {t('auth.confirmation_code_sent', { email: location.state?.email || username })}
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
              onClick={handleConfirmClick}
              data-testid="confirm-button"
            >
              {t('auth.confirm')}
            </Button>
          </SpaceBetween>
        }
      >
        <FormField label={t('auth.confirmation_code')}>
          <Input
            type="text"
            value={code}
            onChange={({ detail }) => setCode(detail.value)}
            placeholder={t('auth.enter_confirmation_code') as string}
          />
        </FormField>
      </Form>
    </AuthLayout>
  );
};

export default ConfirmSignUp;