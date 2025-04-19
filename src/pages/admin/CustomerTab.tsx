// src/pages/admin/CustomerTab.tsx
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  SpaceBetween, 
  Box, 
  Pagination, 
  TextFilter, 
  Header, 
  Modal, 
  FormField, 
  Input, 
  Select, 
  DatePicker, 
  Alert
} from '@cloudscape-design/components';
import { generateClient } from 'aws-amplify/api';
import { listCustomers } from '../../graphql/queries';
import { createCustomer, updateCustomer, deleteCustomer } from '../../graphql/mutations';
import { Customer } from '../../models/Customer';
import { useTypedTranslation } from '../../utils/i18n-utils';

// GraphQL 응답 타입 인터페이스
interface GraphQLResponse<T> {
  data?: T;
  errors?: any[];
}

// 쿼리 응답 인터페이스
interface ListCustomersResponse {
  listCustomers: {
    items: Customer[];
    nextToken?: string;
  };
}

// 뮤테이션 응답 인터페이스
interface CreateCustomerResponse {
  createCustomer: Customer;
}

interface UpdateCustomerResponse {
  updateCustomer: Customer;
}

interface DeleteCustomerResponse {
  deleteCustomer: Customer;
}

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

  // API 클라이언트 생성
  const client = generateClient();

  // 고객사 목록 불러오기
  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await client.graphql({
        query: listCustomers,
        variables: {
          limit: 20
        }
      }) as GraphQLResponse<ListCustomersResponse>;
      
      if (result.data?.listCustomers?.items) {
        setCustomers(result.data.listCustomers.items);
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
    customer.name?.toLowerCase().includes(filterText.toLowerCase()) ||
    customer.contactPerson?.toLowerCase().includes(filterText.toLowerCase()) ||
    customer.email?.toLowerCase().includes(filterText.toLowerCase())
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
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      status: 'ACTIVE',
      joinDate: new Date().toISOString().split('T')[0]
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
    if (!currentCustomer || !currentCustomer.name) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (currentCustomer.id) {
        // 기존 고객사 수정
        const customerInput = {
          id: currentCustomer.id,
          name: currentCustomer.name,
          contactPerson: currentCustomer.contactPerson,
          email: currentCustomer.email,
          phone: currentCustomer.phone,
          address: currentCustomer.address,
          status: currentCustomer.status,
          joinDate: currentCustomer.joinDate
        };

        const result = await client.graphql({
          query: updateCustomer,
          variables: {
            input: customerInput
          }
        }) as GraphQLResponse<UpdateCustomerResponse>;
        
        // 수정된 고객사로 상태 업데이트
        if (result.data?.updateCustomer) {
          setCustomers(prevCustomers => 
            prevCustomers.map(c => c.id === currentCustomer.id ? result.data!.updateCustomer : c)
          );
        }
      } else {
        // 새 고객사 생성
        const customerInput = {
          name: currentCustomer.name,
          contactPerson: currentCustomer.contactPerson,
          email: currentCustomer.email,
          phone: currentCustomer.phone,
          address: currentCustomer.address,
          status: currentCustomer.status,
          joinDate: currentCustomer.joinDate
        };

        const result = await client.graphql({
          query: createCustomer,
          variables: {
            input: customerInput
          }
        }) as GraphQLResponse<CreateCustomerResponse>;
        
        // 생성된 고객사 추가
        if (result.data?.createCustomer) {
          setCustomers(prevCustomers => [...prevCustomers, result.data!.createCustomer]);
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
    if (!currentCustomer?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await client.graphql({
        query: deleteCustomer,
        variables: {
          input: { id: currentCustomer.id }
        }
      }) as GraphQLResponse<DeleteCustomerResponse>;
      
      if (result.data?.deleteCustomer) {
        // 삭제된 고객사 제거
        setCustomers(prevCustomers => 
          prevCustomers.filter(c => c.id !== currentCustomer.id)
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
      {error && (
        <Alert type="error" dismissible onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <SpaceBetween size="l">
        {/* 헤더 및 검색/필터 도구 */}
        <Box>
          <SpaceBetween direction="horizontal" size="m">
            <Header 
              variant="h1" 
              actions={
                <Button
                  variant="primary" 
                  onClick={handleCreateCustomer}
                  iconName="add-plus"
                >
                  {t('admin.customers.add_customer')}
                </Button>
              }
            >
              {t('admin.customers.customer_management')}
            </Header>
            
            <TextFilter
              filteringText={filterText}
              filteringPlaceholder={tString('admin.customers.search_placeholder')}
              filteringAriaLabel={tString('admin.customers.search_aria_label')}
              onChange={({ detail }) => setFilterText(detail.filteringText)}
            />
          </SpaceBetween>
        </Box>
        
        {/* 고객사 테이블 */}
        <Table
          loading={loading}
          items={paginatedItems}
          columnDefinitions={[
            {
              id: "name",
              header: t('admin.customers.column.company_name'),
              cell: item => item.name,
              sortingField: "name"
            },
            {
              id: "contactPerson",
              header: t('admin.customers.column.contact_person'),
              cell: item => item.contactPerson || "-",
              sortingField: "contactPerson"
            },
            {
              id: "email",
              header: t('admin.customers.column.email'),
              cell: item => item.email || "-"
            },
            {
              id: "phone",
              header: t('admin.customers.column.phone'),
              cell: item => item.phone || "-"
            },
            {
              id: "status",
              header: t('admin.customers.column.status'),
              cell: item => item.status === 'ACTIVE' ? t('admin.common.active') : t('admin.common.inactive')
            },
            {
              id: "joinDate",
              header: t('admin.customers.column.join_date'),
              cell: item => item.joinDate || "-"
            },
            {
              id: "actions",
              header: t('admin.common.actions'),
              cell: item => (
                <SpaceBetween direction="horizontal" size="xs">
                  <Button 
                    variant="normal" 
                    onClick={() => handleEditCustomer(item)}
                  >
                    {t('admin.common.edit')}
                  </Button>
                  <Button 
                    variant="link"
                    onClick={() => handleDeleteCustomerClick(item)}
                  >
                    {t('admin.common.delete')}
                  </Button>
                </SpaceBetween>
              )
            }
          ]}
          empty={
            <Box textAlign="center" color="inherit">
              <b>{t('admin.customers.no_customers')}</b>
              <Box padding={{ bottom: "s" }} variant="p" color="inherit">
                {t('admin.customers.add_new_customer_desc')}
              </Box>
              <Button onClick={handleCreateCustomer}>
                {t('admin.customers.add_customer')}
              </Button>
            </Box>
          }
          header={
            <Header
              counter={`(\${filteredItems.length})`}
            />
          }
          pagination={
            <Pagination
              currentPageIndex={currentPageIndex}
              onChange={({ detail }) =>
                setCurrentPageIndex(detail.currentPageIndex)
              }
              pagesCount={Math.max(
                1,
                Math.ceil(filteredItems.length / PAGE_SIZE)
              )}
              ariaLabels={{
                nextPageLabel: tString('admin.common.pagination.next'),
                previousPageLabel: tString('admin.common.pagination.previous'),
                pageLabel: pageNumber =>
                  t('admin.common.pagination.page_label', { pageNumber })
              }}
            />
          }
        />
      </SpaceBetween>
      
      {/* 고객사 추가/수정 모달 */}
      <Modal
        visible={isModalVisible}
        onDismiss={() => setIsModalVisible(false)}
        header={currentCustomer?.id ? t('admin.customers.edit_customer') : t('admin.customers.add_new_customer')}
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setIsModalVisible(false)}>
                {t('admin.common.cancel')}
              </Button>
              <Button variant="primary" onClick={handleSaveCustomer}>
                {t('admin.common.save')}
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        {currentCustomer && (
          <SpaceBetween size="l">
            <FormField label={t('admin.customers.form.company_name')}>
              <Input
                value={currentCustomer.name}
                onChange={({ detail }) =>
                  setCurrentCustomer(prev => prev ? ({...prev, name: detail.value}) : null)
                }
              />
            </FormField>
            
            <FormField label={t('admin.customers.form.contact_person')}>
              <Input
                value={currentCustomer.contactPerson || ''}
                onChange={({ detail }) =>
                  setCurrentCustomer(prev => prev ? ({...prev, contactPerson: detail.value}) : null)
                }
              />
            </FormField>
            
            <FormField label={t('admin.customers.form.email')}>
              <Input
                type="email"
                value={currentCustomer.email || ''}
                onChange={({ detail }) =>
                  setCurrentCustomer(prev => prev ? ({...prev, email: detail.value}) : null)
                }
              />
            </FormField>
            
            <FormField label={t('admin.customers.form.phone')}>
              <Input
                type="text"
                value={currentCustomer.phone || ''}
                onChange={({ detail }) =>
                  setCurrentCustomer(prev => prev ? ({...prev, phone: detail.value}) : null)
                }
              />
            </FormField>
            
            <FormField label={t('admin.customers.form.address')}>
              <Input
                value={currentCustomer.address || ''}
                onChange={({ detail }) =>
                  setCurrentCustomer(prev => prev ? ({...prev, address: detail.value}) : null)
                }
              />
            </FormField>
            
            <FormField label={t('admin.customers.form.status')}>
            <Select
                selectedOption={
                    { 
                    label: currentCustomer.status === 'ACTIVE' ? tString('admin.common.active') : tString('admin.common.inactive'),
                    value: currentCustomer.status || 'ACTIVE'
                    }
                }
                onChange={({ detail }) =>
                    setCurrentCustomer(prev => prev ? ({...prev, status: detail.selectedOption.value}) : null)
                }
                options={[
                    { label: tString('admin.common.active'), value: 'ACTIVE' },
                    { label: tString('admin.common.inactive'), value: 'INACTIVE' }
                ]}
                />
            </FormField>
            
            <FormField label={tString('admin.customers.form.join_date')}>
                <DatePicker
                    value={currentCustomer.joinDate || ''}
                    onChange={({ detail }) =>
                    setCurrentCustomer(prev => prev ? ({...prev, joinDate: detail.value}) : null)
                    }
                />
                </FormField>
          </SpaceBetween>
        )}
      </Modal>
      
      {/* 삭제 확인 모달 */}
      <Modal
        visible={isDeleteModalVisible}
        onDismiss={() => setIsDeleteModalVisible(false)}
        header={t('admin.customers.delete_customer')}
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setIsDeleteModalVisible(false)}>
                {t('admin.common.cancel')}
              </Button>
              <Button variant="primary" onClick={handleDeleteCustomer}>
                {t('admin.common.delete')}
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <Box variant="p">
          {t('admin.customers.delete_confirm', { name: currentCustomer?.name })}
        </Box>
      </Modal>
    </Box>
  );
};

export default CustomerTab;