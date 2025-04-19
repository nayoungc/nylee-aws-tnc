// src/components/ForgotPassword.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { resetPassword, confirmResetPassword } from 'aws-amplify/auth';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../layouts/AuthLayout';
import { 
  Form, 
  SpaceBetween, 
  Button, 
  FormField, 
  Input, 
  Box,
  Alert
} from '@cloudscape-design/components';

const ForgotPassword: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // 단계 관리: SEND_CODE(코드 전송) 또는 CONFIRM_CODE(코드 확인 및 새 비밀번호 설정)
  const [step, setStep] = useState<'SEND_CODE' | 'CONFIRM_CODE'>('SEND_CODE');
  
  // 폼 상태 관리
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI 상태 관리
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deliveryDestination, setDeliveryDestination] = useState<string | null>(null);

  // 비밀번호 재설정 코드 요청
  const handleSendCode = async () => {
    if (!username) {
      setError(t('auth.username_required') || '사용자 이름을 입력하세요');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await resetPassword({ username });
      console.log('비밀번호 재설정 요청 결과:', result);
      
      // 결과에서 코드 전송 대상(이메일 또는 전화번호) 얻기
      const destination = result.nextStep?.codeDeliveryDetails?.destination;
      setDeliveryDestination(destination || null);
      
      // 다음 단계로 진행
      setStep('CONFIRM_CODE');
      setSuccessMessage(
        t('auth.reset_code_sent') || 
        `확인 코드가 \${destination ? destination : '등록된 이메일'}로 전송되었습니다.`
      );
    } catch (err: any) {
      console.error('비밀번호 재설정 요청 오류:', err);
      
      if (err.name === 'UserNotFoundException' || err.message?.includes('user') && err.message?.includes('exist')) {
        setError(t('auth.user_not_exist') || '사용자가 존재하지 않습니다');
      } else if (err.name === 'LimitExceededException' || err.message?.includes('limit')) {
        setError(t('auth.attempt_limit') || '요청 시도 횟수가 초과되었습니다. 잠시 후 다시 시도해주세요.');
      } else {
        setError(err.message || t('auth.reset_request_error') || '비밀번호 재설정 요청 중 오류가 발생했습니다');
      }
    } finally {
      setLoading(false);
    }
  };

  // 비밀번호 재설정 확인
  const handleResetPassword = async () => {
    if (!code) {
      setError(t('auth.code_required') || '확인 코드를 입력하세요');
      return;
    }
    
    if (!newPassword) {
      setError(t('auth.new_password_required') || '새 비밀번호를 입력하세요');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError(t('auth.password_mismatch') || '비밀번호가 일치하지 않습니다');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await confirmResetPassword({
        username,
        confirmationCode: code,
        newPassword
      });
      
      // 성공 메시지 표시 후 로그인 페이지로 이동
      setSuccessMessage(t('auth.password_reset_success') || '비밀번호가 성공적으로 재설정되었습니다');
      
      // 잠시 후 로그인 페이지로 리다이렉션
      setTimeout(() => {
        navigate('/signin', {
          state: {
            username,
            message: t('auth.password_reset_success') || '비밀번호가 재설정되었습니다. 새 비밀번호로 로그인하세요.'
          }
        });
      }, 2000);
      
    } catch (err: any) {
      console.error('비밀번호 재설정 오류:', err);
      
      if (err.name === 'CodeMismatchException' || err.message?.includes('confirmation code')) {
        setError(t('auth.code_mismatch') || '잘못된 확인 코드입니다');
      } else if (err.name === 'ExpiredCodeException' || err.message?.includes('expired')) {
        setError(t('auth.code_expired') || '확인 코드가 만료되었습니다');
      } else if (err.name === 'InvalidPasswordException' || err.message?.includes('password')) {
        setError(
          t('auth.invalid_password') || 
          '비밀번호가 요구사항을 충족하지 않습니다. 대문자, 소문자, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다.'
        );
      } else {
        setError(err.message || t('auth.reset_error') || '비밀번호 재설정 중 오류가 발생했습니다');
      }
    } finally {
      setLoading(false);
    }
  };

  // 처음 단계로 돌아가기
  const handleBackToSendCode = () => {
    setStep('SEND_CODE');
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <AuthLayout>
      <Box fontSize="heading-xl" fontWeight="bold">
        {t('auth.forgot_password') || '비밀번호 찾기'}
      </Box>
      
      {successMessage && (
        <Alert type="success" dismissible onDismiss={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}
      
      {error && (
        <Alert type="error" dismissible onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {step === 'SEND_CODE' ? (
        <Form
          actions={
            <SpaceBetween direction="vertical" size="xs">
              <Button
                variant="primary"
                loading={loading}
                onClick={handleSendCode}
              >
                {t('auth.send_code') || '확인 코드 전송'}
              </Button>
              
              <Box textAlign="center" padding={{ top: 's' }}>
                <Link to="/signin">{t('auth.back_to_signin') || '로그인으로 돌아가기'}</Link>
              </Box>
            </SpaceBetween>
          }
        >
          <FormField 
            label={t('auth.username') || '사용자 이름'}
            description={t('auth.username_description') || '가입 시 사용한 사용자 이름 또는 이메일을 입력하세요'}
          >
            <Input
              type="text"
              value={username}
              onChange={({ detail }) => setUsername(detail.value)}
              autoFocus
            />
          </FormField>
        </Form>
      ) : (
        <Form
          actions={
            <SpaceBetween direction="vertical" size="xs">
              <Button
                variant="primary"
                loading={loading}
                onClick={handleResetPassword}
              >
                {t('auth.reset_password') || '비밀번호 재설정'}
              </Button>
              
              <Box textAlign="center" padding={{ top: 's' }}>
                <Button 
                  variant="link" 
                  onClick={handleBackToSendCode}
                >
                  {t('auth.back_to_send_code') || '코드 다시 요청하기'}
                </Button>
              </Box>
            </SpaceBetween>
          }
        >
          <SpaceBetween size="l">
            <Box variant="p" color="text-body-secondary">
              {deliveryDestination ? (
                (t('auth.code_sent_to') || '확인 코드가 {destination}(으)로 전송되었습니다')
                  .replace('{destination}', deliveryDestination)
              ) : (
                t('auth.code_sent') || '확인 코드가 등록된 연락처로 전송되었습니다'
              )}
            </Box>
            
            <FormField label={t('auth.confirmation_code') || '확인 코드'}>
              <Input
                type="text"
                value={code}
                onChange={({ detail }) => setCode(detail.value)}
                autoFocus
              />
            </FormField>
            
            <FormField 
              label={t('auth.new_password') || '새 비밀번호'}
              description={t('auth.password_hint') || '8자 이상의 대문자, 소문자, 숫자, 특수문자 조합'}
            >
              <Input
                type="password"
                value={newPassword}
                onChange={({ detail }) => setNewPassword(detail.value)}
              />
            </FormField>
            
            <FormField label={t('auth.confirm_password') || '비밀번호 확인'}>
              <Input
                type="password"
                value={confirmPassword}
                onChange={({ detail }) => setConfirmPassword(detail.value)}
                onKeyDown={({ detail }) => {
                  if (detail.key === 'Enter') handleResetPassword();
                }}
              />
            </FormField>
          </SpaceBetween>
        </Form>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;