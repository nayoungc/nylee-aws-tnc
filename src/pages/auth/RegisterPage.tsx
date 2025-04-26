// /src/pages/auth/RegisterPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  SpaceBetween, 
  Form, 
  FormField, 
  Input, 
  Button, 
  Header,
  Alert
} from '@cloudscape-design/components';
import { useTranslation } from 'react-i18next';
//import { useAuth } from '@auth/auth-context';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['auth', 'common']);
  //const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState(false);
  const [code, setCode] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError(t('auth:register.password_mismatch'));
      setLoading(false);
      return;
    }

    try {
      //await register(username, password, email);
      setSuccessMessage(t('auth:register.registration_success'));
      setConfirmation(true);
    } catch (err: any) {
      setError(err.message || t('auth:register.registration_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      {!confirmation ? (
        <form onSubmit={handleRegister}>
          <Form
            header={<Header variant="h1">{t('auth:register.title')}</Header>}
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <Button
                  variant="link"
                  onClick={() => navigate('/login')}
                >
                  {t('auth:register.back_to_login')}
                </Button>
                <Button
                  variant="primary"
                  loading={loading}
                  formAction="submit"
                >
                  {t('auth:register.register')}
                </Button>
              </SpaceBetween>
            }
            errorText={error}
          >
            <SpaceBetween direction="vertical" size="l">
              {successMessage && (
                <Alert type="success" dismissible onDismiss={() => setSuccessMessage('')}>
                  {successMessage}
                </Alert>
              )}
              
              <FormField label={t('auth:register.username')}>
                <Input
                  type="text"
                  value={username}
                  onChange={({ detail }) => setUsername(detail.value)}
                />
              </FormField>
              <FormField label={t('auth:register.email')}>
                <Input
                  type="email"
                  value={email}
                  onChange={({ detail }) => setEmail(detail.value)}
                />
              </FormField>
              <FormField label={t('auth:register.password')}>
                <Input
                  type="password"
                  value={password}
                  onChange={({ detail }) => setPassword(detail.value)}
                />
              </FormField>
              <FormField label={t('auth:register.confirm_password')}>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={({ detail }) => setConfirmPassword(detail.value)}
                />
              </FormField>
            </SpaceBetween>
          </Form>
        </form>
      ) : (
        <Form
          header={<Header variant="h1">{t('auth:register.confirm_account')}</Header>}
          actions={
            <Button
              variant="primary"
              onClick={() => navigate('/login')}
            >
              {t('auth:register.complete_confirmation')}
            </Button>
          }
        >
          <SpaceBetween direction="vertical" size="l">
            {error && (
              <Alert type="error" dismissible onDismiss={() => setError('')}>
                {error}
              </Alert>
            )}
            
            <FormField label={t('auth:register.verification_code')}>
              <Input
                type="text"
                value={code}
                onChange={({ detail }) => setCode(detail.value)}
              />
            </FormField>
            <Button
              onClick={async () => {
                try {
                  // 인증 로직 구현
                  // await confirmRegistration(username, code);
                  setSuccessMessage(t('auth:register.verification_success'));
                  setTimeout(() => {
                    navigate('/login');
                  }, 1500);
                } catch (err: any) {
                  setError(err.message || t('auth:register.verification_error'));
                }
              }}
            >
              {t('auth:register.verify_code')}
            </Button>
          </SpaceBetween>
        </Form>
      )}
    </Container>
  );
};

export default RegisterPage;