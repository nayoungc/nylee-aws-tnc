import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Header,
  SpaceBetween,
  Form,
  FormField,
  Input,
  Button,
  Alert
} from '@cloudscape-design/components';
import { useAuth } from '../hooks/useAuth';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // 입력 유효성 검사
    if (!username || !password) {
      setError('사용자 이름과 비밀번호를 모두 입력해주세요.');
      return;
    }
    
    setError('');
    setIsLoading(true);

    try {
      const result = await login(username, password);
      if (result.success) {
        navigate('/');
      } else {
        // 더 안전한 에러 처리
        const errorMessage: string = 
          typeof result.error === 'string' ? result.error : 
          result.error && typeof result.error === 'object' && 'message' in result.error ? String(result.error.message) : 
          '로그인에 실패했습니다. 자격 증명을 확인해주세요.';
        
        setError(errorMessage);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      // 에러 객체를 더 안전하게 처리
      const errorMessage: string = 
        err && typeof err === 'object' && 'message' in err ? String(err.message) : 
        '예기치 않은 오류가 발생했습니다.';
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '20px', textAlign: 'center' }}>
  계정이 없으신가요? <Button variant="link" onClick={() => navigate('/signup')}>회원가입</Button>
</div>
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: 'calc(100vh - 60px)', 
      background: '#f2f3f3' 
    }}>
      <Container
        header={
          <Header variant="h1">
            AWS Training & Certification
          </Header>
        }
      >
        <Form
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button 
                variant="primary"
                loading={isLoading} 
                onClick={() => handleLogin()}
                disabled={isLoading || !username || !password}
              >
                로그인
              </Button>
            </SpaceBetween>
          }
        >
          <SpaceBetween size="l">
            {error && (
              <Alert type="error">
                {error}
              </Alert>
            )}
            
            <FormField
              label="사용자 이름"
              description="이메일 주소를 입력하세요"
            >
              <Input
                type="email"
                value={username}
                onChange={({ detail }) => setUsername(detail.value)}
                onKeyDown={({ detail }) => {
                  if (detail.key === 'Enter') {
                    handleLogin();
                  }
                }}
                disabled={isLoading}
                placeholder="example@email.com"
                autoFocus
              />
            </FormField>
            
            <FormField
              label="비밀번호"
            >
              <Input
                type="password"
                value={password}
                onChange={({ detail }) => setPassword(detail.value)}
                onKeyDown={({ detail }) => {
                  if (detail.key === 'Enter') {
                    handleLogin();
                  }
                }}
                disabled={isLoading}
              />
            </FormField>
          </SpaceBetween>
        </Form>
      </Container>
    </div>
  );
};

export default Login;