import React, { useState } from 'react';
import {
  Button,
  Form,
  FormField,
  Input,
  SpaceBetween,
  Box,
  Alert,
  Container,
  Link as CloudscapeLink,
  Icon,
  Checkbox,
  Grid
} from '@cloudscape-design/components';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { validateLoginForm, getLoginErrorMessage } from '@/utils/authUtils';
import { useTranslation } from 'react-i18next';

interface LoginFormProps {
  onLoginSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const { t } = useTranslation(['auth', 'common']);
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await attemptLogin();
  };

  const attemptLogin = async () => {
    if (!username || !password) {
      setError(t('auth:fields_required'));
      return;
    }

    setError(null);
    const { isValid, errors } = validateLoginForm(username, password);
    setFormErrors(errors);
    if (!isValid) return;

    setIsLoading(true);
    try {
      await login(username, password);
      setError(null);
      setSuccessMessage(t('auth:login_success_redirecting'));
      
      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      }, 800);
    } catch (err: any) {
      setError(getLoginErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container
      header={
        <Box
          fontSize="heading-xl"
          fontWeight="heavy"
          textAlign="center"
          padding={{ top: 'l', bottom: 'm' }}
        >
          {t('auth:account_login')}
        </Box>
      }
      footer={
        <Box textAlign="center" padding={{ top: 'm' }}>
          <SpaceBetween size="xs" direction="vertical">
            <Box color="text-body-secondary" fontSize="body-s">
              {t('auth:no_account')}{' '}
              <Link to="/register" style={{ color: 'var(--color-text-accent-link)' }}>
                {t('auth:create_account')}
              </Link>
            </Box>
            
            <Box fontSize="body-s" color="text-body-secondary" display="inline" textAlign="center"  padding={{ top: 'xs' }}>
              <Icon name="lock-private" size="normal" />
              <Box padding={{ left: 'xxs' }}>{t('auth:secure_connection')}</Box>
            </Box>
            
            <Box fontSize="body-s" color="text-body-secondary" padding={{ top: 'xs' }}>
              {t('common:footer.copyright', { year: new Date().getFullYear() })}
            </Box>
          </SpaceBetween>
        </Box>
      }
    >
      <form onSubmit={handleSubmit}>
        <SpaceBetween direction="vertical" size="l">
          {error && (
            <Alert
              type="error"
              dismissible
              onDismiss={() => setError(null)}
              header={t('auth:login_error_header')}
            >
              {error}
            </Alert>
          )}

          {successMessage && (
            <Alert
              type="success"
              dismissible
              onDismiss={() => setSuccessMessage(null)}
              header={t('auth:login_success_header')}
            >
              {successMessage}
            </Alert>
          )}

          <Form
            variant="embedded"
            actions={
              <Box textAlign="center" margin={{ top: 'm', bottom: 's' }}>
                <Button
                  variant="primary"
                  loading={isLoading}
                  onClick={() => attemptLogin()}
                  formAction="submit"
                  fullWidth
                >
                  {t('auth:sign_in')}
                </Button>
              </Box>
            }
          >
            <SpaceBetween size="l">
              <FormField
                label={t('auth:username')}
                errorText={formErrors.username}
                stretch
              >
                <Input
                  value={username}
                  onChange={({ detail }) => setUsername(detail.value)}
                  placeholder={t('auth:username_placeholder')}
                  disabled={isLoading}
                  autoFocus
                  onKeyDown={({ detail }) => {
                    if (detail.key === 'Enter') {
                      const passwordInput = document.querySelector('input[type="password"]');
                      if (passwordInput) (passwordInput as HTMLElement).focus();
                    }
                  }}
                />
              </FormField>

              <FormField
                label={t('auth:password')}
                errorText={formErrors.password}
                stretch
              >
                <Input
                  value={password}
                  onChange={({ detail }) => setPassword(detail.value)}
                  type="password"
                  placeholder={t('auth:password_placeholder')}
                  disabled={isLoading}
                  onKeyDown={({ detail }) => {
                    if (detail.key === 'Enter') attemptLogin();
                  }}
                />
              </FormField>
              
              <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
                <Box>
                  <Checkbox
                    checked={rememberMe}
                    onChange={({ detail }) => setRememberMe(detail.checked)}
                  >
                    {t('auth:remember_me')}
                  </Checkbox>
                </Box>
                <Box textAlign="right">
                  <CloudscapeLink
                    variant="primary"
                    href="/forgot-password"
                    fontSize="body-s"
                  >
                    {t('auth:forgot_password')}
                  </CloudscapeLink>
                </Box>
              </Grid>
            </SpaceBetween>
          </Form>
        </SpaceBetween>
      </form>
    </Container>
  );
};

export default LoginForm;