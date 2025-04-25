// src/components/auth/LoginForm.tsx
import React, { useState } from 'react';
import {
  Button,
  Container,
  Form,
  FormField,
  Input,
  SpaceBetween,
  Box,
  Alert,
} from '@cloudscape-design/components';
import { useAuth } from '../../hooks/useAuth';
import { validateLoginForm, getLoginErrorMessage } from '../../utils/authUtils';
import { Link } from 'react-router-dom';

interface LoginFormProps {
  onLoginSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
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

  // 로그인 시도 처리 (Cloudscape Button 이벤트 핸들러와 분리)
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
      <Container>
        <SpaceBetween direction="vertical" size="l">
          <Box textAlign="center" padding={{ bottom: 'l' }}>
            <img
              src="/images/aws.png"
              alt="AWS Logo"
              style={{ maxWidth: '180px', marginBottom: '20px' }}
            />
            <Box
              fontSize="heading-xl"
              fontWeight="bold"
              color="text-label"
              padding={{ top: 'm' }}
            >
              로그인
            </Box>
          </Box>

          {error && (
            <Alert type="error" dismissible onDismiss={() => setError(null)}>
              {error}
            </Alert>
          )}

          {successMessage && (
            <Alert type="success" dismissible onDismiss={() => setSuccessMessage(null)}>
              {successMessage}
            </Alert>
          )}

          <Form
            actions={
              <SpaceBetween direction="vertical" size="xs">
                <Button
                  variant="primary"
                  loading={isLoading}
                  onClick={() => attemptLogin()} // 수정된 부분: 적절한 핸들러 연결
                  formAction="submit"
                  fullWidth
                >
                  로그인
                </Button>
                
                <Box textAlign="right" padding={{ top: 'm' }}>
                  <Link
                    to="/forgot-password"
                    style={{
                      textDecoration: 'none',
                      color: '#0972d3',
                      fontSize: '14px'
                    }}
                  >
                    비밀번호 찾기
                  </Link>
                </Box>
              </SpaceBetween>
            }
          >
            <SpaceBetween size="l">
              <FormField
                label="사용자 이름"
                errorText={formErrors.username}
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
              >
                <Input
                  value={password}
                  onChange={({ detail }) => setPassword(detail.value)}
                  type="password"
                  placeholder="비밀번호 입력"
                  disabled={isLoading}
                  onKeyDown={({ detail }) => {
                    if (detail.key === 'Enter') attemptLogin(); // 분리된 함수 사용
                  }}
                />
              </FormField>
            </SpaceBetween>
          </Form>
          
          <Box textAlign="center" color="text-body-secondary" fontSize="body-s">
            &copy; {new Date().getFullYear()} Amazon Web Services, Inc. 또는 계열사
          </Box>
        </SpaceBetween>
      </Container>
    </form>
  );
};

export default LoginForm;