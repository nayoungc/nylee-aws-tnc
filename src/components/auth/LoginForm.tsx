// app/components/auth/LoginForm.tsx
import React, { useState } from 'react';
import {
  Button,
  Form,
  FormField,
  Input,
  SpaceBetween,
  Box,
  Alert,
  ColumnLayout,
  Container,
  Link as CloudscapeLink,
  Icon
} from '@cloudscape-design/components';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { validateLoginForm, getLoginErrorMessage } from '@/utils/authUtils';
import { useTranslation } from 'react-i18next';

interface LoginFormProps {
  onLoginSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  // auth 네임스페이스뿐만 아니라 common 네임스페이스도 사용
  const { t } = useTranslation(['auth', 'common']);
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  // 폼 제출 처리 함수
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await attemptLogin();
  };

  // 로그인 시도 처리
  const attemptLogin = async () => {
    if (!username || !password) {
      setError(t('auth:fields_required'));
      return;
    }

    setError(null);

    // 폼 유효성 검증
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
          header={
            <Box
              margin={{ bottom: "m" }}
              textAlign="left"
              fontSize="heading-l"
            >
              {t('auth:account_login')}
            </Box>
          }
          actions={
            <SpaceBetween direction="vertical" size="s">
              <Button
                variant="primary"
                loading={isLoading}
                onClick={() => attemptLogin()}
                formAction="submit"
                fullWidth
              >
                {t('auth:sign_in')}
              </Button>
            </SpaceBetween>
          }
        >
          <Container>
            <SpaceBetween size="l">
              <FormField
                label={t('auth:username')}
                errorText={formErrors.username}
                constraintText={t('auth:username_constraint')}
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
                info={
                  <CloudscapeLink
                    variant="info"
                    href="/forgot-password"
                    external={false}
                  >
                    {t('auth:forgot_password')}
                  </CloudscapeLink>
                }
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

              <Box textAlign="right">
                <Link
                  to="/register"
                  style={{ textDecoration: 'none' }}
                >
                  <CloudscapeLink>
                    {t('auth:no_account_signup')}
                  </CloudscapeLink>
                </Link>
              </Box>
            </SpaceBetween>
          </Container>
        </Form>

        <ColumnLayout columns={1} variant="text-grid">
          <Box
            color="text-body-secondary"
            fontSize="body-s"
            textAlign="center"
            padding={{ top: "l", bottom: "s" }}
          >
            <SpaceBetween size="xs" direction="vertical">
              <Box>
                {t('auth:terms_agreement', {
                  terms: <CloudscapeLink href="#">{t('auth:terms_of_service')}</CloudscapeLink>,
                  privacy: <CloudscapeLink href="#">{t('auth:privacy_policy')}</CloudscapeLink>
                })}
              </Box>
              <SpaceBetween direction="horizontal" size="xxs" alignItems="center">
                <Icon name="envelope" />
                <Box fontSize="body-s" color="text-status-info">
                  {t('auth:secure_connection')}
                </Box>
              </SpaceBetween>
              <Box>
                {t('common:footer.copyright', { year: new Date().getFullYear() })}
              </Box>
            </SpaceBetween>
          </Box>
        </ColumnLayout>
      </SpaceBetween>
    </form>
  );
};

export default LoginForm;