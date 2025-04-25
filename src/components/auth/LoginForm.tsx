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
  const { t } = useTranslation('auth');
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
      setError('사용자 이름과 비밀번호를 모두 입력해주세요');
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
      setSuccessMessage('로그인 성공! 이동 중...');
      
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
            header="로그인 오류"
          >
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert
            type="success"
            dismissible
            onDismiss={() => setSuccessMessage(null)}
            header="로그인 성공"
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
              계정 로그인
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
                로그인
              </Button>
            </SpaceBetween>
          }
        >
          <Container>
            <SpaceBetween size="l">
              <FormField
                label="사용자 이름"
                errorText={formErrors.username}
                constraintText="AWS 계정과 연결된 이메일 또는 사용자 이름"
              >
                <Input
                  value={username}
                  onChange={({ detail }) => setUsername(detail.value)}
                  placeholder="사용자 이름 입력"
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
                label="비밀번호"
                errorText={formErrors.password}
                info={
                  <CloudscapeLink
                    variant="info"
                    href="/forgot-password"
                    external={false}
                  >
                    비밀번호를 잊으셨나요?
                  </CloudscapeLink>
                }
              >
                <Input
                  value={password}
                  onChange={({ detail }) => setPassword(detail.value)}
                  type="password"
                  placeholder="비밀번호 입력"
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
                    AWS 계정이 없으신가요? 가입하기
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
                로그인하면 AWS의 <CloudscapeLink href="#">서비스 약관</CloudscapeLink> 및 <CloudscapeLink href="#">개인정보처리방침</CloudscapeLink>에 동의하는 것으로 간주됩니다.
              </Box>
              <Box display="flex" justifyContent="center" alignItems="center">
                <Icon name="lock" />
                <Box padding={{ left: "xxs" }} fontSize="body-s" color="text-status-info">
                  보안 연결
                </Box>
              </Box>
              <Box>
                &copy; {new Date().getFullYear()} Amazon Web Services, Inc. 또는 계열사
              </Box>
            </SpaceBetween>
          </Box>
        </ColumnLayout>
      </SpaceBetween>
    </form>
  );
};

export default LoginForm;