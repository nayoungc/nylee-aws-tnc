// src/pages/catalog/CourseCatalogPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppLayout,
  Container,
  Header,
  SpaceBetween,
  BreadcrumbGroup,
  ContentLayout
} from '@cloudscape-design/components';
import CatalogTable from '@components/catalog/CatalogTable';
import CatalogDetailsModal from '@components/catalog/CatalogDetailsModal';
import { CourseCatalog } from '@models/catalog';
import { fetchCourseCatalogs } from '@services/CatalogService';
import { useAuth } from '@hooks/useAuth';

const CourseCatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [catalogs, setCatalogs] = useState<CourseCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCatalog, setSelectedCatalog] = useState<CourseCatalog | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // 사용자 권한 확인
  const isAdmin = user?.attributes?.['custom:role'] === 'admin';
  const isInstructor = user?.attributes?.['custom:role'] === 'instructor';
  const hasAccess = isAdmin || isInstructor;

  useEffect(() => {
    // 인증 상태 확인 후 권한 검사
    if (!authLoading) {
      if (!hasAccess) {
        // 권한 없으면 리다이렉트
        navigate('/login', { state: { message: '이 페이지에 접근할 권한이 없습니다.' } });
        return;
      }
      
      // 카탈로그 데이터 로드
      const loadCatalogs = async () => {
        setLoading(true);
        try {
          const data = await fetchCourseCatalogs();
          setCatalogs(data);
        } catch (err) {
          console.error('Failed to load catalogs:', err);
        } finally {
          setLoading(false);
        }
      };
      
      loadCatalogs();
    }
  }, [authLoading, hasAccess, navigate]);

  // 상세 정보 모달 열기
  const handleViewDetails = (catalog: CourseCatalog) => {
    setSelectedCatalog(catalog);
    setIsModalVisible(true);
  };

  // 상세 정보 모달 닫기
  const handleDismissModal = () => {
    setIsModalVisible(false);
  };

  // 인증 로딩 중이면 로딩 표시
  if (authLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <AppLayout
      content={
        <ContentLayout
          header={
            <Header variant="h1">과정 카탈로그 관리</Header>
          }
          breadcrumbs={
            <BreadcrumbGroup
              items={[
                { text: '홈', href: '/' },
                { text: '과정 관리', href: '/instructor/courses' },
                { text: '과정 카탈로그', href: '/instructor/catalog' }
              ]}
            />
          }
        >
          <SpaceBetween size="l">
            <Container
              header={
                <Header
                  variant="h2"
                  description="AWS 교육 과정 카탈로그 목록을 확인합니다."
                >
                  과정 카탈로그 목록
                </Header>
              }
            >
              <CatalogTable
                catalogs={catalogs}
                loading={loading}
                onViewDetails={handleViewDetails}
              />
            </Container>
          </SpaceBetween>
          
          <CatalogDetailsModal
            catalog={selectedCatalog}
            visible={isModalVisible}
            onDismiss={handleDismissModal}
          />
        </ContentLayout>
      }
      navigationHide
      toolsHide
    />
  );
};

export default CourseCatalogPage;