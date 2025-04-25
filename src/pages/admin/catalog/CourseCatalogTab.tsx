// app/components/admin/catalog/CourseCatalogTab.tsx
import React, { useState, useEffect } from 'react';
import {
  Table,
  Box,
  Button,
  SpaceBetween,
  TextFilter,
  Header,
  Pagination,
  Modal,
  CollectionPreferences
} from '@cloudscape-design/components';
import CourseForm from './CourseForm';
import { fetchCourses, deleteCourse } from '@/api/coursesApi';
import { Course } from '@/types/admin.types';
import { useNotification } from '@/contexts/NotificationContext';

const CourseCatalogTab: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Course[]>([]);
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  
  const { addNotification } = useNotification();

  // 과정 데이터 로드
  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await fetchCourses();
      setCourses(data);
    } catch (error) {
      addNotification({
        type: 'error',
        content: '과정 데이터를 불러오는 중 오류가 발생했습니다.',
        dismissible: true
      });
    } finally {
      setLoading(false);
    }
  };

  // 필터링된 과정 목록
  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(filterText.toLowerCase()) || 
    course.code.toLowerCase().includes(filterText.toLowerCase())
  );

  // 페이지네이션된 과정 목록
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // 과정 추가/편집 모달 처리
  const handleOpenModal = (course?: Course) => {
    setEditingCourse(course || null);
    setIsModalVisible(true);
  };

  // 과정 삭제 처리
  const handleDeleteCourses = async () => {
    try {
      await Promise.all(selectedItems.map(course => deleteCourse(course.id)));
      
      addNotification({
        type: 'success',
        content: '선택한 과정이 삭제되었습니다.',
        dismissible: true
      });
      
      loadCourses(); // 데이터 다시 로드
      setSelectedItems([]); // 선택 초기화
    } catch (error) {
      addNotification({
        type: 'error',
        content: '과정 삭제 중 오류가 발생했습니다.',
        dismissible: true
      });
    }
  };

  // 모달 저장 완료 처리
  const handleModalSubmit = () => {
    setIsModalVisible(false);
    loadCourses(); // 데이터 다시 로드
  };

  return (
    <Box padding="s">
      <SpaceBetween size="l">
        <Table
          header={
            <Header
              counter={`(\${filteredCourses.length})`}
              actions={
                <SpaceBetween direction="horizontal" size="xs">
                  <Button onClick={() => handleOpenModal()}>과정 추가</Button>
                  <Button 
                    disabled={selectedItems.length === 0}
                    onClick={handleDeleteCourses}
                  >
                    삭제
                  </Button>
                </SpaceBetween>
              }
            >
              과정 카탈로그
            </Header>
          }
          columnDefinitions={[
            { id: 'code', header: '코드', cell: item => item.code, sortingField: 'code' },
            { id: 'title', header: '과정명', cell: item => item.title, sortingField: 'title' },
            { id: 'category', header: '카테고리', cell: item => item.category },
            { id: 'duration', header: '기간', cell: item => `\${item.duration}일` },
            { 
              id: 'actions', 
              header: '작업', 
              cell: item => (
                <Button variant="link" onClick={() => handleOpenModal(item)}>
                  편집
                </Button>
              ) 
            }
          ]}
          items={paginatedCourses}
          loading={loading}
          loadingText="과정 데이터를 로드하는 중..."
          selectionType="multi"
          selectedItems={selectedItems}
          onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
          pagination={
            <Pagination
              currentPageIndex={currentPage}
              pagesCount={Math.ceil(filteredCourses.length / pageSize)}
              onChange={({ detail }) => setCurrentPage(detail.currentPageIndex)}
            />
          }
          filter={
            <TextFilter
              filteringText={filterText}
              filteringAriaLabel="과정 검색"
              onChange={({ detail }) => setFilterText(detail.filteringText)}
              countText={`\${filteredCourses.length} 건 일치`}
              placeholder="과정명 또는 코드로 검색"
            />
          }
          preferences={
            <CollectionPreferences
              title="환경설정"
              confirmLabel="확인"
              cancelLabel="취소"
              preferences={{
                pageSize: pageSize
              }}
              pageSizePreference={{
                title: "페이지 크기",
                options: [
                  { value: 10, label: "10개" },
                  { value: 25, label: "25개" },
                  { value: 50, label: "50개" }
                ]
              }}
              onConfirm={({ detail }) => setPageSize(detail.preferences.pageSize || 10)}
            />
          }
          empty={
            <Box textAlign="center" padding="l">
              <SpaceBetween size="m">
                <b>과정이 없습니다</b>
                <Button onClick={() => handleOpenModal()}>과정 추가</Button>
              </SpaceBetween>
            </Box>
          }
        />
      </SpaceBetween>

      {/* 과정 추가/편집 모달 */}
      <Modal
        visible={isModalVisible}
        onDismiss={() => setIsModalVisible(false)}
        size="large"
        header={editingCourse ? '과정 편집' : '새 과정 추가'}
        closeAriaLabel="닫기"
      >
        <CourseForm 
          course={editingCourse}
          onSubmitSuccess={handleModalSubmit}
          onCancel={() => setIsModalVisible(false)}
        />
      </Modal>
    </Box>
  );
};

export default CourseCatalogTab;
