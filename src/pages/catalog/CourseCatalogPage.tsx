// src/pages/catalog/CourseCatalogPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Button,
  Container,
  ContentLayout,
  Header,
  SpaceBetween,
  Alert,
  Box
} from '@cloudscape-design/components';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CatalogTable from '@/components/catalog/CatalogTable';
import { CourseCatalog } from '@/models/catalog';
import MainLayout from '@/components/layout/MainLayout';
import BreadcrumbGroup from '@/components/layout/BreadcrumbGroup';
import { listCatalogs } from '@/services/catalogService'; // API 호출 함수 가져오기

// 임시 데이터 - API 연결이 실패할 경우 대체 데이터로 사용
const MOCK_CATALOGS: CourseCatalog[] = [
  {
    id: '1',
    title: 'AWS 클라우드 기초',
    awsCode: 'AWS-100',
    version: '1.0',
    durations: 8,
    level: '입문',
    description: 'AWS 클라우드 서비스의 기본 개념 학습',
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Amazon S3 심화 과정',
    awsCode: 'AWS-203',
    version: '2.1',
    durations: 16,
    level: '중급',
    description: 'S3 스토리지 서비스의 고급 기능 학습',
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '3', 
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
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);
  const navigate = useNavigate();

  const loadCatalogs = async (useFallback = false) => {
    setLoading(true);
    setError(null);

    try {
      if (useFallback) {
        // 목업 데이터 사용
        setCatalogs(MOCK_CATALOGS);
        setUseMockData(true);
      } else {
        // 실제 API 호출
        const data = await listCatalogs();
        setCatalogs(data);
        setUseMockData(false);
      }
    } catch (err: any) {
      console.error('카탈로그 데이터를 불러오는 데 실패했습니다:', err);
      setError(t('catalog:errors.fetchFailed'));
      
      // API 호출 실패 시 자동으로 목업 데이터 사용
      if (!useFallback) {
        console.log('목업 데이터로 대체합니다.');
        setCatalogs(MOCK_CATALOGS);
        setUseMockData(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalogs();
  }, []);

  const handleRetry = () => {
    loadCatalogs();
  };

  const handleFallback = () => {
    loadCatalogs(true);
  };

  const handleViewDetails = (catalog: CourseCatalog) => {
    navigate(`/instructor/catalog/\${catalog.id}`); // 수정된 템플릿 리터럴
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
        {error && (
          <Alert
            type="error"
            header={t('common:error')}
            action={
              <SpaceBetween direction="horizontal" size="xs">
                <Button onClick={handleRetry}>{t('common:retry')}</Button>
                {!useMockData && (
                  <Button onClick={handleFallback}>{t('catalog:actions.useMockData')}</Button>
                )}
              </SpaceBetween>
            }
            dismissible
            onDismiss={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {useMockData && !error && (
          <Alert
            type="info"
            header={t('catalog:mockData.title')}
            action={<Button onClick={handleRetry}>{t('catalog:actions.tryRealData')}</Button>}
            dismissible
          >
            {t('catalog:mockData.description')}
          </Alert>
        )}

        <Container>
          <CatalogTable
            catalogs={catalogs}
            loading={loading}
            onViewDetails={handleViewDetails}
          />
          
          {!loading && catalogs.length === 0 && !error && (
            <Box textAlign="center" padding="l">
              {t('catalog:noCatalogs')}
            </Box>
          )}
        </Container>
      </ContentLayout>
    </MainLayout>
  );
};

export default CourseCatalogPage;