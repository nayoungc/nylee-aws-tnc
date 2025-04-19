import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { handleConfirmSignUp } from '../utils/auth';
import { useTranslation } from 'react-i18next';
import AuthLayout from './AuthLayout';
import { 
  Form, 
  SpaceBetween, 
  Button, 
  FormField, 
  Input, 
  Box,
  Alert
} from '@cloudscape-design/components';

const ConfirmSignUp: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { username, email, destination } = location.state || { username: '', email: '', destination: '' };
  
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmClick = async () => {
    if (!username) {
      setError(t('auth.username_required') || '사용자 이름이 필요합니다');
      return;
    }
    
    if (!code) {
      setError(t('auth.code_required') || '인증 코드를 입력하세요');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const confirmResult = await handleConfirmSignUp(username, code);
      console.log('인증 결과:', confirmResult);
      
      // 자동 로그인이 성공적으로 완료된 경우
      if (confirmResult.autoSignIn?.nextStep?.signInStep === 'DONE') {
        navigate('/');
      } 
      // 자동 로그인이 불필요하거나 실패한 경우
      else {
        navigate('/signin', { 
          state: { 
            username,
            message: t('auth.confirm_success') || '계정이 확인되었습니다. 로그인해주세요.'
          } 
        });
      }
    } catch (err: any) {
      if (err.name === 'CodeMismatchException') {
        setError(t('auth.code_mismatch') || '잘못된 인증 코드입니다');
      } else if (err.name === 'ExpiredCodeException') {
        setError(t('auth.code_expired') || '인증 코드가 만료되었습니다');
      } else {
        setError(err.message || t('auth.confirm_error') || '인증에 실패했습니다');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = () => {
    // 인증 코드 재전송 로직 구현 필요
    // 아직 미구현
    alert('코드 재전송 기능은 아직 구현되지 않았습니다');
  };

  return (
    <AuthLayout>
      <Box fontSize="heading-xl" fontWeight="bold">
        {t('auth.confirm_signup') || '회원가입 확인'}
      </Box>
      
      <Box variant="p" color="text-body-secondary">
        {destination ? 
          (t('auth.code_sent_to') || '인증 코드가 {destination}(으)로 전송되었습니다').replace('{destination}', destination) : 
          (t('auth.confirmation_code_sent') || '인증 코드가 입력하신 이메일로 전송되었습니다')
        }
      </Box>
      
      {error && (
        <Alert type="error" dismissible>
          {error}
        </Alert>
      )}
      
      <Form
        actions={
          <SpaceBetween direction="vertical" size="xs">
            <Button
              variant="primary"
              loading={loading}
              onClick={handleConfirmClick}
              data-testid="confirm-button"
            >
              {t('auth.confirm') || '확인'}
            </Button>
            
            <Box textAlign="center" padding={{ top: 's' }}>
              <Link to="#" onClick={(e) => { e.preventDefault(); handleResendCode(); }}>
                {t('auth.resend_code') || '인증 코드 재전송'}
              </Link>
            </Box>
          </SpaceBetween>
        }
      >
        <FormField 
          label={t('auth.confirmation_code') || '인증 코드'}
          description={t('auth.code_description') || '이메일로 받은 6자리 코드를 입력하세요'}
        >
          <Input
            type="text"
            value={code}
            onChange={({ detail }) => setCode(detail.value)}
            placeholder="123456"
          />
        </FormField>
      </Form>
    </AuthLayout>
  );
};

export default ConfirmSignUp;