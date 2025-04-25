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

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState(false);
  const [code, setCode] = useState('');

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      setLoading(false);
      return;
    }

    try {
      await register(username, password, email);
      setConfirmation(true);
    } catch (err: any) {
      setError(err.message || '등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      {!confirmation ? (
        <form onSubmit={handleRegister}>
          <Form
            header={<Header variant="h1">계정 생성</Header>}
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <Button
                  variant="link"
                  onClick={() => navigate('/login')}
                >
                  로그인 화면으로 돌아가기
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  loading={loading}
                >
                  등록
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
              <FormField label="이메일">
                <Input
                  type="email"
                  value={email}
                  onChange={({ detail }) => setEmail(detail.value)}
                />
              </FormField>
              <FormField label="비밀번호">
                <Input
                  type="password"
                  value={password}
                  onChange={({ detail }) => setPassword(detail.value)}
                />
              </FormField>
              <FormField label="비밀번호 확인">
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
          header={<Header variant="h1">계정 확인</Header>}
          actions={
            <Button
              variant="primary"
              onClick={() => navigate('/login')}
            >
              확인 완료
            </Button>
          }
        >
          <SpaceBetween direction="vertical" size="l">
            <FormField label="인증 코드">
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
                  navigate('/login');
                } catch (err: any) {
                  setError(err.message || '인증 중 오류가 발생했습니다.');
                }
              }}
            >
              코드 확인
            </Button>
          </SpaceBetween>
        </Form>
      )}
    </Container>
  );
};

export default RegisterPage;
