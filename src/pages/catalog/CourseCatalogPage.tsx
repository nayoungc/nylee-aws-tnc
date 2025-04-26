// src/pages/catalog/CourseCatalogPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Button,
  Container,
  ContentLayout,
  Header,
  SpaceBetween
} from '@cloudscape-design/components';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CatalogTable from '@/components/catalog/CatalogTable';
import { CourseCatalog } from '@/models/catalog';
import MainLayout from '@/components/layout/MainLayout';
import BreadcrumbGroup from '@/components/layout/BreadcrumbGroup';

// 임시 데이터 - 실제로는 API에서 가져옴
const MOCK_CATALOGS: CourseCatalog[] = [
  {
    catalogId: '1',
    title: 'AWS 클라우드 기초',
    awsCode: 'AWS-100',
    version: '1.0',
    durations: 8,
    level: '입문',
    description: 'AWS 클라우드 서비스의 기본 개념 학습',
    updatedAt: new Date().toISOString()
  },
  {
    catalogId: '2',
    title: 'Amazon S3 심화 과정',
    awsCode: 'AWS-203',
    version: '2.1',
    durations: 16,
    level: '중급',
    description: 'S3 스토리지 서비스의 고급 기능 학습',
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    catalogId: '3', 
    title: 'AWS Lambda와 서버리스 아키텍처',
    awsCode: 'AWS-305',
    version: '3.2',
    durations: 24,
    level: '고급',
    description: '서버리스 애플리케이션 개발 및 배포',
    updatedAt: new Date(Date.now() - 172800000).toISOString()
  }
];

const CourseCatalogPage: React.FC = () => {
  const { t } = useTranslation(['catalog', 'common', 'navigation']);
  const [catalogs, setCatalogs] = useState<CourseCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // 실제로는 API 호출하여 데이터를 가져옴
    const fetchCatalogs = async () => {
      try {
        // API 호출 시뮬레이션
        setTimeout(() => {
          setCatalogs(MOCK_CATALOGS);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('카탈로그 데이터를 불러오는 데 실패했습니다:', error);
        setLoading(false);
      }
    };

    fetchCatalogs();
  }, []);

  const handleViewDetails = (catalog: CourseCatalog) => {
    navigate(`/instructor/catalog/\${catalog.catalogId}`);
  };

  const handleCreateCatalog = () => {
    navigate('/instructor/catalog/create');
  };

  return (
    <MainLayout>
      <ContentLayout
        header={
          <Header
            variant="h1"
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <Button onClick={handleCreateCatalog}>{t('catalog:actions.createCatalog')}</Button>
              </SpaceBetween>
            }
          >
            {t('catalog:title')}
          </Header>
        }
        breadcrumbs={
          <BreadcrumbGroup
            items={[
              { text: t('common:home'), href: '/' },
              { text: t('navigation:instructor.title'), href: '/instructor' },
              { text: t('navigation:instructor.catalog'), href: '/instructor/catalog' }
            ]}
          />
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

export default CourseCatalogPage;