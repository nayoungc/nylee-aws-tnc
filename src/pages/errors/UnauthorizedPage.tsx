import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppTranslation } from '@/hooks/useAppTranslation';

import Container from "@cloudscape-design/components/container";
import Box from "@cloudscape-design/components/box";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Button from "@cloudscape-design/components/button";
import Alert from "@cloudscape-design/components/alert";

const UnauthorizedPage: React.FC = () => {
  const { t } = useAppTranslation();
  const navigate = useNavigate();
  
  return (
    <Container>
      <Box padding="l" textAlign="center">
        <SpaceBetween size="l" direction="vertical">
          <Box variant="h1">{t('errors.unauthorized.title')}</Box>
          
          <Alert type="error" header={t('errors.unauthorized.header')}>
            {t('errors.unauthorized.message')}
          </Alert>
          
          <Button onClick={() => navigate('/home')} variant="primary">
            {t('common.backToHome')}
          </Button>
          
          <Button onClick={() => navigate(-1)} variant="link">
            {t('common.goBack')}
          </Button>
        </SpaceBetween>
      </Box>
    </Container>
  );
};

export default UnauthorizedPage;