// app/components/admin/customers/CustomersTab.tsx
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
  StatusIndicator
} from '@cloudscape-design/components';
import CustomerForm from './CustomerForm';
import { fetchCustomers, deleteCustomer } from '@/api/customersApi';
import { Customer } from '@/types/admin.types';
import { useNotification } from '@/contexts/NotificationContext';

const CustomersTab: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Customer[]>([]);
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  
  const { addNotification } = useNotification();

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await fetchCustomers();
      setCustomers(data);
    } catch (error) {
      addNotification({
        type: 'error',
        content: '고객사 데이터를 불러오는 중 오류가 발생했습니다.',
        dismissible: true
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(filterText.toLowerCase()) || 
    customer.contactEmail.toLowerCase().includes(filterText.toLowerCase())
  );

  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleOpenModal = (customer?: Customer) => {
    setEditingCustomer(customer || null);
    setIsModalVisible(true);
  };

  const handleDeleteCustomers = async () => {
    try {
      await Promise.all(selectedItems.map(customer => deleteCustomer(customer.id)));
      
      addNotification({
        type: 'success',
        content: '선택한 고객사가 삭제되었습니다.',
        dismissible: true
      });
      
      loadCustomers();
      setSelectedItems([]);
    } catch (error) {
      addNotification({
        type: 'error',
        content: '고객사 삭제 중 오류가 발생했습니다.',
        dismissible: true
      });
    }
  };

  const handleModalSubmit = () => {
    setIsModalVisible(false);
    loadCustomers();
  };

  return (
    <Box padding="s">
      <SpaceBetween size="l">
        <Table
          header={
            <Header
              counter={`(\${filteredCustomers.length})`}
              actions={
                <SpaceBetween direction="horizontal" size="xs">
                  <Button onClick={() => handleOpenModal()}>고객사 추가</Button>
                  <Button 
                    disabled={selectedItems.length === 0}
                    onClick={handleDeleteCustomers}
                  >
                    삭제
                  </Button>
                </SpaceBetween>
              }
            >
              고객사 관리
            </Header>
          }
          columnDefinitions={[
            { id: 'name', header: '고객사명', cell: item => item.name, sortingField: 'name' },
            { id: 'contactName', header: '담당자', cell: item => item.contactName },
            { id: 'contactEmail', header: '이메일', cell: item => item.contactEmail },
            { id: 'contactPhone', header: '연락처', cell: item => item.contactPhone },
            { 
              id: 'status', 
              header: '상태', 
              cell: item => (
                <StatusIndicator type={item.active ? 'success' : 'stopped'}>
                  {item.active ? '활성' : '비활성'}
                </StatusIndicator>
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
          items={paginatedCustomers}
          loading={loading}
          loadingText="고객사 데이터를 로드하는 중..."
          selectionType="multi"
          selectedItems={selectedItems}
          onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
          pagination={
            <Pagination
              currentPageIndex={currentPage}
              pagesCount={Math.ceil(filteredCustomers.length / pageSize)}
              onChange={({ detail }) => setCurrentPage(detail.currentPageIndex)}
            />
          }
          filter={
            <TextFilter
              filteringText={filterText}
              filteringAriaLabel="고객사 검색"
              onChange={({ detail }) => setFilterText(detail.filteringText)}
              countText={`\${filteredCustomers.length} 건 일치`}
              placeholder="고객사명 또는 이메일로 검색"
            />
          }
          empty={
            <Box textAlign="center" padding="l">
              <SpaceBetween size="m">
                <b>고객사가 없습니다</b>
                <Button onClick={() => handleOpenModal()}>고객사 추가</Button>
              </SpaceBetween>
            </Box>
          }
        />
      </SpaceBetween>

      <Modal
        visible={isModalVisible}
        onDismiss={() => setIsModalVisible(false)}
        size="large"
        header={editingCustomer ? '고객사 편집' : '새 고객사 추가'}
        closeAriaLabel="닫기"
      >
        <CustomerForm 
          customer={editingCustomer}
          onSubmitSuccess={handleModalSubmit}
          onCancel={() => setIsModalVisible(false)}
        />
      </Modal>
    </Box>
  );
};

export default CustomersTab;