// src/components/catalog/CatalogDetailsModal.tsx
import React from 'react';
import {
  Modal,
  Box,
  SpaceBetween,
  ColumnLayout,
  StatusIndicator
} from '@cloudscape-design/components';
import { CourseCatalog } from '@/models/courseCatalog';

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
    
    switch (level.toLowerCase()) {
      case '입문':
      case 'beginner':
      case 'foundational':
        return <StatusIndicator type="success">입문</StatusIndicator>;
      case '중급':
      case 'intermediate':
        return <StatusIndicator type="info">중급</StatusIndicator>;
      case '고급':
      case 'advanced':
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
      header={catalog.course_name}
    >
      <SpaceBetween size="l">
        <ColumnLayout columns={2} variant="text-grid">
          <SpaceBetween size="l">
            <div>
              <Box variant="awsui-key-label">카탈로그 ID</Box>
              <div>{catalog.id}</div>
            </div>
            <div>
              <Box variant="awsui-key-label">과정명</Box>
              <div>{catalog.course_name}</div>
            </div>
            {catalog.course_id && (
              <div>
                <Box variant="awsui-key-label">과정 코드</Box>
                <div>{catalog.course_id}</div>
              </div>
            )}
            {catalog.delivery_method && (
              <div>
                <Box variant="awsui-key-label">수강 방식</Box>
                <div>{catalog.delivery_method}</div>
              </div>
            )}
          </SpaceBetween>
          
          <SpaceBetween size="l">
            <div>
              <Box variant="awsui-key-label">수강 시간</Box>
              <div>{catalog.duration ? catalog.duration : '-'}</div>
            </div>
            <div>
              <Box variant="awsui-key-label">난이도</Box>
              <div>{getLevelIndicator(catalog.level)}</div>
            </div>
            {catalog.target_audience && (
              <div>
                <Box variant="awsui-key-label">대상 수강생</Box>
                <div>{catalog.target_audience}</div>
              </div>
            )}
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
        
        {catalog.description && (
          <div>
            <Box variant="awsui-key-label">설명</Box>
            <Box padding={{ top: 'xs' }}>{catalog.description}</Box>
          </div>
        )}

        {catalog.objectives && catalog.objectives.length > 0 && (
          <div>
            <Box variant="awsui-key-label">학습 목표</Box>
            <Box padding={{ top: 'xs' }}>
              <ul>
                {catalog.objectives.map((objective, index) => (
                  <li key={index}>{objective}</li>
                ))}
              </ul>
            </Box>
          </div>
        )}
      </SpaceBetween>
    </Modal>
  );
};

export default CatalogDetailsModal;