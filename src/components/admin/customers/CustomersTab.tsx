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
import { useCustomer, useSearchCustomers } from '@/hooks/useCustomer';
import { Customer, CustomerInput, CustomerFilter } from '@/models/customer';
import EnhancedTable from '@/components/common/EnhancedTable';
import BreadcrumbGroup from '@/components/layout/BreadcrumbGroup';
import { useAppTranslation } from '@/hooks/useAppTranslation';

/**
 * 관리자 고객 관리 탭 컴포넌트
 * @description 백엔드 스키마에 맞게 필드명을 customerName으로 통일
 */
const CustomersTab: React.FC = () => {
  const { t } = useAppTranslation();
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
    notes: ''
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
    selectCustomer(customer.id);
    setSelectedCustomers([customer]);
    setShowDeleteConfirm(true);
  };

  // 배치 삭제 시작
  const handleBatchDelete = () => {
    if (selectedCustomers.length === 1) {
      selectCustomer(selectedCustomers[0].id);
    }
    setShowDeleteConfirm(true);
  };

  // 편집 모달 열기
  const openEditModal = (customer: Customer) => {
    selectCustomer(customer.id);
    setFormData({
      customerName: customer.customerName || '',
      notes: customer.notes || ''
    });
    setShowEditModal(true);
  };

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      customerName: '',
      notes: ''
    });
  };

  // 테이블 칼럼 정의
  const columnDefinitions = [
    {
      id: 'customerName',
      header: t('customers_fields_customerName'),
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
      id: 'notes',
      header: t('customers_fields_notes'),
      cell: (item: Customer) => item.notes || '-',
      sortingField: 'notes',
      width: 250
    },
    {
      id: 'createdAt',
      header: t('customers_fields_createdAt'),
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
      header: t('actions'),
      cell: (item: Customer) => (
        <SpaceBetween direction="horizontal" size="xs">
          <Button
            variant="link"
            onClick={() => openEditModal(item)}
            iconName="edit"
          >
            {t('edit')}
          </Button>
          <Button
            variant="link"
            onClick={() => handleDeleteClick(item)}
            iconName="remove"
          >
            {t('delete')}
          </Button>
        </SpaceBetween>
      ),
      width: 160
    }
  ];

  // 필터링 속성
  const filteringProperties = [
    { key: 'customerName', label: t('customers_fields_customerName') },
    { key: 'notes', label: t('customers_fields_notes') }
  ];

  // 테이블 가시성 옵션
  const visibleContentOptions = [
    {
      id: 'main',
      label: t('customers_columns_main'),
      options: [
        { id: 'customerName', label: t('customers_fields_customerName') },
        { id: 'notes', label: t('customers_fields_notes') }
      ]
    },
    {
      id: 'details',
      label: t('customers_columns_details'),
      options: [
        { id: 'createdAt', label: t('customers_fields_createdAt') }
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
              { translationKey: 'navigation_home', href: '/' },
              { translationKey: 'admin_title', href: '/admin' },
              { translationKey: 'customers_title', href: '/admin/customers' }
            ]}
          />
        </Box>

        {/* 검색 상자 */}
        <TextFilter
          filteringText={searchText}
          filteringPlaceholder={t('customers_searchPlaceholder')}
          filteringAriaLabel={t('customers_search_aria_label')}
          onChange={({ detail }) => handleSearchChange(detail.filteringText)}
        />

        {/* 오류 표시 */}
        {error && (
          <Alert
            type="error"
            header={t('error')}
            action={<Button onClick={() => handleRefresh()}>{t('retry')}</Button>}
            dismissible
          >
            {t('customers_errors_loadFailed')}
          </Alert>
        )}

        {/* EnhancedTable */}
        <EnhancedTable
          title={t('customers_title')}
          description={isSearchActive
            ? t('customers_searchResults', { count: customers.length })
            : t('customers_description')}
          columnDefinitions={columnDefinitions}
          items={customers}
          loading={loading}
          selectionType="multi"
          selectedItems={selectedCustomers}
          onSelectionChange={setSelectedCustomers}
          onRefresh={handleRefresh}
          actions={{
            primary: {
              text: t('customers_actions_createCustomer'),
              onClick: () => setShowCreateModal(true)
            }
          }}
          batchActions={[
            {
              text: t('actions_delete_selected'),
              onClick: handleBatchDelete,
              disabled: selectedCustomers.length === 0
            }
          ]}
          filteringProperties={filteringProperties}
          usePropertyFilter={true}
          stickyHeader={true}
          stripedRows={true}
          resizableColumns={true}
          trackBy="id"
          defaultSortingColumn="customerName"
          emptyText={{
            title: isSearchActive
              ? t('customers_noSearchResults')
              : t('customers_noCustomers'),
            subtitle: isSearchActive
              ? t('customers_tryOtherSearch')
              : t('customers_createPrompt'),
            action: isSearchActive
              ? undefined
              : {
                text: t('customers_actions_createCustomer'),
                onClick: () => setShowCreateModal(true)
              }
          }}
          visibleContentOptions={visibleContentOptions}
          preferences={true}
        />

        {/* 고객 생성 모달 */}
        <Modal
          visible={showCreateModal}
          onDismiss={() => setShowCreateModal(false)}
          header={t('customers_modals_create_title')}
          size="large"
          footer={
            <Box float="right">
              <SpaceBetween direction="horizontal" size="xs">
                <Button onClick={() => setShowCreateModal(false)}>{t('cancel')}</Button>
                <Button
                  variant="primary"
                  onClick={handleCreate}
                  loading={isCreating}
                  disabled={!formData.customerName}
                >
                  {t('customers_actions_create')}
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
                    {t('customers_fields_customerName')}
                    <span className="awsui-key-label-required"> *</span>
                  </span>
                }
                description={t('customers_fields_customerNameDescription')}
              >
                <Input
                  value={formData.customerName}
                  onChange={({ detail }) => setFormData(prev => ({ ...prev, customerName: detail.value }))}
                />
              </FormField>

              <FormField
                label={t('customers_fields_notes')}
                description={t('customers_fields_notesDescription')}
              >
                <Textarea
                  value={formData.notes || ''}
                  onChange={({ detail }) => setFormData(prev => ({ ...prev, notes: detail.value }))}
                />
              </FormField>
            </SpaceBetween>
          </Form>
        </Modal>

        {/* 고객 편집 모달 */}
        <Modal
          visible={showEditModal}
          onDismiss={() => setShowEditModal(false)}
          header={t('customers_modals_edit_title')}
          size="large"
          footer={
            <Box float="right">
              <SpaceBetween direction="horizontal" size="xs">
                <Button onClick={() => setShowEditModal(false)}>{t('cancel')}</Button>
                <Button
                  variant="primary"
                  onClick={handleEdit}
                  loading={isUpdating}
                  disabled={!formData.customerName}
                >
                  {t('save')}
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
                    {t('customers_fields_customerName')}
                    <span className="awsui-key-label-required"> *</span>
                  </span>
                }
                description={t('customers_fields_customerNameDescription')}
              >
                <Input
                  value={formData.customerName}
                  onChange={({ detail }) => setFormData(prev => ({ ...prev, customerName: detail.value }))}
                />
              </FormField>

              <FormField
                label={t('customers_fields_notes')}
                description={t('customers_fields_notesDescription')}
              >
                <Textarea
                  value={formData.notes || ''}
                  onChange={({ detail }) => setFormData(prev => ({ ...prev, notes: detail.value }))}
                />
              </FormField>
            </SpaceBetween>
          </Form>
        </Modal>

        {/* 삭제 확인 모달 */}
        <Modal
          visible={showDeleteConfirm}
          onDismiss={() => setShowDeleteConfirm(false)}
          header={t('customers_modals_delete_title')}
          footer={
            <Box float="right">
              <SpaceBetween direction="horizontal" size="xs">
                <Button onClick={() => setShowDeleteConfirm(false)}>
                  {t('cancel')}
                </Button>
                <Button
                  variant="primary"
                  onClick={handleDelete}
                  loading={isDeleting}
                  iconName="remove"
                >
                  {t('delete')}
                </Button>
              </SpaceBetween>
            </Box>
          }
        >
          <Box>
            {selectedCustomers.length === 1 ?
              t('customers_modals_delete_confirmation', { name: selectedCustomers[0].customerName }) :
              t('customers_modals_delete_confirmationBatch', { count: selectedCustomers.length })}
          </Box>
        </Modal>
      </SpaceBetween>
    </ContentLayout>
  );
};

export default CustomersTab;