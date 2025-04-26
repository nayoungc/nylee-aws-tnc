// src/components/catalog/CatalogDetailsModal.tsx
import React from 'react';
import {
  Modal,
  Box,
  SpaceBetween,
  ColumnLayout,
  StatusIndicator
} from '@cloudscape-design/components';
import { CourseCatalog } from '@models/catalog';

interface CatalogDetailsModalProps {
  catalog: CourseCatalog | null;
  visible: boolean;
  onDismiss: () => void;
}

const CatalogDetailsModal: React.FC<CatalogDetailsModalProps> = ({ 
  catalog, 
  visible, 
  onDismiss 
}) => {
  if (!catalog) return null;

  // 날짜 포맷팅 함수
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 레벨에 따른 상태 표시
  const getLevelIndicator = (level?: string) => {
    if (!level) return <StatusIndicator type="info">미정</StatusIndicator>;
    
    switch (level) {
      case '입문':
        return <StatusIndicator type="success">입문</StatusIndicator>;
      case '중급':
        return <StatusIndicator type="info">중급</StatusIndicator>;
      case '고급':
        return <StatusIndicator type="warning">고급</StatusIndicator>;
      default:
        return <StatusIndicator type="info">{level}</StatusIndicator>;
    }
  };

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      size="large"
      header={catalog.title}
    >
      <SpaceBetween size="l">
        <ColumnLayout columns={2} variant="text-grid">
          <SpaceBetween size="l">
            <div>
              <Box variant="awsui-key-label">카탈로그 ID</Box>
              <div>{catalog.catalogId}</div>
            </div>
            <div>
              <Box variant="awsui-key-label">제목</Box>
              <div>{catalog.title}</div>
            </div>
            <div>
              <Box variant="awsui-key-label">버전</Box>
              <div>{catalog.version}</div>
            </div>
            <div>
              <Box variant="awsui-key-label">AWS 코드</Box>
              <div>{catalog.awsCode || '-'}</div>
            </div>
          </SpaceBetween>
          
          <SpaceBetween size="l">
            <div>
              <Box variant="awsui-key-label">수강 시간</Box>
              <div>{catalog.hours ? `\${catalog.hours}시간` : '-'}</div>
            </div>
            <div>
              <Box variant="awsui-key-label">난이도</Box>
              <div>{getLevelIndicator(catalog.level)}</div>
            </div>
            <div>
              <Box variant="awsui-key-label">생성일</Box>
              <div>{formatDate(catalog.createdAt)}</div>
            </div>
            <div>
              <Box variant="awsui-key-label">최종 수정일</Box>
              <div>{formatDate(catalog.updatedAt)}</div>
            </div>
          </SpaceBetween>
        </ColumnLayout>
        
        <div>
          <Box variant="awsui-key-label">설명</Box>
          <Box padding={{ top: 'xs' }}>{catalog.description || '설명이 없습니다.'}</Box>
        </div>
      </SpaceBetween>
    </Modal>
  );
};

export default CatalogDetailsModal;