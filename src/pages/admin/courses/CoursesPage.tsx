// src/pages/courses/CoursesPage.tsx
import React, { useState, useEffect } from 'react';
import EnhancedTable from '@/components/common/EnhancedTable';
import { StatusIndicator, Link, Box, Button, Modal, SpaceBetween } from '@cloudscape-design/components';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/utils/dateUtils';

// Course 타입 정의
interface Course {
  id: string;
  title: string;
  code: string;
  category: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'draft' | 'archived' | 'upcoming';
  [key: string]: any; // 기타 동적 속성을 위한 인덱스 시그니처
}

// Status 타입 정의
type StatusType = 'success' | 'warning' | 'error' | 'info' | 'pending' | 'stopped';

const CoursesPage: React.FC = () => {
  const { t } = useTranslation(['courses', 'common']);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  
  // 컬럼 정의
  const columnDefinitions = [
    {
      id: 'title',
      header: t('courses:columns.title'),
      cell: (item: Course) => (
        <Link href={`/courses/\${item.id}`} fontSize="body-m">
          {item.title}
        </Link>
      ),
      sortingField: 'title',
      isRowHeader: true,
    },
    {
      id: 'code',
      header: t('courses:columns.code'),
      cell: (item: Course) => item.code,
      sortingField: 'code',
    },
    {
      id: 'category',
      header: t('courses:columns.category'),
      cell: (item: Course) => item.category,
      sortingField: 'category',
    },
    {
      id: 'startDate',
      header: t('courses:columns.startDate'),
      cell: (item: Course) => formatDate(item.startDate),
      sortingField: 'startDate',
    },
    {
      id: 'endDate',
      header: t('courses:columns.endDate'),
      cell: (item: Course) => formatDate(item.endDate),
      sortingField: 'endDate',
    },
    {
      id: 'status',
      header: t('courses:columns.status'),
      cell: (item: Course) => {
        const statusMap: Record<string, { type: StatusType; text: string }> = {
          active: { type: 'success', text: t('courses:status.active') },
          draft: { type: 'pending', text: t('courses:status.draft') },
          archived: { type: 'stopped', text: t('courses:status.archived') },
          upcoming: { type: 'info', text: t('courses:status.upcoming') }
        };
        
        const status = statusMap[item.status] || { type: 'error' as StatusType, text: item.status };
        
        return (
          <StatusIndicator type={status.type}>
            {status.text}
          </StatusIndicator>
        );
      },
      sortingField: 'status',
    },
    {
      id: 'actions',
      header: t('common:actions'),
      cell: (item: Course) => (
        // Box 대신 SpaceBetween 사용
        <SpaceBetween direction="horizontal" size="xs">
          <Button 
            iconName="edit"
            variant="icon"
            onClick={() => handleEditCourse(item)}
            ariaLabel={t('common:edit')}
          />
          <Button
            iconName="remove"
            variant="icon"
            onClick={() => handleDeleteCourse(item)}
            ariaLabel={t('common:delete')}
          />
        </SpaceBetween>
      ),
    }
  ];
  
  // 필터링 가능한 속성
  const filteringProperties = [
    { key: 'title', label: t('courses:columns.title') },
    { key: 'code', label: t('courses:columns.code') },
    { key: 'category', label: t('courses:columns.category') },
    { key: 'status', label: t('courses:columns.status') },
  ];
  
  // 데이터 불러오기
  const loadCourses = async () => {
    setLoading(true);
    try {
      // 실제 API 호출로 대체
      const response = await fetch('/api/courses');
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadCourses();
  }, []);
  
  // 핸들러 함수
  const handleCreateCourse = () => {
    // 구현
  };
  
  const handleEditCourse = (course: Course) => {
    // 구현
  };
  
  const handleDeleteCourse = (course: Course) => {
    setSelectedCourses([course]);
    setShowDeleteModal(true);
  };
  
  const handleSelectionChange = (items: Course[]) => {
    setSelectedCourses(items);
  };
  
  const handleBatchDelete = () => {
    setShowDeleteModal(true);
  };
  
  const confirmDelete = async () => {
    // 삭제 로직 구현
    setShowDeleteModal(false);
    setSelectedCourses([]);
    loadCourses(); // 목록 새로고침
  };
  
  return (
    <>
      <EnhancedTable
        title={t('courses:tableTitle')}
        description={t('courses:tableDescription')}
        columnDefinitions={columnDefinitions}
        items={courses}
        loading={loading}
        selectionType="multi"
        onSelectionChange={handleSelectionChange}
        onRefresh={loadCourses}
        actions={{
          primary: {
            text: t('courses:actions.createCourse'),
            onClick: handleCreateCourse
          }
        }}
        batchActions={[
          {
            text: t('common:actions.deleteSelected'),
            onClick: handleBatchDelete,
            disabled: selectedCourses.length === 0
          }
        ]}
        filteringProperties={filteringProperties}
        stickyHeader={true}
        stripedRows={true}
      />
      
      {/* 삭제 확인 모달 */}
      <Modal
        visible={showDeleteModal}
        onDismiss={() => setShowDeleteModal(false)}
        header={t('courses:deleteModal.title')}
        footer={
          <Box float="right">
            <Button
              variant="link"
              onClick={() => setShowDeleteModal(false)}
            >
              {t('common:cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={confirmDelete}
            >
              {t('common:delete')}
            </Button>
          </Box>
        }
      >
        {t('courses:deleteModal.confirmation', { count: selectedCourses.length })}
      </Modal>
    </>
  );
};

export default CoursesPage;