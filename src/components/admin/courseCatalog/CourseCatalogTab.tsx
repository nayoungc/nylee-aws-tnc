// src/components/admin/catalog/CourseCatalogTab.tsx
import React, { useState } from 'react';
import {
  ContentLayout,
  SpaceBetween,
  Container,
  Header,
  Box,
  Button,
  Alert,
  Modal,
  Form,
  FormField,
  Input,
  Textarea,
  Select,
  TagEditor,
  StatusIndicator,
  SelectProps
} from '@cloudscape-design/components';
import { useCourseCatalog } from '@/hooks/useCourseCatalog';
import { CourseCatalog, CourseCatalogInput, CourseCatalogStatus } from '@/models/courseCatalog';
import EnhancedTable from '@/components/common/EnhancedTable';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import BreadcrumbGroup from '@/components/layout/BreadcrumbGroup';

/**
 * 코스 카탈로그 관리 탭 컴포넌트
 * 백엔드 스키마와는 필드명 차이(title->course_name, awsCode->course_id 등)가 있으므로 변환 로직 포함
 */
const CourseCatalogTab: React.FC = () => {
  const { t } = useAppTranslation();
  const {
    catalogs,
    selectedCatalog,
    loading,
    error,
    refetch,
    selectCourseCatalog,
    createNewCourseCatalog,
    updateSelectedCourseCatalog,
    deleteSelectedCourseCatalog,
    isCreating,
    isUpdating,
    isDeleting
  } = useCourseCatalog();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedCatalogs, setSelectedCatalogs] = useState<CourseCatalog[]>([]);

  // 백엔드 스키마에 맞는 형식으로 정의
  const [formData, setFormData] = useState<CourseCatalogInput>({
    course_name: '',         // 필드명 통일
    course_id: '',
    level: 'beginner',
    duration: '8',
    delivery_method: 'online',
    description: '',
    objectives: [],
    target_audience: '',
    status: CourseCatalogStatus.ACTIVE
  });

  const handleCreate = async () => {
    try {
      await createNewCourseCatalog(formData);
      setShowCreateModal(false);
      resetForm();
    } catch (err) {
      console.error('Failed to create catalog:', err);
    }
  };

  const handleEdit = async () => {
    try {
      await updateSelectedCourseCatalog(formData);
      setShowEditModal(false);
    } catch (err) {
      console.error('Failed to update catalog:', err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSelectedCourseCatalog();
      setShowDeleteConfirm(false);
      setSelectedCatalogs([]);
    } catch (err) {
      console.error('Failed to delete catalog:', err);
    }
  };

  const handleDeleteClick = (catalog: CourseCatalog) => {
    selectCourseCatalog(catalog.id);
    setSelectedCatalogs([catalog]);
    setShowDeleteConfirm(true);
  };

  const handleBatchDelete = () => {
    if (selectedCatalogs.length === 1) {
      selectCourseCatalog(selectedCatalogs[0].id);
    }
    setShowDeleteConfirm(true);
  };

  const openEditModal = (catalog: CourseCatalog) => {
    selectCourseCatalog(catalog.id);
    // 백엔드 스키마에 맞게 formData 설정
    setFormData({
      course_name: catalog.course_name,
      course_id: catalog.course_id || '',
      level: catalog.level || 'beginner',
      duration: catalog.duration || '8',
      delivery_method: catalog.delivery_method || 'online',
      description: catalog.description || '',
      objectives: catalog.objectives || [],
      target_audience: catalog.target_audience || '',
      status: catalog.status || CourseCatalogStatus.ACTIVE
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    // 백엔드 스키마에 맞게 초기 상태 리셋
    setFormData({
      course_name: '',
      course_id: '',
      level: 'beginner',
      duration: '8',
      delivery_method: 'online',
      description: '',
      objectives: [],
      target_audience: '',
      status: CourseCatalogStatus.ACTIVE
    });
  };

  const handleLevelChange = (event: { detail: SelectProps.ChangeDetail }) => {
    setFormData(prev => ({ ...prev, level: event.detail.selectedOption.value as any }));
  };

  const columnDefinitions = [
    {
      id: 'course_name',  // 필드명 변경
      header: t('catalog_field_title'),
      cell: (item: CourseCatalog) => item.course_name,
      sortingField: 'course_name',
    },
    {
      id: 'course_id',  // 필드명 변경
      header: t('catalog_field_aws_code'),
      cell: (item: CourseCatalog) => item.course_id || '-',
      sortingField: 'course_id',
    },
    {
      id: 'level',
      header: t('catalog_field_level'),
      cell: (item: CourseCatalog) => t(`catalog_level_\${item.level}`) || item.level,
      sortingField: 'level',
    },
    {
      id: 'duration',  // 필드명 변경
      header: t('catalog_field_duration'),
      cell: (item: CourseCatalog) => item.duration ? `\${item.duration} \${t('hours')}` : '-',
      sortingField: 'duration',
    },
    {
      id: 'status',
      header: t('catalog_field_status'),
      cell: (item: CourseCatalog) => {
        const statusType = item.status === CourseCatalogStatus.ACTIVE ? 'success' : 'stopped';
        return (
          <StatusIndicator type={statusType as any}>
            {t(`catalog_status_\${item.status?.toLowerCase() || 'active'}`)}
          </StatusIndicator>
        );
      },
      sortingField: 'status',
    },
    {
      id: 'actions',
      header: t('field_actions'),
      cell: (item: CourseCatalog) => (
        <SpaceBetween direction="horizontal" size="xs">
          <Button
            variant="link"
            onClick={() => openEditModal(item)}
          >
            {t('edit')}
          </Button>
          <Button
            variant="link"
            onClick={() => handleDeleteClick(item)}
          >
            {t('delete')}
          </Button>
        </SpaceBetween>
      ),
    }
  ];

  const filteringProperties = [
    { key: 'course_name', label: t('catalog_field_title') },  // 필드명 변경
    { key: 'course_id', label: t('catalog_field_aws_code') },  // 필드명 변경
    { key: 'level', label: t('catalog_field_level') },
    { key: 'status', label: t('catalog_field_status') },
  ];

  return (
    <ContentLayout>
      <SpaceBetween size="l">
        <Box padding={{ top: 's' }}>
          <BreadcrumbGroup
            items={[
              { translationKey: 'navigation_home', href: '/' },
              { translationKey: 'admin_title', href: '/admin' },
              { translationKey: 'catalog_title', href: '/admin/catalog' }
            ]}
          />
        </Box>

        {error && (
          <Alert
            type="error"
            header={t('error')}
            action={<Button onClick={() => refetch()}>{t('retry')}</Button>}
            dismissible
          >
            {t('catalog_error_load_failed')}
          </Alert>
        )}

        <EnhancedTable
          title={t('catalog_title')}
          description={t('catalog_description')}
          columnDefinitions={columnDefinitions}
          items={catalogs}
          loading={loading}
          selectionType="multi"
          selectedItems={selectedCatalogs}
          onSelectionChange={setSelectedCatalogs}
          onRefresh={refetch}
          actions={{
            primary: {
              text: t('catalog_action_create_catalog'),
              onClick: () => setShowCreateModal(true)
            }
          }}
          batchActions={[
            {
              text: t('actions_delete_selected'),
              onClick: handleBatchDelete,
              disabled: selectedCatalogs.length === 0
            }
          ]}
          filteringProperties={filteringProperties}
          stickyHeader={true}
          stripedRows={true}
          defaultSortingColumn="course_name"  // 필드명 변경
          emptyText={{
            title: t('empty_state_title'),
            subtitle: t('empty_state_message'),
            action: {
              text: t('catalog_action_create_catalog'),
              onClick: () => setShowCreateModal(true)
            }
          }}
          preferences={true}
        />

        {/* 생성 모달 */}
        <Modal
          visible={showCreateModal}
          onDismiss={() => setShowCreateModal(false)}
          header={t('catalog_modal_create_title')}
          size="large"
          footer={
            <Box float="right">
              <SpaceBetween direction="horizontal" size="xs">
                <Button onClick={() => setShowCreateModal(false)}>{t('cancel')}</Button>
                <Button
                  variant="primary"
                  onClick={handleCreate}
                  loading={isCreating}
                  disabled={!formData.course_name}
                >
                  {t('catalog_action_create')}
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
                    {t('catalog_field_title')}
                    <span className="awsui-key-label-required"> *</span>
                  </span>
                }
                description={t('catalog_field_title_description')}
              >
                <Input
                  value={formData.course_name}
                  onChange={({ detail }) => setFormData(prev => ({ ...prev, course_name: detail.value }))}
                />
              </FormField>

              <FormField label={t('catalog_field_aws_code')}>
                <Input
                  value={formData.course_id || ''}
                  onChange={({ detail }) => setFormData(prev => ({ ...prev, course_id: detail.value }))}
                  placeholder="AWS-100"
                />
              </FormField>

              <SpaceBetween direction="horizontal" size="xs">
                <FormField label={t('catalog_field_duration')}>
                  <Input
                    type="text"
                    value={formData.duration || "8"}
                    onChange={({ detail }) => setFormData(prev => ({
                      ...prev,
                      duration: detail.value
                    }))}
                  />
                </FormField>

                <FormField label={t('catalog_field_level')}>
                  <Select
                    selectedOption={{
                      value: formData.level || 'beginner',
                      label: t(`catalog_level_\${formData.level || 'beginner'}`)
                    }}
                    onChange={handleLevelChange}
                    options={[
                      { value: 'beginner', label: t('catalog_level_beginner') },
                      { value: 'intermediate', label: t('catalog_level_intermediate') },
                      { value: 'advanced', label: t('catalog_level_advanced') }
                    ]}
                  />
                </FormField>
                
                <FormField label={t('catalog_field_delivery_method')}>
                  <Select
                    selectedOption={{
                      value: formData.delivery_method || 'online',
                      label: t(`catalog_delivery_\${formData.delivery_method || 'online'}`)
                    }}
                    onChange={({ detail }) => setFormData(prev => ({ 
                      ...prev, 
                      delivery_method: detail.selectedOption.value as any 
                    }))}
                    options={[
                      { value: 'online', label: t('catalog_delivery_online') },
                      { value: 'offline', label: t('catalog_delivery_offline') },
                      { value: 'hybrid', label: t('catalog_delivery_hybrid') }
                    ]}
                  />
                </FormField>
              </SpaceBetween>

              <FormField label={t('catalog_field_description')}>
                <Textarea
                  value={formData.description || ''}
                  onChange={({ detail }) => setFormData(prev => ({ ...prev, description: detail.value }))}
                  rows={4}
                />
              </FormField>

              <FormField label={t('catalog_field_target_audience')}>
                <Input
                  value={formData.target_audience || ''}
                  onChange={({ detail }) => setFormData(prev => ({ ...prev, target_audience: detail.value }))}
                />
              </FormField>
              
              <FormField label={t('catalog_field_status')}>
                <Select
                  selectedOption={{
                    value: formData.status || CourseCatalogStatus.ACTIVE,
                    label: t(`catalog_status_\${(formData.status || CourseCatalogStatus.ACTIVE).toLowerCase()}`)
                  }}
                  onChange={({ detail }) => setFormData(prev => ({ 
                    ...prev, 
                    status: detail.selectedOption.value as CourseCatalogStatus
                  }))}
                  options={[
                    { value: CourseCatalogStatus.ACTIVE, label: t('catalog_status_active') },
                    { value: CourseCatalogStatus.EOL, label: t('catalog_status_eol') }
                  ]}
                />
              </FormField>
            </SpaceBetween>
          </Form>
        </Modal>

        {/* 편집 모달 */}
        <Modal
          visible={showEditModal}
          onDismiss={() => setShowEditModal(false)}
          header={t('catalog_modal_edit_title')}
          size="large"
          footer={
            <Box float="right">
              <SpaceBetween direction="horizontal" size="xs">
                <Button onClick={() => setShowEditModal(false)}>{t('cancel')}</Button>
                <Button
                  variant="primary"
                  onClick={handleEdit}
                  loading={isUpdating}
                  disabled={!formData.course_name}
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
                    {t('catalog_field_title')}
                    <span className="awsui-key-label-required"> *</span>
                  </span>
                }
                description={t('catalog_field_title_description')}
              >
                <Input
                  value={formData.course_name}
                  onChange={({ detail }) => setFormData(prev => ({ ...prev, course_name: detail.value }))}
                />
              </FormField>

              <FormField label={t('catalog_field_aws_code')}>
                <Input
                  value={formData.course_id || ''}
                  onChange={({ detail }) => setFormData(prev => ({ ...prev, course_id: detail.value }))}
                />
              </FormField>

              <SpaceBetween direction="horizontal" size="xs">
                <FormField label={t('catalog_field_duration')}>
                  <Input
                    type="text"
                    value={formData.duration || "8"}
                    onChange={({ detail }) => setFormData(prev => ({
                      ...prev,
                      duration: detail.value
                    }))}
                  />
                </FormField>

                <FormField label={t('catalog_field_level')}>
                  <Select
                    selectedOption={{
                      value: formData.level || 'beginner',
                      label: t(`catalog_level_\${formData.level || 'beginner'}`)
                    }}
                    onChange={handleLevelChange}
                    options={[
                      { value: 'beginner', label: t('catalog_level_beginner') },
                      { value: 'intermediate', label: t('catalog_level_intermediate') },
                      { value: 'advanced', label: t('catalog_level_advanced') }
                    ]}
                  />
                </FormField>
                
                <FormField label={t('catalog_field_delivery_method')}>
                  <Select
                    selectedOption={{
                      value: formData.delivery_method || 'online',
                      label: t(`catalog_delivery_\${formData.delivery_method || 'online'}`)
                    }}
                    onChange={({ detail }) => setFormData(prev => ({ 
                      ...prev, 
                      delivery_method: detail.selectedOption.value as any 
                    }))}
                    options={[
                      { value: 'online', label: t('catalog_delivery_online') },
                      { value: 'offline', label: t('catalog_delivery_offline') },
                      { value: 'hybrid', label: t('catalog_delivery_hybrid') }
                    ]}
                  />
                </FormField>
              </SpaceBetween>

              <FormField label={t('catalog_field_description')}>
                <Textarea
                  value={formData.description || ''}
                  onChange={({ detail }) => setFormData(prev => ({ ...prev, description: detail.value }))}
                  rows={4}
                />
              </FormField>

              <FormField label={t('catalog_field_target_audience')}>
                <Input
                  value={formData.target_audience || ''}
                  onChange={({ detail }) => setFormData(prev => ({ ...prev, target_audience: detail.value }))}
                />
              </FormField>
              
              <FormField label={t('catalog_field_status')}>
                <Select
                  selectedOption={{
                    value: formData.status || CourseCatalogStatus.ACTIVE,
                    label: t(`catalog_status_\${(formData.status || CourseCatalogStatus.ACTIVE).toLowerCase()}`)
                  }}
                  onChange={({ detail }) => setFormData(prev => ({ 
                    ...prev, 
                    status: detail.selectedOption.value as CourseCatalogStatus
                  }))}
                  options={[
                    { value: CourseCatalogStatus.ACTIVE, label: t('catalog_status_active') },
                    { value: CourseCatalogStatus.EOL, label: t('catalog_status_eol') }
                  ]}
                />
              </FormField>
            </SpaceBetween>
          </Form>
        </Modal>

        {/* 삭제 확인 모달 */}
        <Modal
          visible={showDeleteConfirm}
          onDismiss={() => setShowDeleteConfirm(false)}
          header={t('catalog_modal_delete_title')}
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
            {selectedCatalogs.length === 1 ?
              t('catalog_modal_delete_confirmation', { title: selectedCatalogs[0].course_name }) :
              t('catalog_modal_delete_confirmation_batch', { count: selectedCatalogs.length })}
          </Box>
        </Modal>
      </SpaceBetween>
    </ContentLayout>
  );
};

export default CourseCatalogTab;