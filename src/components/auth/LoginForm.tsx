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

interface LoginFormProps {
  onLoginSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 폼 유효성 검증
    const { isValid, errors } = validateLoginForm(username, password);
    setFormErrors(errors);

    if (!isValid) return;

    setIsLoading(true);
    try {
      await login(username, password);
      setError(null);
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err: any) {
      setError(getLoginErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Container>
        <SpaceBetween size="l">
          {error && (
            <Alert type="error" header="로그인 실패">
              {error}
            </Alert>
          )}

          <Form
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <Button
                  variant="primary"
                  formAction="submit"
                  loading={isLoading}
                >
                  로그인
                </Button>
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
                />
              </FormField>
            </SpaceBetween>
          </Form>

          <Box textAlign="center">
            <p>※ 강사 및 관리자만 로그인할 수 있습니다.</p>
            <p>교육생은 로그인 없이 퀴즈와 설문조사에 참여할 수 있습니다.</p>
          </Box>
        </SpaceBetween>
      </Container>
    </form>
  );
};

export default LoginForm;