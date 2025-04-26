// src/pages/instructor/CatalogPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Header,
  SpaceBetween,
  Button,
  ContentLayout,
  BreadcrumbGroup
} from '@cloudscape-design/components';
import { useTranslation } from 'react-i18next';
import MainLayout from '@/components/layout/MainLayout';
import CatalogTable from '@/components/catalog/CatalogTable';
import { CourseCatalog } from '@/models/catalog';
import { listCatalogs } from '@/services/catalogService';

const CatalogPage: React.FC = () => {
  const { t } = useTranslation(['catalog', 'common']);
  const navigate = useNavigate();
  const [catalogs, setCatalogs] = useState<CourseCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        setLoading(true);
        const data = await listCatalogs();
        setCatalogs(data);
      } catch (err: any) {
        console.error('Error loading catalogs:', err);
        setError(err.message || t('common:errors.unknown'));
      } finally {
        setLoading(false);
      }
    };

    loadCatalogs();
  }, [t]);

  const handleViewDetails = (catalog: CourseCatalog) => {
    navigate(`/instructor/catalog/\${catalog.catalogId}`);
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
                { text: t('common:home'), href: '/' }
              ]}
              ariaLabel={t('common:breadcrumbs')}
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

export default CatalogPage;