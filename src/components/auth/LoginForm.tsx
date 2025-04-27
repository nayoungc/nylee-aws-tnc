// src/components/auth/LoginForm.tsx
import React, { useState, useEffect } from 'react';
import {
  Button,
  FormField,
  Input,
  SpaceBetween,
  Box,
  Alert,
  Checkbox,
  Container,
  Grid,
  Icon,
  Link as CloudscapeLink
} from '@cloudscape-design/components';
import { useAuth } from '@/hooks/useAuth';
import { validateLoginForm, getLoginErrorMessage } from '@/utils/authUtils';
import { Link } from 'react-router-dom';
import { useAppTranslation } from '@/hooks/useAppTranslation';

interface LoginFormProps {
  onLoginSuccess?: () => void;
  logoSrc?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ 
  onLoginSuccess,
  logoSrc = '/assets/aws.png' 
}) => {
  const { t, i18n } = useAppTranslation();
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

  // 아이디 기억하기 기능
  useEffect(() => {
    const savedUsername = localStorage.getItem('rememberedUsername');
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await attemptLogin();
  };

  const attemptLogin = async () => {
    // 폼 유효성 검증
    const { isValid, errors } = validateLoginForm(username, password);
    setFormErrors(errors);
    
    if (!isValid) {
      setError(t('fields_required'));
      return;
    }

    // 로그인 시도
    setIsLoading(true);
    setError(null);
    
    try {
      await login(username, password);
      
      // 아이디 기억하기 처리
      if (rememberMe) {
        localStorage.setItem('rememberedUsername', username);
      } else {
        localStorage.removeItem('rememberedUsername');
      }
      
      setSuccessMessage(t('login_success_redirecting'));

      // 로그인 성공 후 콜백
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

  // 인라인 스타일 정의
  const styles = {
    container: {
      width: '100%',
      maxWidth: '480px',
      margin: '0 auto',
    },
    logo: {
      maxWidth: '180px',
      height: 'auto',
      marginBottom: '24px'
    },
    formFieldContainer: {
      marginBottom: '16px'
    },
    rememberForgotContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap' as const
    },
    forgotPasswordLink: {
      fontSize: '14px',
      color: 'var(--color-text-link-default)',
      textDecoration: 'none',
      fontWeight: '500'
    },
    loginButtonWrapper: {
      borderRadius: '8px',
      overflow: 'hidden',
      background: 'linear-gradient(to right, #0073bb, #0972d3)',
      boxShadow: '0 4px 12px rgba(9, 114, 211, 0.2)',
      transition: 'all 0.2s ease',
      marginTop: '8px'
    },
    createAccountSection: {
      textAlign: 'center' as const,
      borderTop: '1px solid var(--color-border-divider-default)',
      paddingTop: '20px',
      marginTop: '10px',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '16px'
    },
    createAccountLink: {
      color: 'var(--color-text-link-default)',
      textDecoration: 'none',
      fontWeight: '500'
    },
    secureConnectionBadge: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      fontSize: 'var(--font-size-body-s)',
      color: 'var(--color-text-body-secondary)',
      padding: '8px',
      borderRadius: '4px',
      background: 'var(--color-background-container-content)',
      boxShadow: 'var(--shadow-container-s)',
      width: 'fit-content',
      margin: '0 auto'
    },
    languageSelector: {
      textAlign: 'center' as const,
      marginTop: '16px',
      display: 'flex',
      justifyContent: 'center',
      gap: '16px'
    }
  };

  return (
    <Container
      header={
        <Box textAlign="center" padding={{ top: "l", bottom: "l" }}>
          <img
            src={logoSrc}
            alt={t('app_logo_alt')}
            style={styles.logo}
          />
          <Box
            fontSize="heading-xl"
            fontWeight="heavy"
            color="text-label"
          >
            {t('account_login')}
          </Box>
          <Box
            fontSize="body-m"
            color="text-body-secondary"
            padding={{ top: 's' }}
          >
            {t('sign_in_to_continue')}
          </Box>
        </Box>
      }
    >
      <form onSubmit={handleSubmit}>
        <SpaceBetween direction="vertical" size="l">
          {/* 알림 메시지 */}
          {error && (
            <Alert
              type="error"
              dismissible
              onDismiss={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          {successMessage && (
            <Alert
              type="success"
              dismissible
              onDismiss={() => setSuccessMessage(null)}
            >
              {successMessage}
            </Alert>
          )}

          <Grid
            gridDefinition={[{ colspan: { default: 12 } }]}
          >
            <SpaceBetween size="l">
              {/* 사용자명 필드 */}
              <FormField
                label={t('username')}
                errorText={formErrors.username}
                stretch
              >
                <Input
                  value={username}
                  onChange={({ detail }) => setUsername(detail.value)}
                  placeholder={t('username_placeholder')}
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

              {/* 비밀번호 필드 */}
              <FormField
                label={t('password')}
                errorText={formErrors.password}
                stretch
              >
                <Input
                  value={password}
                  onChange={({ detail }) => setPassword(detail.value)}
                  type="password"
                  placeholder={t('password_placeholder')}
                  disabled={isLoading}
                  onKeyDown={({ detail }) => {
                    if (detail.key === 'Enter') attemptLogin();
                  }}
                />
              </FormField>

              {/* 체크박스와 비밀번호 찾기 */}
              <div style={styles.rememberForgotContainer}>
                <Checkbox
                  checked={rememberMe}
                  onChange={({ detail }) => setRememberMe(detail.checked)}
                >
                  <Box fontSize="body-s">{t('remember_me')}</Box>
                </Checkbox>

                <Link
                  to="/forgot-password"
                  style={styles.forgotPasswordLink}
                >
                  {t('forgot_password')}
                </Link>
              </div>
            </SpaceBetween>
          </Grid>

          {/* 로그인 버튼 */}
          <Box margin={{ top: 'm' }}>
            <div style={styles.loginButtonWrapper}>
              <Button
                variant="primary"
                loading={isLoading}
                onClick={attemptLogin}
                formAction="submit"
                fullWidth
                iconAlign="right"
                iconName="angle-right"
              >
                {t('sign_in')}
              </Button>
            </div>
          </Box>

          {/* 계정 생성 링크 */}
          <div style={styles.createAccountSection}>
            <Box fontSize="body-m" color="text-body-secondary">
              {t('no_account')}{' '}
              <Link 
                to="/register" 
                style={styles.createAccountLink}
              >
                {t('create_account')}
              </Link>
            </Box>

            <div style={styles.secureConnectionBadge}>
              <Icon
                name="lock-private"
                size="small"
                variant="subtle"
              /> 
              <span style={{ marginLeft: '4px' }}>{t('secure_connection')}</span>
            </div>
          </div>

          {/* 언어 선택 */}
          <div style={styles.languageSelector}>
            <CloudscapeLink
              variant="primary"
              fontSize="body-s"
              href="#en"
              onFollow={() => {
                i18n.changeLanguage('en');
              }}
            >
              English
            </CloudscapeLink>
            <CloudscapeLink
              variant="primary"
              fontSize="body-s"
              href="#ko"
              onFollow={() => {
                i18n.changeLanguage('ko');
              }}
            >
              한국어
            </CloudscapeLink>
          </div>
        </SpaceBetween>
      </form>
    </Container>
  );
};

export default LoginForm;