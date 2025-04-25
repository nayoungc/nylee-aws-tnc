// app/components/admin/instructors/InstructorsTab.tsx
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
  Badge,
  ColumnLayout
} from '@cloudscape-design/components';
import InstructorForm from './InstructorForm';
import { fetchInstructors, deleteInstructor } from '@/api/instructorsApi';
import { Instructor } from '@/types/admin.types';
import { useNotification } from '@/contexts/NotificationContext';

const InstructorsTab: React.FC = () => {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Instructor[]>([]);
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);
  
  const { addNotification } = useNotification();

  useEffect(() => {
    loadInstructors();
  }, []);

  const loadInstructors = async () => {
    try {
      setLoading(true);
      const data = await fetchInstructors();
      setInstructors(data);
    } catch (error) {
      addNotification({
        type: 'error',
        content: '강사 데이터를 불러오는 중 오류가 발생했습니다.',
        dismissible: true
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredInstructors = instructors.filter(instructor => 
    instructor.name.toLowerCase().includes(filterText.toLowerCase()) || 
    instructor.email.toLowerCase().includes(filterText.toLowerCase()) ||
    instructor.specialties.some(s => s.toLowerCase().includes(filterText.toLowerCase()))
  );

  const paginatedInstructors = filteredInstructors.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleOpenModal = (instructor?: Instructor) => {
    setEditingInstructor(instructor || null);
    setIsModalVisible(true);
  };

  const handleDeleteInstructors = async () => {
    try {
      await Promise.all(selectedItems.map(instructor => deleteInstructor(instructor.id)));
      
      addNotification({
        type: 'success',
        content: '선택한 강사가 삭제되었습니다.',
        dismissible: true
      });
      
      loadInstructors();
      setSelectedItems([]);
    } catch (error) {
      addNotification({
        type: 'error',
        content: '강사 삭제 중 오류가 발생했습니다.',
        dismissible: true
      });
    }
  };

  const handleModalSubmit = () => {
    setIsModalVisible(false);
    loadInstructors();
  };

  return (
    <Box padding="s">
      <SpaceBetween size="l">
        <Table
          header={
            <Header
              counter={`(\${filteredInstructors.length})`}
              actions={
                <SpaceBetween direction="horizontal" size="xs">
                  <Button onClick={() => handleOpenModal()}>강사 추가</Button>
                  <Button 
                    disabled={selectedItems.length === 0}
                    onClick={handleDeleteInstructors}
                  >
                    삭제
                  </Button>
                </SpaceBetween>
              }
            >
              강사 관리
            </Header>
          }
          columnDefinitions={[
            { id: 'name', header: '이름', cell: item => item.name, sortingField: 'name' },
            { id: 'email', header: '이메일', cell: item => item.email },
            { id: 'phone', header: '연락처', cell: item => item.phone },
            { 
              id: 'specialties', 
              header: '전문 분야', 
              cell: item => (
                <Box>
                  {item.specialties.slice(0, 3).map((specialty, index) => (
                    <Badge key={index} color="blue">{specialty}</Badge>
                  ))}
                  {item.specialties.length > 3 && (
                    <Badge color="grey">+{item.specialties.length - 3}</Badge>
                  )}
                </Box>
              )
            },
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
          items={paginatedInstructors}
          loading={loading}
          loadingText="강사 데이터를 로드하는 중..."
          selectionType="multi"
          selectedItems={selectedItems}
          onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
          pagination={
            <Pagination
              currentPageIndex={currentPage}
              pagesCount={Math.ceil(filteredInstructors.length / pageSize)}
              onChange={({ detail }) => setCurrentPage(detail.currentPageIndex)}
            />
          }
          filter={
            <TextFilter
              filteringText={filterText}
              filteringAriaLabel="강사 검색"
              onChange={({ detail }) => setFilterText(detail.filteringText)}
              countText={`\${filteredInstructors.length} 건 일치`}
              placeholder="이름, 이메일 또는 전문분야로 검색"
            />
          }
          empty={
            <Box textAlign="center" padding="l">
              <SpaceBetween size="m">
                <b>강사가 없습니다</b>
                <Button onClick={() => handleOpenModal()}>강사 추가</Button>
              </SpaceBetween>
            </Box>
          }
        />
      </SpaceBetween>

      <Modal
        visible={isModalVisible}
        onDismiss={() => setIsModalVisible(false)}
        size="large"
        header={editingInstructor ? '강사 정보 편집' : '새 강사 추가'}
        closeAriaLabel="닫기"
      >
        <InstructorForm 
          instructor={editingInstructor}
          onSubmitSuccess={handleModalSubmit}
          onCancel={() => setIsModalVisible(false)}
        />
      </Modal>
    </Box>
  );
};

export default InstructorsTab;