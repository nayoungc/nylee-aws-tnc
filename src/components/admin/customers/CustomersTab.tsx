// src/components/admin/customers/CustomersTab.tsx
import React, { useState } from 'react';
import {
  ContentLayout,
  SpaceBetween,
  Box,
  Button,
  Alert,
  Modal,
  Form,
  FormField,
  Input,
  Textarea,
  TextFilter,
} from '@cloudscape-design/components';
import { useTranslation } from 'react-i18next';
import BreadcrumbGroup from '@/components/layout/BreadcrumbGroup';
import { useCustomer, useSearchCustomers } from '@/hooks/useCustomer';
import { Customer, CustomerInput, CustomerFilter } from '@/models/customers';
import EnhancedTable from '@/components/common/EnhancedTable';

const CustomersTab: React.FC = () => {
  const { t } = useTranslation(['admin', 'common']);
  const [searchFilter, setSearchFilter] = useState<CustomerFilter>({});
  const [searchText, setSearchText] = useState('');

  // 검색 상태가 변경되면 검색 필터 사용, 아니면 기본 고객 목록 사용
  const isSearchActive = searchText.trim().length > 0;

  // 기존 고객 목록 훅
  const {
    customers: allCustomers,
    selectedCustomer,
    loading: baseLoading,
    error: baseError,
    refetch: baseRefetch,
    selectCustomer,
    createCustomer,
    updateSelectedCustomer,
    deleteSelectedCustomer,
    isCreating,
    isUpdating,
    isDeleting
  } = useCustomer();

  // 검색 훅 (검색어가 있을 때만 활성화)
  const {
    data: searchResults = [],
    isLoading: searchLoading,
    error: searchError,
    refetch: searchRefetch
  } = useSearchCustomers(
    { text: searchText },
    isSearchActive
  );

  // 표시할 고객 목록과 로딩/오류 상태 결정
  const customers = isSearchActive ? searchResults : allCustomers;
  const loading = isSearchActive ? searchLoading : baseLoading;
  const error = isSearchActive ? searchError : baseError;

  // 검색 또는 기본 목록 새로고침
  const handleRefresh = () => {
    if (isSearchActive) {
      searchRefetch();
    } else {
      baseRefetch();
    }
  };

  // 검색 필터 변경 처리
  const handleSearchChange = (text: string) => {
    setSearchText(text);
  };

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([]);

  // 폼 상태
  const [formData, setFormData] = useState<CustomerInput>({
    customerName: '',
    notes: '',
    email: '',
    phone: '',
    organization: ''
  });

  // 고객 생성 처리
  const handleCreate = async () => {
    try {
      await createCustomer(formData);
      setShowCreateModal(false);
      resetForm();
    } catch (err) {
      console.error('Failed to create customer:', err);
    }
  };

  // 고객 수정 처리
  const handleEdit = async () => {
    try {
      await updateSelectedCustomer(formData);
      setShowEditModal(false);
    } catch (err) {
      console.error('Failed to update customer:', err);
    }
  };

  // 고객 삭제 처리
  const handleDelete = async () => {
    try {
      await deleteSelectedCustomer();
      setShowDeleteConfirm(false);
      setSelectedCustomers([]);
    } catch (err) {
      console.error('Failed to delete customer:', err);
    }
  };

  // 단일 고객 삭제 시작
  const handleDeleteClick = (customer: Customer) => {
    selectCustomer(customer.customerId);
    setSelectedCustomers([customer]);
    setShowDeleteConfirm(true);
  };

  // 배치 삭제 시작
  const handleBatchDelete = () => {
    if (selectedCustomers.length === 1) {
      selectCustomer(selectedCustomers[0].customerId);
    }
    setShowDeleteConfirm(true);
  };

  // 편집 모달 열기
  const openEditModal = (customer: Customer) => {
    selectCustomer(customer.customerId);
    setFormData({
      customerName: customer.customerName || '',
      notes: customer.notes || '',
      email: customer.email || '',
      phone: customer.phone || '',
      organization: customer.organization || ''
    });
    setShowEditModal(true);
  };

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      customerName: '',
      notes: '',
      email: '',
      phone: '',
      organization: ''
    });
  };

  // 테이블 칼럼 정의
  const columnDefinitions = [
    {
      id: 'customerName',
      header: t('admin:customers.fields.customerName'),
      cell: (item: Customer) => (
        <div style={{
          fontWeight: '500',
          color: '#0972d3',
          cursor: 'pointer'
        }} onClick={() => openEditModal(item)}>
          {item.customerName}
        </div>
      ),
      sortingField: 'customerName',
      width: 180
    },
    {
      id: 'organization',
      header: t('admin:customers.fields.organization'),
      cell: (item: Customer) => item.organization || '-',
      sortingField: 'organization',
      width: 160
    },
    {
      id: 'email',
      header: t('admin:customers.fields.email'),
      cell: (item: Customer) => item.email || '-',
      sortingField: 'email',
      width: 220
    },
    {
      id: 'phone',
      header: t('admin:customers.fields.phone'),
      cell: (item: Customer) => item.phone || '-',
      sortingField: 'phone',
      width: 140
    },
    {
      id: 'notes',
      header: t('admin:customers.fields.notes'),
      cell: (item: Customer) => (
        <div style={{
          maxHeight: '80px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical'
        }}>
          {item.notes || '-'}
        </div>
      ),
      sortingField: 'notes',
      minWidth: 200
    },
    {
      id: 'createdAt',
      header: t('admin:customers.fields.createdAt'),
      cell: (item: Customer) => (
        <div style={{ whiteSpace: 'nowrap' }}>
          {item.createdAt 
            ? new Date(item.createdAt).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: '2-digit', 
                day: '2-digit'
              })
            : '-'
          }
        </div>
      ),
      sortingField: 'createdAt',
      width: 120
    },    
    {
      id: 'actions',
      header: t('common:actions'),
      cell: (item: Customer) => (
        <SpaceBetween direction="horizontal" size="xs">
          <Button
            variant="link"
            onClick={() => openEditModal(item)}
            iconName="edit"
          >
            {t('common:edit')}
          </Button>
          <Button
            variant="link"
            onClick={() => handleDeleteClick(item)}
            iconName="remove"
          >
            {t('common:delete')}
          </Button>
        </SpaceBetween>
      ),
      width: 160
    }
  ];

  // 필터링 속성
  const filteringProperties = [
    { key: 'customerName', label: t('admin:customers.fields.customerName') },
    { key: 'organization', label: t('admin:customers.fields.organization') },
    { key: 'email', label: t('admin:customers.fields.email') },
    { key: 'notes', label: t('admin:customers.fields.notes') }
  ];

  // 테이블 가시성 옵션
  const visibleContentOptions = [
    {
      id: 'main',
      label: t('admin:customers.columns.main'),
      options: [
        { id: 'customerName', label: t('admin:customers.fields.customerName') },
        { id: 'organization', label: t('admin:customers.fields.organization') },
      ]
    },
    {
      id: 'contact',
      label: t('admin:customers.columns.contact'),
      options: [
        { id: 'email', label: t('admin:customers.fields.email') },
        { id: 'phone', label: t('admin:customers.fields.phone') },
      ]
    },
    {
      id: 'details',
      label: t('admin:customers.columns.details'),
      options: [
        { id: 'notes', label: t('admin:customers.fields.notes') },
        { id: 'createdAt', label: t('admin:customers.fields.createdAt') },
      ]
    }
  ];

  return (
    <ContentLayout>
      <SpaceBetween size="l">
        {/* 페이지 머리글 */}
        <Box padding={{ top: 's' }}>
          <BreadcrumbGroup
            items={[
              { text: t('common:home'), href: '/' },
              { text: t('admin:title'), href: '/admin' },
              { text: t('admin:customers.title'), href: '/admin/customers' }
            ]}
          />
        </Box>

        {/* 검색 상자 - 테이블 위에 추가 */}
        <TextFilter
          filteringText={searchText}
          filteringPlaceholder={t('admin:customers.searchPlaceholder', '고객명, 이메일, 메모 검색...')}
          filteringAriaLabel="고객 검색"
          onChange={({ detail }) => handleSearchChange(detail.filteringText)}
        />

        {/* 오류 표시 */}
        {error && (
          <Alert
            type="error"
            header={t('common:error')}
            action={<Button onClick={() => handleRefresh()}>
              {t('common:retry')}
            </Button>}
            dismissible
          >
            {t('admin:customers.errors.loadFailed')}
          </Alert>
        )}

        {/* EnhancedTable - 필터링 옵션을 사용하지 않도록 수정 */}
        <EnhancedTable
          title={t('admin:customers.title')}
          description={isSearchActive
            ? t('admin:customers.searchResults', { count: customers.length })
            : t('admin:customers.description')}
          columnDefinitions={columnDefinitions}
          items={customers}
          loading={loading}
          selectionType="multi"
          selectedItems={selectedCustomers}
          onSelectionChange={setSelectedCustomers}
          onRefresh={handleRefresh}
          actions={{
            primary: {
              text: t('admin:customers.actions.createCustomer'),
              onClick: () => setShowCreateModal(true)
            }
          }}
          batchActions={[
            {
              text: t('common:actions.deleteSelected'),
              onClick: handleBatchDelete,
              disabled: selectedCustomers.length === 0
            }
          ]}
          // 상단에 TextFilter가 있으므로 EnhancedTable 내부 필터링은 비활성화
          usePropertyFilter={false}
          filteringProperties={[]} // 빈 배열로 설정하여 테이블 내 필터링 비활성화
          stickyHeader={true}
          stripedRows={true}
          resizableColumns={true}
          trackBy="customerId"
          defaultSortingColumn="customerName"
          emptyText={{
            title: isSearchActive
              ? t('admin:customers.noSearchResults')
              : t('admin:customers.noCustomers'),
            subtitle: isSearchActive
              ? t('admin:customers.tryOtherSearch')
              : t('admin:customers.createPrompt'),
            action: isSearchActive
              ? undefined
              : {
                text: t('admin:customers.actions.createCustomer'),
                onClick: () => setShowCreateModal(true)
              }
          }}
          visibleContentOptions={[
            {
              id: 'main',
              label: t('admin:customers.columns.main'),
              options: [
                { id: 'customerName', label: t('admin:customers.fields.customerName') },
                { id: 'organization', label: t('admin:customers.fields.organization') },
              ]
            },
            {
              id: 'contact',
              label: t('admin:customers.columns.contact'),
              options: [
                { id: 'email', label: t('admin:customers.fields.email') },
                { id: 'phone', label: t('admin:customers.fields.phone') },
              ]
            },
            {
              id: 'details',
              label: t('admin:customers.columns.details'),
              options: [
                { id: 'notes', label: t('admin:customers.fields.notes') },
                { id: 'createdAt', label: t('admin:customers.fields.createdAt') },
              ]
            }
          ]}
          preferences={true}
        />

        {/* 고객 생성 모달 */}
        <Modal
          visible={showCreateModal}
          onDismiss={() => setShowCreateModal(false)}
          header={t('admin:customers.modals.create.title')}
          size="large"
          footer={
            <Box float="right">
              <SpaceBetween direction="horizontal" size="xs">
                <Button onClick={() => setShowCreateModal(false)}>{t('common:cancel')}</Button>
                <Button
                  variant="primary"
                  onClick={handleCreate}
                  loading={isCreating}
                  disabled={!formData.customerName}
                >
                  {t('admin:customers.actions.create')}
                </Button>
              </SpaceBetween>
            </Box>
          }
        >
          <Form>
            <SpaceBetween size="l">
              <FormField
                label={
                  <span>
                    {t('admin:customers.fields.customerName')}
                    <span className="awsui-key-label-required"> *</span>
                  </span>
                }
                description={t('admin:customers.fields.customerNameDescription')}
              >
                <Input
                  value={formData.customerName}
                  onChange={({ detail }) => setFormData(prev => ({ ...prev, customerName: detail.value }))}
                />
              </FormField>

              <SpaceBetween direction="horizontal" size="xs">
                <FormField label={t('admin:customers.fields.email')}>
                  <Input
                    type="email"
                    value={formData.email || ''}
                    onChange={({ detail }) => setFormData(prev => ({ ...prev, email: detail.value }))}
                  />
                </FormField>

                <FormField label={t('admin:customers.fields.phone')}>
                  <Input
                    value={formData.phone || ''}
                    onChange={({ detail }) => setFormData(prev => ({ ...prev, phone: detail.value }))}
                  />
                </FormField>
              </SpaceBetween>

              <FormField label={t('admin:customers.fields.organization')}>
                <Input
                  value={formData.organization || ''}
                  onChange={({ detail }) => setFormData(prev => ({ ...prev, organization: detail.value }))}
                />
              </FormField>

              <FormField label={t('admin:customers.fields.notes')}>
                <Textarea
                  value={formData.notes || ''}
                  onChange={({ detail }) => setFormData(prev => ({ ...prev, notes: detail.value }))}
                  rows={4}
                />
              </FormField>
            </SpaceBetween>
          </Form>
        </Modal>

        {/* 고객 편집 모달 */}
        <Modal
          visible={showEditModal}
          onDismiss={() => setShowEditModal(false)}
          header={t('admin:customers.modals.edit.title')}
          size="large"
          footer={
            <Box float="right">
              <SpaceBetween direction="horizontal" size="xs">
                <Button onClick={() => setShowEditModal(false)}>{t('common:cancel')}</Button>
                <Button
                  variant="primary"
                  onClick={handleEdit}
                  loading={isUpdating}
                  disabled={!formData.customerName}
                >
                  {t('common:save')}
                </Button>
              </SpaceBetween>
            </Box>
          }
        >
          <Form>
            <SpaceBetween size="l">
              {/* 폼 필드 - 생성 모달과 동일한 구조 */}
              <FormField
                label={
                  <span>
                    {t('admin:customers.fields.customerName')}
                    <span className="awsui-key-label-required"> *</span>
                  </span>
                }
                description={t('admin:customers.fields.customerNameDescription')}
              >
                <Input
                  value={formData.customerName}
                  onChange={({ detail }) => setFormData(prev => ({ ...prev, customerName: detail.value }))}
                />
              </FormField>

              <SpaceBetween direction="horizontal" size="xs">
                <FormField label={t('admin:customers.fields.email')}>
                  <Input
                    type="email"
                    value={formData.email || ''}
                    onChange={({ detail }) => setFormData(prev => ({ ...prev, email: detail.value }))}
                  />
                </FormField>

                <FormField label={t('admin:customers.fields.phone')}>
                  <Input
                    value={formData.phone || ''}
                    onChange={({ detail }) => setFormData(prev => ({ ...prev, phone: detail.value }))}
                  />
                </FormField>
              </SpaceBetween>

              <FormField label={t('admin:customers.fields.organization')}>
                <Input
                  value={formData.organization || ''}
                  onChange={({ detail }) => setFormData(prev => ({ ...prev, organization: detail.value }))}
                />
              </FormField>

              <FormField label={t('admin:customers.fields.notes')}>
                <Textarea
                  value={formData.notes || ''}
                  onChange={({ detail }) => setFormData(prev => ({ ...prev, notes: detail.value }))}
                  rows={4}
                />
              </FormField>
            </SpaceBetween>
          </Form>
        </Modal>

        {/* 삭제 확인 모달 */}
        <Modal
          visible={showDeleteConfirm}
          onDismiss={() => setShowDeleteConfirm(false)}
          header={t('admin:customers.modals.delete.title')}
          footer={
            <Box float="right">
              <SpaceBetween direction="horizontal" size="xs">
                <Button onClick={() => setShowDeleteConfirm(false)}>
                  {t('common:cancel')}
                </Button>
                <Button
                  variant="primary"
                  onClick={handleDelete}
                  loading={isDeleting}
                  iconName="remove"
                >
                  {t('common:delete')}
                </Button>
              </SpaceBetween>
            </Box>
          }
        >
          <Box>
            {selectedCustomers.length === 1 ?
              t('admin:customers.modals.delete.confirmation', { name: selectedCustomers[0].customerName }) :
              t('admin:customers.modals.delete.confirmationBatch', { count: selectedCustomers.length })}
          </Box>
        </Modal>
      </SpaceBetween>
    </ContentLayout>
  );
};

export default CustomersTab;