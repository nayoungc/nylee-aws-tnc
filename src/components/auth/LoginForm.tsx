// src/components/auth/LoginForm.tsx
import React, { useState } from 'react';
import {
  Button,
  FormField,
  Input,
  SpaceBetween,
  Box,
  Alert,
  Checkbox
} from '@cloudscape-design/components';
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

        {/* 제목 */}
        <Box
          fontSize="heading-l"
          fontWeight="heavy"
          textAlign="center"
          padding={{ bottom: 'm' }}
        >
          {t('auth:account_login')}
        </Box>

        <SpaceBetween size="l">
          {/* 사용자명 필드 */}
          <div>
            <Box fontWeight="bold" padding={{ bottom: 'xs' }}>
              {t('auth:username')}
            </Box>
            <FormField
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
          </div>

          {/* 비밀번호 필드 */}
          <div>
            <Box fontWeight="bold" padding={{ bottom: 'xs' }}>
              {t('auth:password')}
            </Box>
            <FormField
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
          </div>

          {/* 체크박스와 비밀번호 찾기 */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Checkbox
              checked={rememberMe}
              onChange={({ detail }) => setRememberMe(detail.checked)}
            >
              <Box fontSize="body-s">{t('auth:remember_me')}</Box>
            </Checkbox>

            <a
              href="/forgot-password"
              style={{
                fontSize: '13px',
                color: 'var(--color-text-link-default)',
                textDecoration: 'none'
              }}
            >
              {t('auth:forgot_password')}
            </a>
          </div>
        </SpaceBetween>

        {/* 로그인 버튼 - 감싸는 div를 사용하여 스타일링 */}
        <div style={{ marginTop: '8px' }}>
          <div style={{
            borderRadius: '4px',
            overflow: 'hidden',
            background: 'linear-gradient(to right, #0073bb, #0972d3)',
            boxShadow: '0 2px 5px rgba(0,115,187,0.3)',
          }}>
            <Button
              variant="primary"
              loading={isLoading}
              onClick={() => attemptLogin()}
              formAction="submit"
              fullWidth
              iconName="angle-right-double"
            >
              {t('auth:sign_in')}
            </Button>
          </div>
        </div>

        {/* 계정 생성 링크 */}
        <div style={{
          textAlign: 'center',
          borderTop: '1px solid var(--color-border-divider-default)',
          paddingTop: '16px',
          marginTop: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <Box fontSize="body-s" color="text-body-secondary">
            {t('auth:no_account')}{' '}
            <a href="/register" style={{ color: 'var(--color-text-link-default)', textDecoration: 'none', fontWeight: '500' }}>
              {t('auth:create_account')}
            </a>
          </Box>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'var(--font-size-body-s)',
              color: 'var(--color-text-body-secondary)'
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" focusable="false" role="img" aria-hidden="true" style={{ marginRight: '4px' }}>
                <path d="M19 10h-1V7c0-3.309-2.691-6-6-6S6 3.691 6 7v3H5c-1.654 0-3 1.346-3 3v7c0 1.654 1.346 3 3 3h14c1.654 0 3-1.346 3-3v-7c0-1.654-1.346-3-3-3zm-7 9c-1.103 0-2-.897-2-2s.897-2 2-2 2 .897 2 2-.897 2-2 2zm3.5-9h-7V7c0-1.93 1.57-3.5 3.5-3.5S15.5 5.07 15.5 7v3z" fill="currentColor"></path>
              </svg>
              {t('auth:secure_connection')}
            </div>
          </div>
        </div>
      </SpaceBetween>
    </form>
  );
};

export default LoginForm;