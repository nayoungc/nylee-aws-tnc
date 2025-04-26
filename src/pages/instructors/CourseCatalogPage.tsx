// src/pages/instructor/CatalogPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Header,
  SpaceBetween,
  Button,
  ContentLayout,
  Alert
} from '@cloudscape-design/components';
import { useTranslation } from 'react-i18next';
import MainLayout from '@/components/layout/MainLayout';
import BreadcrumbGroup from '@/components/layout/BreadcrumbGroup'; // 커스텀 컴포넌트 사용
import CatalogTable from '@/components/catalog/CatalogTable';
import { useCatalogs } from '@/hooks/useCatalog';

const CourseCatalogPage: React.FC = () => {
  const { t } = useTranslation(['catalog', 'common']);
  const navigate = useNavigate();
  const { 
    data: catalogs = [], 
    isLoading: loading, 
    error,
    refetch 
  } = useCatalogs();

  const handleViewDetails = (catalog: { id: string }) => {
    navigate(`/instructor/catalog/\${catalog.id}`);
  };

  const handleCreateCatalog = () => {
    navigate('/instructor/catalog/create');
  };

  return (
    <MainLayout 
      activeHref="/instructor/catalog"
      title={t('catalog:title')}
    >
      <ContentLayout
        header={
          <SpaceBetween size="m">
            <BreadcrumbGroup
              items={[
                { text: t('common:home'), href: '/' },
                { text: t('common:instructor'), href: '/instructor' },
                { text: t('catalog:title'), href: '/instructor/catalog' } // href 추가
              ]}
            />
            
            <Header
              variant="h1"
              description={t('catalog:description')}
              actions={
                <Button
                  variant="primary"
                  iconName="add-plus"
                  onClick={handleCreateCatalog}
                >
                  {t('catalog:actions.createCatalog')}
                </Button>
              }
            >
              {t('catalog:title')}
            </Header>
          </SpaceBetween>
        }
      >
        {error && (
          <Alert 
            type="error" 
            dismissible 
            header={t('common:errors.loadFailed')}
            action={<Button onClick={() => refetch()}>{t('common:retry')}</Button>}
          >
            {error instanceof Error ? error.message : t('common:errors.unknown')}
          </Alert>
        )}
        
        <Container>
          <CatalogTable
            catalogs={catalogs}
            loading={loading}
            onViewDetails={handleViewDetails}
          />
        </Container>
      </ContentLayout>
    </MainLayout>
  );
};

export default CourseCatalogPage;