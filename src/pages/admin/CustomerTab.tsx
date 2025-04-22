import {
  Alert,
  Box,
  Button,
  FormField,
  Header,
  Input,
  Modal,
  Pagination,
  SpaceBetween,
  Table,
  TextFilter
} from '@cloudscape-design/components';
import { useTypedTranslation } from '@utils/i18n-utils';
import React, { useEffect, useState } from 'react';

import {
  createCustomer,
  deleteCustomer,
  listCustomers,
  updateCustomer
} from '@api/customers';
import {
  Customer
} from '@api/types';
import { v4 as uuidv4 } from 'uuid';

const CustomerTab: React.FC = () => {
  const { tString, t } = useTypedTranslation();

  // 상태 관리
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState<boolean>(false);
  const [filterText, setFilterText] = useState<string>('');
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  // 고객사 목록 불러오기
  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await listCustomers({
        limit: 20
      });
      
      if (response.data) {
        setCustomers(response.data as Customer[]);
      }
    } catch (err) {
      console.error(t('admin.customers.error_loading'), err);
      setError(t('admin.customers.error_loading'));
    } finally {
      setLoading(false);
    }
  };
  
  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchCustomers();
  }, []);
  
  // 필터링된 아이템
  const filteredItems = customers.filter(customer => 
    !filterText || 
    customer.customerName?.toLowerCase().includes(filterText.toLowerCase())
  );
  
  // 페이지당 아이템 수
  const PAGE_SIZE = 10;
  const paginatedItems = filteredItems.slice(
    (currentPageIndex - 1) * PAGE_SIZE, 
    currentPageIndex * PAGE_SIZE
  );
  
  // 새 고객사 만들기
  const handleCreateCustomer = () => {
    setCurrentCustomer({
      customerId: uuidv4(),
      customerName: '',
    });
    setIsModalVisible(true);
  };
  
  // 고객사 수정
  const handleEditCustomer = (customer: Customer) => {
    setCurrentCustomer({...customer});
    setIsModalVisible(true);
  };
  
  // 고객사 삭제 모달 표시
  const handleDeleteCustomerClick = (customer: Customer) => {
    setCurrentCustomer(customer);
    setIsDeleteModalVisible(true);
  };
  
  // 고객사 저장 (생성/수정)
  const handleSaveCustomer = async () => {
    if (!currentCustomer || !currentCustomer.customerName) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (currentCustomer.customerId) {
        // 기존 고객사 수정
        const customerInput = {
          customerId: currentCustomer.customerId,
          customerName: currentCustomer.customerName,
        };

        const response = await updateCustomer(customerInput);
        
        // 수정된 고객사로 상태 업데이트
        if (response.data) {
          setCustomers(prevCustomers => 
            prevCustomers.map(c => c.customerId === currentCustomer.customerId ? response.data as Customer : c)
          );
        }
      } else {
        // 새 고객사 생성
        const customerInput = {
          customerId: uuidv4(),
          customerName: currentCustomer.customerName,
        };

        const response = await createCustomer(customerInput);
        
        // 생성된 고객사 추가
        if (response.data) {
          setCustomers(prevCustomers => [...prevCustomers, response.data as Customer]);
        }
      }
      
      // 모달 닫기
      setIsModalVisible(false);
      setCurrentCustomer(null);
    } catch (err) {
      console.error(t('admin.customers.error_saving'), err);
      setError(t('admin.customers.error_saving'));
    } finally {
      setLoading(false);
    }
  };
  
  // 고객사 삭제
  const handleDeleteCustomer = async () => {
    if (!currentCustomer?.customerId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await deleteCustomer(currentCustomer.customerId);
      
      if (response.data) {
        // 삭제된 고객사 제거
        setCustomers(prevCustomers => 
          prevCustomers.filter(c => c.customerId !== currentCustomer.customerId)
        );
      }
      
      // 모달 닫기
      setIsDeleteModalVisible(false);
      setCurrentCustomer(null);
    } catch (err) {
      console.error(t('admin.customers.error_deleting'), err);
      setError(t('admin.customers.error_deleting'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box padding="m">
      {error && <Alert type="error">{error}</Alert>}
      
      <Header
        actions={
          <Button variant="primary" onClick={handleCreateCustomer}>
            {t('admin.customers.add_new')}
          </Button>
        }
      >
        {t('admin.customers.title')}
      </Header>
      
      <TextFilter
        filteringText={filterText}
        filteringPlaceholder={tString('admin.customers.search_placeholder')}
        filteringAriaLabel={tString('admin.customers.search_aria_label')}
        onChange={({ detail }) => setFilterText(detail.filteringText)}
      />
      
      <Table
        items={paginatedItems}
        loading={loading}
        columnDefinitions={[
          {
            id: 'customerName',
            header: t('admin.customers.name'),
            cell: item => item.customerName || '-',
            sortingField: 'customerName',
          },
          {
            id: 'actions',
            header: t('admin.common.actions'),
            cell: item => (
              <SpaceBetween direction="horizontal" size="xs">
                <Button onClick={() => handleEditCustomer(item)}>
                  {t('admin.common.edit')}
                </Button>
                <Button 
                  variant="normal" 
                  iconName="remove"
                  formAction="none"
                  onClick={() => handleDeleteCustomerClick(item) }
                >
                  {t('admin.common.delete')}
                </Button>
              </SpaceBetween>
            ),
          },
        ]}
        empty={
          <Box textAlign="center" color="inherit">
            <b>{t('admin.customers.no_resources')}</b>
            <Box padding={{ bottom: 's' }} variant="p" color="inherit">
              {t('admin.customers.no_resources_to_display')}
            </Box>
          </Box>
        }
      />
      
      <Pagination
        currentPageIndex={currentPageIndex}
        pagesCount={Math.ceil(filteredItems.length / PAGE_SIZE)}
        onChange={({ detail }) => setCurrentPageIndex(detail.currentPageIndex)}
      />
      
      {/* 고객사 생성/수정 모달 */}
      <Modal
        visible={isModalVisible}
        onDismiss={() => setIsModalVisible(false)}
        header={currentCustomer?.customerId ? t('admin.customers.edit') : t('admin.customers.create')}
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setIsModalVisible(false)}>
                {t('admin.common.cancel')}
              </Button>
              <Button variant="primary" onClick={handleSaveCustomer} disabled={!currentCustomer?.customerName}>
                {t('admin.common.save')}
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <FormField label={t('admin.customers.name')}>
          <Input
            value={currentCustomer?.customerName || ''}
            onChange={({ detail }) => 
              setCurrentCustomer(curr => curr ? {...curr, customerName: detail.value} : null)
            }
          />
        </FormField>
      </Modal>
      
      {/* 고객사 삭제 모달 */}
      <Modal
        visible={isDeleteModalVisible}
        onDismiss={() => setIsDeleteModalVisible(false)}
        header={t('admin.customers.delete')}
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setIsDeleteModalVisible(false)}>
                {t('admin.common.cancel')}
              </Button>
              <Button 
                variant="normal" 
                iconName="remove"
                formAction="none"
                onClick={handleDeleteCustomer}
              >
                {t('admin.common.delete')}
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <p>
          {t('admin.customers.delete_confirmation', {
            name: currentCustomer?.customerName
          })}
        </p>
      </Modal>
    </Box>
  );
};

export default CustomerTab;