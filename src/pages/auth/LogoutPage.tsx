import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAppTranslation } from '@/hooks/useAppTranslation';

import Container from "@cloudscape-design/components/container";
import Box from "@cloudscape-design/components/box";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Button from "@cloudscape-design/components/button";

const LogoutPage: React.FC = () => {
  const { t } = useAppTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    handleLogout();
  }, []);
  
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const result = await logout();
      if (result.success) {
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(t('logout.error'));
      }
    } catch (e) {
      console.error('로그아웃 오류:', e);
      setError(t('logout.error'));
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  return (
    <Container>
      <Box padding="l" textAlign="center">
        <SpaceBetween size="l" direction="vertical">
          <Box variant="h1">{t('logout.title')}</Box>
          
          {error ? (
            <>
              <Box variant="p" color="text-status-error">{error}</Box>
              <Button onClick={handleLogout} loading={isLoggingOut}>
                {t('logout.retry')}
              </Button>
              <Button variant="link" onClick={() => navigate('/login')}>
                {t('logout.backToLogin')}
              </Button>
            </>
          ) : (
            <>
              <div className="spinner"></div>
              <Box variant="p">
                {isLoggingOut ? t('logout.processing') : t('logout.success')}
              </Box>
              <Box variant="p" color="text-body-secondary">
                {t('logout.redirect')}
              </Box>
            </>
          )}
        </SpaceBetween>
      </Box>
    </Container>
  );
};

export default LogoutPage;