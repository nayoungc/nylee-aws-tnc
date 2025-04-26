// app/components/admin/catalog/CourseCatalogTab.tsx
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
  Select,
  TagEditor,
  StatusIndicator,
  SelectProps
} from '@cloudscape-design/components';
import { useTranslation } from 'react-i18next';
import { useCatalog } from '@/hooks/useCatalog';
import { CourseCatalog, CourseCatalogInput } from '@/models/catalog';
import EnhancedTable from '@/components/common/EnhancedTable';

const CustomersTab: React.FC = () => {
  const { t } = useTranslation(['admin', 'common']);
  const {
    catalogs,
    selectedCatalog,
    loading,
    error,
    refetch,
    selectCatalog,
    createNewCatalog,
    updateSelectedCatalog,
    deleteSelectedCatalog,
    isCreating,
    isUpdating,
    isDeleting
  } = useCatalog();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedCatalogs, setSelectedCatalogs] = useState<CourseCatalog[]>([]);

  // 폼 상태
  const [formData, setFormData] = useState<CourseCatalogInput>({
    title: '',
    awsCode: '',
    version: '1.0',
    durations: 8,
    level: 'beginner',
    description: '',
    category: '',
    tags: [],
    prerequisites: [],
    objectives: [],
    status: 'draft'
  });

  // 카탈로그 생성 처리
  const handleCreate = async () => {
    try {
      await createNewCatalog(formData);
      setShowCreateModal(false);
      resetForm();
    } catch (err) {
      console.error('Failed to create catalog:', err);
    }
  };

  // 카탈로그 수정 처리
  const handleEdit = async () => {
    try {
      await updateSelectedCatalog(formData);
      setShowEditModal(false);
    } catch (err) {
      console.error('Failed to update catalog:', err);
    }
  };

  // 카탈로그 삭제 처리
  const handleDelete = async () => {
    try {
      await deleteSelectedCatalog();
      setShowDeleteConfirm(false);
      setSelectedCatalogs([]);
    } catch (err) {
      console.error('Failed to delete catalog:', err);
    }
  };

  // 단일 카탈로그 삭제 시작
  const handleDeleteClick = (catalog: CourseCatalog) => {
    selectCatalog(catalog.id);
    setSelectedCatalogs([catalog]);
    setShowDeleteConfirm(true);
  };

  // 배치 삭제 시작
  const handleBatchDelete = () => {
    if (selectedCatalogs.length === 1) {
      selectCatalog(selectedCatalogs[0].id);
    }
    setShowDeleteConfirm(true);
  };

  // 편집 모달 열기
  const openEditModal = (catalog: CourseCatalog) => {
    selectCatalog(catalog.id);
    setFormData({
      title: catalog.title,
      awsCode: catalog.awsCode || '',
      version: catalog.version || '1.0',
      durations: catalog.durations || 8,
      level: catalog.level || 'beginner',
      description: catalog.description || '',
      category: catalog.category || '',
      tags: catalog.tags || [],
      prerequisites: catalog.prerequisites || [],
      objectives: catalog.objectives || [],
      status: catalog.status || 'draft'
    });
    setShowEditModal(true);
  };

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      title: '',
      awsCode: '',
      version: '1.0',
      durations: 8,
      level: 'beginner',
      description: '',
      category: '',
      tags: [],
      prerequisites: [],
      objectives: [],
      status: 'draft'
    });
  };

  // Select 컴포넌트 타입 처리를 위한 핸들러
  const handleLevelChange = (event: { detail: SelectProps.ChangeDetail }) => {
    setFormData(prev => ({ ...prev, level: event.detail.selectedOption.value }));
  };

  // Select 컴포넌트 타입 처리를 위한 핸들러
  const handleStatusChange = (event: { detail: SelectProps.ChangeDetail }) => {
    setFormData(prev => ({
      ...prev,
      status: event.detail.selectedOption.value as 'active' | 'draft' | 'archived'
    }));
  };

  // 테이블 칼럼 정의
  const columnDefinitions = [
    {
      id: 'title',
      header: t('admin:catalog.fields.title'),
      cell: (item: CourseCatalog) => item.title,
      sortingField: 'title',
    },
    {
      id: 'awsCode',
      header: t('admin:catalog.fields.awsCode'),
      cell: (item: CourseCatalog) => item.awsCode || '-',
      sortingField: 'awsCode',
    },
    {
      id: 'version',
      header: t('admin:catalog.fields.version'),
      cell: (item: CourseCatalog) => item.version || '1.0',
      sortingField: 'version',
    },
    {
      id: 'level',
      header: t('admin:catalog.fields.level'),
      cell: (item: CourseCatalog) => t(`admin:catalog.levels.\${item.level}`) || item.level,
      sortingField: 'level',
    },
    {
      id: 'duration',
      header: t('admin:catalog.fields.duration'),
      cell: (item: CourseCatalog) => item.durations ? 
        `\${item.durations} \${t('common:hours')}` : '-',
      sortingField: 'durations',
    },
    {
      id: 'status',
      header: t('admin:catalog.fields.status'),
      cell: (item: CourseCatalog) => {
        const statusMap: Record<string, { type: string; text: string }> = {
          active: { type: 'success', text: t('admin:catalog.status.active') },
          draft: { type: 'pending', text: t('admin:catalog.status.draft') },
          archived: { type: 'stopped', text: t('admin:catalog.status.archived') },
        };
        
        // item.status가 undefined일 수 있으므로 안전한 접근 방법 사용
        const statusKey = item.status || 'unknown';
        const status = statusMap[statusKey] || { 
          type: 'info', 
          text: statusKey === 'unknown' ? t('admin:catalog.status.unknown', '알 수 없음') : statusKey
        };
        
        return (
          <StatusIndicator type={status.type as any}>
            {status.text}
          </StatusIndicator>
        );
      },
      sortingField: 'status',
    },
    {
      id: 'actions',
      header: t('common:actions'),
      cell: (item: CourseCatalog) => (
        <SpaceBetween direction="horizontal" size="xs">
          <Button 
            variant="link" 
            onClick={() => openEditModal(item)}
          >
            {t('common:edit')}
          </Button>
          <Button 
            variant="link" 
            onClick={() => handleDeleteClick(item)}
          >
            {t('common:delete')}
          </Button>
        </SpaceBetween>
      ),
    }
  ];

  // 필터링 속성
  const filteringProperties = [
    { key: 'title', label: t('admin:catalog.fields.title') },
    { key: 'awsCode', label: t('admin:catalog.fields.awsCode') },
    { key: 'level', label: t('admin:catalog.fields.level') },
    { key: 'status', label: t('admin:catalog.fields.status') },
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
              { text: t('admin:catalog.title'), href: '#' }
            ]}
            ariaLabel={t('common:breadcrumbs')}
          />
        </Box>

        {/* 오류 표시 */}
        {error && (
          <Alert
            type="error"
            header={t('common:error')}
            action={<Button onClick={refetch}>{t('common:retry')}</Button>}
            dismissible
          >
            {t('admin:catalog.errors.loadFailed')}
          </Alert>
        )}

        {/* EnhancedTable 사용 */}
        <EnhancedTable
          title={t('admin:catalog.title')}
          description={t('admin:catalog.description')}
          columnDefinitions={columnDefinitions}
          items={catalogs}
          loading={loading}
          selectionType="multi"
          selectedItems={selectedCatalogs}
          onSelectionChange={setSelectedCatalogs}
          onRefresh={refetch}
          actions={{
            primary: {
              text: t('admin:catalog.actions.createCatalog'),
              onClick: () => setShowCreateModal(true)
            }
          }}
          batchActions={[
            {
              text: t('common:actions.deleteSelected'),
              onClick: handleBatchDelete,
              disabled: selectedCatalogs.length === 0
            }
          ]}
          filteringProperties={filteringProperties}
          stickyHeader={true}
          stripedRows={true}
          defaultSortingColumn="title"
          emptyText={{
            title: t('admin:catalog.noCatalogs'),
            subtitle: t('admin:catalog.createPrompt'),
            action: {
              text: t('admin:catalog.actions.createCatalog'),
              onClick: () => setShowCreateModal(true)
            }
          }}
          visibleContentOptions={[
            {
              id: 'main',
              label: t('admin:catalog.columns.main'),
              options: [
                { id: 'title', label: t('admin:catalog.fields.title') },
                { id: 'awsCode', label: t('admin:catalog.fields.awsCode') },
                { id: 'version', label: t('admin:catalog.fields.version') },
              ]
            },
            {
              id: 'details',
              label: t('admin:catalog.columns.details'),
              options: [
                { id: 'level', label: t('admin:catalog.fields.level') },
                { id: 'duration', label: t('admin:catalog.fields.duration') },
                { id: 'status', label: t('admin:catalog.fields.status') },
              ]
            }
          ]}
          preferences={true}
        />

        {/* 카탈로그 생성 모달 */}
        <Modal
          visible={showCreateModal}
          onDismiss={() => setShowCreateModal(false)}
          header={t('admin:catalog.modals.create.title')}
          size="large"
          footer={
            <Box float="right">
              <SpaceBetween direction="horizontal" size="xs">
                <Button onClick={() => setShowCreateModal(false)}>{t('common:cancel')}</Button>
                <Button
                  variant="primary"
                  onClick={handleCreate}
                  loading={isCreating}
                  disabled={!formData.title}
                >
                  {t('admin:catalog.actions.create')}
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
                    {t('admin:catalog.fields.title')}
                    <span className="awsui-key-label-required"> *</span>
                  </span>
                }
                description={t('admin:catalog.fields.titleDescription')}
              >
                <Input
                  value={formData.title}
                  onChange={({ detail }) => setFormData(prev => ({ ...prev, title: detail.value }))}
                />
              </FormField>

              {/* 나머지 폼 필드들 */}
              <FormField label={t('admin:catalog.fields.awsCode')}>
                <Input
                  value={formData.awsCode || ''}
                  onChange={({ detail }) => setFormData(prev => ({ ...prev, awsCode: detail.value }))}
                  placeholder="AWS-100"
                />
              </FormField>

              <SpaceBetween direction="horizontal" size="xs">
                <FormField label={t('admin:catalog.fields.version')}>
                  <Input
                    value={formData.version || ''}
                    onChange={({ detail }) => setFormData(prev => ({ ...prev, version: detail.value }))}
                    placeholder="1.0"
                  />
                </FormField>

                <FormField label={t('admin:catalog.fields.duration')}>
                  <Input
                    type="number"
                    value={formData.durations?.toString() || '0'}
                    onChange={({ detail }) => setFormData(prev => ({ 
                      ...prev, 
                      durations: detail.value ? parseInt(detail.value) : 0 
                    }))}
                  />
                </FormField>

                <FormField label={t('admin:catalog.fields.level')}>
                  <Select
                    selectedOption={{
                      value: formData.level || 'beginner',
                      label: t(`admin:catalog.levels.\${formData.level || 'beginner'}`)
                    }}
                    onChange={handleLevelChange}
                    options={[
                      { value: 'beginner', label: t('admin:catalog.levels.beginner') },
                      { value: 'intermediate', label: t('admin:catalog.levels.intermediate') },
                      { value: 'advanced', label: t('admin:catalog.levels.advanced') }
                    ]}
                  />
                </FormField>
              </SpaceBetween>

              <FormField label={t('admin:catalog.fields.description')}>
                <Textarea
                  value={formData.description || ''}
                  onChange={({ detail }) => setFormData(prev => ({ ...prev, description: detail.value }))}
                  rows={4}
                />
              </FormField>

              <FormField label={t('admin:catalog.fields.tags')}>
                <TagEditor
                  tags={(formData.tags || []).map(tag => ({
                    key: tag,
                    value: tag,
                    existing: true
                  }))}
                  onChange={({ detail }) => {
                    const newTags = detail.tags
                      .filter(tag => !tag.markedForRemoval)
                      .map(tag => tag.value);
                    setFormData(prev => ({ ...prev, tags: newTags }));
                  }}
                  i18nStrings={{
                    // 간소화된 i18n 문자열
                    keyHeader: t('common:tagEditor.keyHeader', '키'),
                    valueHeader: t('common:tagEditor.valueHeader', '값'),
                    addButton: t('common:tagEditor.addButton', '태그 추가'),
                    removeButton: t('common:tagEditor.removeButton', '제거'),
                    loading: t('common:loading'),
                    // 기타 필요한 문자열...
                  }}
                />
              </FormField>

              <FormField label={t('admin:catalog.fields.status')}>
                <Select
                  selectedOption={{
                    value: formData.status || 'draft',
                    label: t(`admin:catalog.status.\${formData.status || 'draft'}`)
                  }}
                  onChange={handleStatusChange}
                  options={[
                    { value: 'draft', label: t('admin:catalog.status.draft') },
                    { value: 'active', label: t('admin:catalog.status.active') },
                    { value: 'archived', label: t('admin:catalog.status.archived') }
                  ]}
                />
              </FormField>
            </SpaceBetween>
          </Form>
        </Modal>

        {/* 카탈로그 편집 모달 */}
        <Modal
          visible={showEditModal}
          onDismiss={() => setShowEditModal(false)}
          header={t('admin:catalog.modals.edit.title')}
          size="large"
          footer={
            <Box float="right">
              <SpaceBetween direction="horizontal" size="xs">
                <Button onClick={() => setShowEditModal(false)}>{t('common:cancel')}</Button>
                <Button
                  variant="primary"
                  onClick={handleEdit}
                  loading={isUpdating}
                  disabled={!formData.title}
                >
                  {t('common:save')}
                </Button>
              </SpaceBetween>
            </Box>
          }
        >
          <Form>
            <SpaceBetween size="l">
              {/* 동일한 폼 필드 반복 (생략) */}
              {/* 필요시 편집 모달에 특화된 추가 필드 */}
            </SpaceBetween>
          </Form>
        </Modal>

        {/* 삭제 확인 모달 */}
        <Modal
          visible={showDeleteConfirm}
          onDismiss={() => setShowDeleteConfirm(false)}
          header={t('admin:catalog.modals.delete.title')}
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
            {selectedCatalogs.length === 1 ? 
              t('admin:catalog.modals.delete.confirmation', { title: selectedCatalogs[0].title }) :
              t('admin:catalog.modals.delete.confirmationBatch', { count: selectedCatalogs.length })}
          </Box>
        </Modal>
      </SpaceBetween>
    </ContentLayout>
  );
};

export default CustomersTab;