// src/components/admin/instructors/InstructorsTab.tsx
import React, { useState } from 'react';
import {
  ContentLayout,
  SpaceBetween,
  Box,
  Button,
  BreadcrumbGroup,
  Alert,
  Modal,
  Form,
  FormField,
  Input,
  Textarea,
  StatusIndicator,
  TextFilter
} from '@cloudscape-design/components';
import { useTranslation } from 'react-i18next';
import { useInstructor } from '@/hooks/useInstructor';
import { Instructor, InstructorInput } from '@/models/instructor';
import EnhancedTable from '@/components/common/EnhancedTable';

const InstructorsTab: React.FC = () => {
  const { t } = useTranslation(['admin', 'common']);
  const {
    instructors,
    selectedInstructor,
    loading,
    error,
    refetch,
    selectInstructor,
    createInstructor,
    updateSelectedInstructor,
    changeSelectedInstructorStatus,
    isCreating,
    isUpdating,
    isChangingStatus
  } = useInstructor();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusChangeModal, setShowStatusChangeModal] = useState(false);
  const [selectedInstructors, setSelectedInstructors] = useState<Instructor[]>([]);
  const [searchText, setSearchText] = useState('');

  // 폼 상태
  const [formData, setFormData] = useState<InstructorInput>({
    username: '',
    email: '',
    name: '',
    profile: ''
  });

  // 강사 생성 처리
  const handleCreate = async () => {
    try {
      await createInstructor(formData);
      setShowCreateModal(false);
      resetForm();
    } catch (err) {
      console.error('Failed to create instructor:', err);
    }
  };

  // 강사 수정 처리
  const handleEdit = async () => {
    try {
      await updateSelectedInstructor(formData);
      setShowEditModal(false);
    } catch (err) {
      console.error('Failed to update instructor:', err);
    }
  };

  // 강사 상태 변경 처리
  const handleStatusChange = async (newStatus: 'ACTIVE' | 'INACTIVE') => {
    try {
      await changeSelectedInstructorStatus(newStatus);
      setShowStatusChangeModal(false);
      setSelectedInstructors([]);
    } catch (err) {
      console.error('Failed to change instructor status:', err);
    }
  };

  // 상태 변경 모달 열기
  const openStatusChangeModal = (instructor: Instructor, status: 'ACTIVE' | 'INACTIVE') => {
    selectInstructor(instructor.id);
    setSelectedInstructors([instructor]);
    setShowStatusChangeModal(true);
  };

  // 편집 모달 열기
  const openEditModal = (instructor: Instructor) => {
    selectInstructor(instructor.id);
    setFormData({
      username: instructor.username,
      email: instructor.email,
      name: instructor.name,
      profile: instructor.profile || ''
    });
    setShowEditModal(true);
  };

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      name: '',
      profile: ''
    });
  };

  // 강사 목록 필터링
  const filteredInstructors = searchText.trim() ? 
    instructors.filter(instructor => 
      instructor.name.toLowerCase().includes(searchText.toLowerCase()) ||
      instructor.email.toLowerCase().includes(searchText.toLowerCase()) ||
      instructor.username.toLowerCase().includes(searchText.toLowerCase()) ||
      (instructor.profile && instructor.profile.toLowerCase().includes(searchText.toLowerCase()))
    ) : 
    instructors;

  // 테이블 칼럼 정의
  const columnDefinitions = [
    {
      id: 'name',
      header: t('admin:instructors.fields.name'),
      cell: (item: Instructor) => (
        <div style={{ 
          fontWeight: '500', 
          color: '#0972d3', 
          cursor: 'pointer' 
        }} onClick={() => openEditModal(item)}>
          {item.name}
        </div>
      ),
      sortingField: 'name',
      width: 150
    },
    {
      id: 'email',
      header: t('admin:instructors.fields.email'),
      cell: (item: Instructor) => item.email,
      sortingField: 'email',
      width: 200
    },
    {
      id: 'username',
      header: t('admin:instructors.fields.username'),
      cell: (item: Instructor) => item.username,
      sortingField: 'username',
      width: 150
    },
    {
      id: 'profile',
      header: t('admin:instructors.fields.profile'),
      cell: (item: Instructor) => (
        <div style={{ 
          maxHeight: '80px', 
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {item.profile || '-'}
        </div>
      ),
      sortingField: 'profile',
      minWidth: 250
    },
    {
      id: 'status',
      header: t('admin:instructors.fields.status'),
      cell: (item: Instructor) => {
        const statusMap: Record<string, { type: string; text: string }> = {
          ACTIVE: { type: 'success', text: t('admin:instructors.status.active') },
          INACTIVE: { type: 'stopped', text: t('admin:instructors.status.inactive') }
        };
        
        const status = statusMap[item.status] || { 
          type: 'info', 
          text: item.status || t('admin:instructors.status.unknown')
        };
        
        return (
          <StatusIndicator type={status.type as any}>
            {status.text}
          </StatusIndicator>
        );
      },
      sortingField: 'status',
      width: 120
    },
    {
      id: 'createdAt',
      header: t('admin:instructors.fields.createdAt'),
      cell: (item: Instructor) => (
        <div style={{ whiteSpace: 'nowrap' }}>
          {new Date(item.createdAt || '').toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit', 
            day: '2-digit'
          })}
        </div>
      ),
      sortingField: 'createdAt',
      width: 120
    },
    {
      id: 'actions',
      header: t('common:actions'),
      cell: (item: Instructor) => (
        <SpaceBetween direction="horizontal" size="xs">
          <Button 
            variant="link" 
            onClick={() => openEditModal(item)}
            iconName="edit"
          >
            {t('common:edit')}
          </Button>
          {item.status === 'ACTIVE' ? (
            <Button 
              variant="link" 
              onClick={() => openStatusChangeModal(item, 'INACTIVE')}
              iconName="remove"
            >
              {t('admin:instructors.actions.deactivate')}
            </Button>
          ) : (
            <Button 
              variant="link" 
              onClick={() => openStatusChangeModal(item, 'ACTIVE')}
              iconName="check"
            >
              {t('admin:instructors.actions.activate')}
            </Button>
          )}
        </SpaceBetween>
      ),
      width: 180
    }
  ];

  // 필터링 속성
  const filteringProperties = [
    { key: 'name', label: t('admin:instructors.fields.name') },
    { key: 'email', label: t('admin:instructors.fields.email') },
    { key: 'username', label: t('admin:instructors.fields.username') },
    { key: 'profile', label: t('admin:instructors.fields.profile') },
    { key: 'status', label: t('admin:instructors.fields.status') }
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
              { text: t('admin:instructors.title'), href: '/admin/instructors' }
            ]}
            ariaLabel={t('common:breadcrumbs')}
          />
        </Box>

        {/* 검색 필터 */}
        <TextFilter
          filteringText={searchText}
          filteringPlaceholder={t('admin:instructors.searchPlaceholder', '강사 검색...')}
          filteringAriaLabel="강사 검색"
          onChange={({ detail }) => setSearchText(detail.filteringText)}
        />

        {/* 오류 표시 */}
        {error && (
          <Alert
            type="error"
            header={t('common:error')}
            action={<Button onClick={() => refetch()}>{t('common:retry')}</Button>}
            dismissible
          >
            {t('admin:instructors.errors.loadFailed')}
          </Alert>
        )}

        {/* EnhancedTable 사용 */}
        <EnhancedTable
          title={t('admin:instructors.title')}
          description={searchText ? 
            t('admin:instructors.searchResults', { count: filteredInstructors.length }) : 
            t('admin:instructors.description')}
          columnDefinitions={columnDefinitions}
          items={filteredInstructors}
          loading={loading}
          selectionType="single"
          selectedItems={selectedInstructors}
          onSelectionChange={setSelectedInstructors}
          onRefresh={refetch}
          actions={{
            primary: {
              text: t('admin:instructors.actions.createInstructor'),
              onClick: () => setShowCreateModal(true)
            }
          }}
          stickyHeader={true}
          stripedRows={true}
          defaultSortingColumn="name"
          emptyText={{
            title: searchText ? 
              t('admin:instructors.noSearchResults') : 
              t('admin:instructors.noInstructors'),
            subtitle: searchText ? 
              t('admin:instructors.tryOtherSearch') : 
              t('admin:instructors.createPrompt'),
            action: searchText ? undefined : {
              text: t('admin:instructors.actions.createInstructor'),
              onClick: () => setShowCreateModal(true)
            }
          }}
          visibleContentOptions={[
            {
              id: 'main',
              label: t('admin:instructors.columns.main'),
              options: [
                { id: 'name', label: t('admin:instructors.fields.name') },
                { id: 'email', label: t('admin:instructors.fields.email') },
                { id: 'username', label: t('admin:instructors.fields.username') },
              ]
            },
            {
              id: 'details',
              label: t('admin:instructors.columns.details'),
              options: [
                { id: 'profile', label: t('admin:instructors.fields.profile') },
                { id: 'status', label: t('admin:instructors.fields.status') },
                { id: 'createdAt', label: t('admin:instructors.fields.createdAt') },
              ]
            }
          ]}
          preferences={true}
        />

        {/* 강사 생성 모달 */}
        <Modal
          visible={showCreateModal}
          onDismiss={() => setShowCreateModal(false)}
          header={t('admin:instructors.modals.create.title')}
          size="large"
          footer={
            <Box float="right">
              <SpaceBetween direction="horizontal" size="xs">
                <Button onClick={() => setShowCreateModal(false)}>{t('common:cancel')}</Button>
                <Button
                  variant="primary"
                  onClick={handleCreate}
                  loading={isCreating}
                  disabled={!formData.username || !formData.email || !formData.name}
                >
                  {t('admin:instructors.actions.create')}
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
                    {t('admin:instructors.fields.name')}
                    <span className="awsui-key-label-required"> *</span>
                  </span>
                }
                description={t('admin:instructors.fields.nameDescription')}
              >
                <Input
                  value={formData.name}
                  onChange={({ detail }) => setFormData(prev => ({ ...prev, name: detail.value }))}
                  placeholder="홍길동"
                />
              </FormField>

              <FormField
                label={
                  <span>
                    {t('admin:instructors.fields.email')}
                    <span className="awsui-key-label-required"> *</span>
                  </span>
                }
                description={t('admin:instructors.fields.emailDescription')}
              >
                <Input
                  type="email"
                  value={formData.email}
                  onChange={({ detail }) => setFormData(prev => ({ ...prev, email: detail.value }))}
                  placeholder="example@example.com"
                />
              </FormField>

              <FormField
                label={
                  <span>
                    {t('admin:instructors.fields.username')}
                    <span className="awsui-key-label-required"> *</span>
                  </span>
                }
                description={t('admin:instructors.fields.usernameDescription')}
              >
                <Input
                  value={formData.username}
                  onChange={({ detail }) => setFormData(prev => ({ ...prev, username: detail.value }))}
                  placeholder="username123"
                />
              </FormField>

              <FormField 
                label={t('admin:instructors.fields.profile')}
                description={t('admin:instructors.fields.profileDescription')}
              >
                <Textarea
                  value={formData.profile || ''}
                  onChange={({ detail }) => setFormData(prev => ({ ...prev, profile: detail.value }))}
                  placeholder="강사 소개 및 전문 분야"
                  rows={4}
                />
              </FormField>
            </SpaceBetween>
          </Form>
        </Modal>

        {/* 강사 편집 모달 */}
        <Modal
          visible={showEditModal}
          onDismiss={() => setShowEditModal(false)}
          header={t('admin:instructors.modals.edit.title')}
          size="large"
          footer={
            <Box float="right">
              <SpaceBetween direction="horizontal" size="xs">
                <Button onClick={() => setShowEditModal(false)}>{t('common:cancel')}</Button>
                <Button
                  variant="primary"
                  onClick={handleEdit}
                  loading={isUpdating}
                  disabled={!formData.name || !formData.email}
                >
                  {t('common:save')}
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
                    {t('admin:instructors.fields.name')}
                    <span className="awsui-key-label-required"> *</span>
                  </span>
                }
                description={t('admin:instructors.fields.nameDescription')}
              >
                <Input
                  value={formData.name}
                  onChange={({ detail }) => setFormData(prev => ({ ...prev, name: detail.value }))}
                />
              </FormField>

              <FormField
                label={
                  <span>
                    {t('admin:instructors.fields.email')}
                    <span className="awsui-key-label-required"> *</span>
                  </span>
                }
                description={t('admin:instructors.fields.emailDescription')}
              >
                <Input
                  type="email"
                  value={formData.email}
                  onChange={({ detail }) => setFormData(prev => ({ ...prev, email: detail.value }))}
                />
              </FormField>

              <FormField 
                label={t('admin:instructors.fields.profile')}
                description={t('admin:instructors.fields.profileDescription')}
              >
                <Textarea
                  value={formData.profile || ''}
                  onChange={({ detail }) => setFormData(prev => ({ ...prev, profile: detail.value }))}
                  rows={4}
                />
              </FormField>
            </SpaceBetween>
          </Form>
        </Modal>

        {/* 상태 변경 확인 모달 */}
        <Modal
          visible={showStatusChangeModal}
          onDismiss={() => setShowStatusChangeModal(false)}
          header={
            selectedInstructor?.status === 'ACTIVE' ? 
              t('admin:instructors.modals.deactivate.title') : 
              t('admin:instructors.modals.activate.title')
          }
          footer={
            <Box float="right">
              <SpaceBetween direction="horizontal" size="xs">
                <Button onClick={() => setShowStatusChangeModal(false)}>
                  {t('common:cancel')}
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleStatusChange(
                    selectedInstructor?.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
                  )}
                  loading={isChangingStatus}
                >
                  {selectedInstructor?.status === 'ACTIVE' ? 
                    t('admin:instructors.actions.deactivate') : 
                    t('admin:instructors.actions.activate')
                  }
                </Button>
              </SpaceBetween>
            </Box>
          }
        >
          <Box>
            {selectedInstructor?.status === 'ACTIVE' ? 
              t('admin:instructors.modals.deactivate.confirmation', { name: selectedInstructor?.name }) :
              t('admin:instructors.modals.activate.confirmation', { name: selectedInstructor?.name })
            }
          </Box>
        </Modal>
      </SpaceBetween>
    </ContentLayout>
  );
};

export default InstructorsTab;