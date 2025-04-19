// src/components/NewPassword.tsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { confirmSignIn } from 'aws-amplify/auth';
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

const NewPassword: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { username } = location.state || { username: '' };
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    // 유효성 검사
    if (!newPassword) {
      setError(t('auth.password_required') || '비밀번호를 입력하세요');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError(t('auth.password_mismatch') || '비밀번호가 일치하지 않습니다');
      return;
    }
    
    // 비밀번호 강도 검사
    if (newPassword.length < 8) {
      setError(t('auth.password_too_short') || '비밀번호는 최소 8자 이상이어야 합니다');
      return;
    }
    
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
    
    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
      setError(t('auth.password_requirements') || '비밀번호는 대문자, 소문자, 숫자, 특수문자를 모두 포함해야 합니다');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Amplify Gen 2 방식으로 새 비밀번호 설정
      const result = await confirmSignIn({
        challengeResponse: newPassword
      });
      
      console.log('비밀번호 변경 결과:', result);
      
      if (result.isSignedIn) {
        // 로그인 성공 시 홈으로 이동
        navigate('/', { 
          state: { 
            message: t('auth.password_changed_success') || '비밀번호가 성공적으로 변경되었습니다' 
          }
        });
      } else if (result.nextStep) {
        // 추가 확인 단계가 필요한 경우
        setError(t('auth.additional_steps_required') || '추가 인증 단계가 필요합니다');
      }
    } catch (err: any) {
      console.error('비밀번호 변경 오류:', err);
      
      if (err.name === 'InvalidPasswordException' || err.message?.includes('password')) {
        setError(t('auth.invalid_password') || '비밀번호가 요구사항을 충족하지 않습니다');
      } else {
        setError(err.message || t('auth.password_change_error') || '비밀번호 변경 중 오류가 발생했습니다');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Box fontSize="heading-xl" fontWeight="bold">
        {t('auth.new_password_required') || '새 비밀번호 설정'}
      </Box>
      
      <Box variant="p" color="text-body-secondary">
        {t('auth.first_time_login') || '처음 로그인하셨거나 임시 비밀번호를 사용하고 계십니다. 새 비밀번호를 설정해주세요.'}
      </Box>
      
      {error && (
        <Alert type="error" dismissible onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <Form
        actions={
          <SpaceBetween direction="horizontal" size="xs">
            <Button
              variant="link"
              onClick={() => navigate('/signin')}
            >
              {t('auth.back_to_signin') || '로그인으로 돌아가기'}
            </Button>
            <Button
              variant="primary"
              loading={loading}
              onClick={handleSubmit}
            >
              {t('auth.confirm') || '확인'}
            </Button>
          </SpaceBetween>
        }
      >
        <SpaceBetween size="l">
          {username && (
            <FormField label={t('auth.username') || '사용자 이름'} secondaryControl={<Box color="text-status-info">{t('auth.cannot_change') || '변경 불가'}</Box>}>
              <Input
                value={username}
                disabled
              />
            </FormField>
          )}
          
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
                if (detail.key === 'Enter') handleSubmit();
              }}
            />
          </FormField>
        </SpaceBetween>
      </Form>
    </AuthLayout>
  );
};

export default NewPassword;