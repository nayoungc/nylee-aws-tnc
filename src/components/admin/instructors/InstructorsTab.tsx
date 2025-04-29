// src/components/admin/instructors/InstructorsTab.tsx
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
  StatusIndicator,
  TextFilter
} from '@cloudscape-design/components';
import { useInstructor } from '@/hooks/useInstructor';
import { Instructor, InstructorInput, InstructorStatus } from '@/models/instructor';
import EnhancedTable from '@/components/common/EnhancedTable';
import BreadcrumbGroup from '@/components/layout/BreadcrumbGroup';
import { useAppTranslation } from '@/hooks/useAppTranslation';

const InstructorsTab: React.FC = () => {
  const { t } = useAppTranslation();
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

  // 폼 상태 - 백엔드 스키마에 맞게 조정
  const [formData, setFormData] = useState<InstructorInput>({
    name: '',
    email: '',
    status: InstructorStatus.ACTIVE,
    profile: '',
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
  const handleStatusChange = async (newStatus: InstructorStatus) => {
    try {
      await changeSelectedInstructorStatus(newStatus);
      setShowStatusChangeModal(false);
      setSelectedInstructors([]);
    } catch (err) {
      console.error('Failed to change instructor status:', err);
    }
  };

  // 상태 변경 모달 열기
  const openStatusChangeModal = (instructor: Instructor, status: InstructorStatus) => {
    selectInstructor(instructor.id);
    setSelectedInstructors([instructor]);
    setShowStatusChangeModal(true);
  };

  // 편집 모달 열기
  const openEditModal = (instructor: Instructor) => {
    selectInstructor(instructor.id);
    setFormData({
      name: instructor.name,
      email: instructor.email,
      status: instructor.status || InstructorStatus.ACTIVE,
      profile: instructor.profile || '',
    });
    setShowEditModal(true);
  };

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      status: InstructorStatus.ACTIVE,
      profile: '',
    });
  };

  // 강사 목록 필터링
  const filteredInstructors = searchText.trim() ?
    instructors.filter(instructor =>
      instructor.name.toLowerCase().includes(searchText.toLowerCase()) ||
      instructor.email.toLowerCase().includes(searchText.toLowerCase()) ||
      (instructor.profile && instructor.profile.toLowerCase().includes(searchText.toLowerCase()))
    ) :
    instructors;

  // 테이블 칼럼 정의
  const columnDefinitions = [
    {
      id: 'name',
      header: t('instructors_fields_name'),
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
      header: t('instructors_fields_email'),
      cell: (item: Instructor) => item.email,
      sortingField: 'email',
      width: 200
    },
    {
      id: 'profile',
      header: t('instructors_fields_profile'),
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
      header: t('instructors_fields_status'),
      cell: (item: Instructor) => {
        const statusMap: Record<string, { type: string; text: string }> = {
          [InstructorStatus.ACTIVE]: { type: 'success', text: t('instructors_status_active') },
          [InstructorStatus.INACTIVE]: { type: 'stopped', text: t('instructors_status_inactive') }
        };

        const statusKey = item.status || 'unknown';
        const status = statusMap[statusKey] || {
          type: 'info',
          text: statusKey === 'unknown' ? t('instructors_status_unknown') : statusKey
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
      header: t('instructors_fields_createdAt'),
      cell: (item: Instructor) => (
        <div style={{ whiteSpace: 'nowrap' }}>
          {item.createdAt ? 
            new Date(item.createdAt).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: '2-digit', 
              day: '2-digit'
            }) : 
            '-'
          }
        </div>
      ),
      sortingField: 'createdAt',
      width: 120
    },
    {
      id: 'actions',
      header: t('actions'),
      cell: (item: Instructor) => (
        <SpaceBetween direction="horizontal" size="xs">
          <Button
            variant="link"
            onClick={() => openEditModal(item)}
            iconName="edit"
          >
            {t('edit')}
          </Button>
          {item.status === InstructorStatus.ACTIVE ? (
            <Button
              variant="link"
              onClick={() => openStatusChangeModal(item, InstructorStatus.INACTIVE)}
              iconName="remove"
            >
              {t('instructors_actions_deactivate')}
            </Button>
          ) : (
            <Button
              variant="link"
              onClick={() => openStatusChangeModal(item, InstructorStatus.ACTIVE)}
              iconName="check"
            >
              {t('instructors_actions_activate')}
            </Button>
          )}
        </SpaceBetween>
      ),
      width: 180
    }
  ];

  // 필터링 속성
  const filteringProperties = [
    { key: 'name', label: t('instructors_fields_name') },
    { key: 'email', label: t('instructors_fields_email') },
    { key: 'profile', label: t('instructors_fields_profile') },
    { key: 'status', label: t('instructors_fields_status') }
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
              { translationKey: 'instructors_title', href: '/admin/instructors' }
            ]}
          />
        </Box>

        {/* 검색 필터 */}
        <TextFilter
          filteringText={searchText}
          filteringPlaceholder={t('instructors_searchPlaceholder')}
          filteringAriaLabel={t('instructors_search_aria_label')}
          onChange={({ detail }) => setSearchText(detail.filteringText)}
        />

        {/* 오류 표시 */}
        {error && (
          <Alert
            type="error"
            header={t('error')}
            action={<Button onClick={() => refetch()}>{t('retry')}</Button>}
            dismissible
          >
            {t('instructors_errors_loadFailed')}
          </Alert>
        )}

        {/* EnhancedTable 사용 */}
        <EnhancedTable
          title={t('instructors_title')}
          description={searchText ?
            t('instructors_searchResults', { count: filteredInstructors.length }) :
            t('instructors_description')}
          columnDefinitions={columnDefinitions}
          items={filteredInstructors}
          loading={loading}
          selectionType="single"
          selectedItems={selectedInstructors}
          onSelectionChange={setSelectedInstructors}
          onRefresh={refetch}
          actions={{
            primary: {
              text: t('instructors_actions_createInstructor'),
              onClick: () => setShowCreateModal(true)
            }
          }}
          stickyHeader={true}
          stripedRows={true}
          defaultSortingColumn="name"
          emptyText={{
            title: searchText ?
              t('instructors_noSearchResults') :
              t('instructors_noInstructors'),
            subtitle: searchText ?
              t('instructors_tryOtherSearch') :
              t('instructors_createPrompt'),
            action: searchText ? undefined : {
              text: t('instructors_actions_createInstructor'),
              onClick: () => setShowCreateModal(true)
            }
          }}
          visibleContentOptions={[
            {
              id: 'main',
              label: t('instructors_columns_main'),
              options: [
                { id: 'name', label: t('instructors_fields_name') },
                { id: 'email', label: t('instructors_fields_email') },
              ]
            },
            {
              id: 'details',
              label: t('instructors_columns_details'),
              options: [
                { id: 'profile', label: t('instructors_fields_profile') },
                { id: 'status', label: t('instructors_fields_status') },
                { id: 'createdAt', label: t('instructors_fields_createdAt') },
              ]
            }
          ]}
          preferences={true}
        />

        {/* 강사 생성 모달 */}
        <Modal
          visible={showCreateModal}
          onDismiss={() => setShowCreateModal(false)}
          header={t('instructors_modals_create_title')}
          size="large"
          footer={
            <Box float="right">
              <SpaceBetween direction="horizontal" size="xs">
                <Button onClick={() => setShowCreateModal(false)}>{t('cancel')}</Button>
                <Button
                  variant="primary"
                  onClick={handleCreate}
                  loading={isCreating}
                  disabled={!formData.name || !formData.email}
                >
                  {t('instructors_actions_create')}
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
                    {t('instructors_fields_name')}
                    <span className="awsui-key-label-required"> *</span>
                  </span>
                }
                description={t('instructors_fields_nameDescription')}
              >
                <Input
                  value={formData.name}
                  onChange={({ detail }) => setFormData(prev => ({ ...prev, name: detail.value }))}
                  placeholder={t('instructors_name_placeholder')}
                />
              </FormField>

              <FormField
                label={
                  <span>
                    {t('instructors_fields_email')}
                    <span className="awsui-key-label-required"> *</span>
                  </span>
                }
                description={t('instructors_fields_emailDescription')}
              >
                <Input
                  type="email"
                  value={formData.email}
                  onChange={({ detail }) => setFormData(prev => ({ ...prev, email: detail.value }))}
                  placeholder={t('instructors_email_placeholder')}
                />
              </FormField>

              <FormField
                label={t('instructors_fields_profile')}
                description={t('instructors_fields_profileDescription')}
              >
                <Textarea
                  value={formData.profile || ''}
                  onChange={({ detail }) => setFormData(prev => ({ ...prev, profile: detail.value }))}
                  placeholder={t('instructors_profile_placeholder')}
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
          header={t('instructors_modals_edit_title')}
          size="large"
          footer={
            <Box float="right">
              <SpaceBetween direction="horizontal" size="xs">
                <Button onClick={() => setShowEditModal(false)}>{t('cancel')}</Button>
                <Button
                  variant="primary"
                  onClick={handleEdit}
                  loading={isUpdating}
                  disabled={!formData.name || !formData.email}
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
                    {t('instructors_fields_name')}
                    <span className="awsui-key-label-required"> *</span>
                  </span>
                }
                description={t('instructors_fields_nameDescription')}
              >
                <Input
                  value={formData.name}
                  onChange={({ detail }) => setFormData(prev => ({ ...prev, name: detail.value }))}
                />
              </FormField>

              <FormField
                label={
                  <span>
                    {t('instructors_fields_email')}
                    <span className="awsui-key-label-required"> *</span>
                  </span>
                }
                description={t('instructors_fields_emailDescription')}
              >
                <Input
                  type="email"
                  value={formData.email}
                  onChange={({ detail }) => setFormData(prev => ({ ...prev, email: detail.value }))}
                />
              </FormField>

              <FormField
                label={t('instructors_fields_profile')}
                description={t('instructors_fields_profileDescription')}
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
            selectedInstructor?.status === InstructorStatus.ACTIVE ?
              t('instructors_modals_deactivate_title') :
              t('instructors_modals_activate_title')
          }
          footer={
            <Box float="right">
              <SpaceBetween direction="horizontal" size="xs">
                <Button onClick={() => setShowStatusChangeModal(false)}>
                  {t('cancel')}
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleStatusChange(
                    selectedInstructor?.status === InstructorStatus.ACTIVE ? 
                      InstructorStatus.INACTIVE : 
                      InstructorStatus.ACTIVE
                  )}
                  loading={isChangingStatus}
                >
                  {selectedInstructor?.status === InstructorStatus.ACTIVE ?
                    t('instructors_actions_deactivate') :
                    t('instructors_actions_activate')
                  }
                </Button>
              </SpaceBetween>
            </Box>
          }
        >
          <Box>
            {selectedInstructor?.status === InstructorStatus.ACTIVE ?
              t('instructors_modals_deactivate_confirmation', { name: selectedInstructor?.name }) :
              t('instructors_modals_activate_confirmation', { name: selectedInstructor?.name })
            }
          </Box>
        </Modal>
      </SpaceBetween>
    </ContentLayout>
  );
};

export default InstructorsTab;