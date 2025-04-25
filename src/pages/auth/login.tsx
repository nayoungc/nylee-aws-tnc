import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  SpaceBetween, 
  Form, 
  FormField, 
  Input, 
  Button, 
  Header 
} from '@cloudscape-design/components';
import { useAuth } from '../../auth/auth-context';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <form onSubmit={handleLogin}>
        <Form
          header={<Header variant="h1">교육 관리 시스템 로그인</Header>}
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                variant="link"
                onClick={() => navigate('/register')}
              >
                계정 생성
              </Button>
              <Button
                variant="primary"
                type="submit"
                loading={loading}
              >
                로그인
              </Button>
            </SpaceBetween>
          }
          errorText={error}
        >
          <SpaceBetween direction="vertical" size="l">
            <FormField label="사용자 이름">
              <Input
                type="text"
                value={username}
                onChange={({ detail }) => setUsername(detail.value)}
              />
            </FormField>
            <FormField label="비밀번호">
              <Input
                type="password"
                value={password}
                onChange={({ detail }) => setPassword(detail.value)}
              />
            </FormField>
          </SpaceBetween>
        </Form>
      </form>
    </Container>
  );
};

export default LoginPage;
