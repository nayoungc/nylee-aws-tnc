// app/components/admin/catalog/CourseCatalogTab.tsx
import React, { useState } from 'react';
import {
  ContentLayout,
  SpaceBetween,
  Container,
  Header,
  Box,
  Cards,
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
  Spinner,
  Pagination,
  SelectProps
} from '@cloudscape-design/components';
import { useTranslation } from 'react-i18next';
import { useCatalog } from '@/hooks/useCatalog';
import { CourseCatalog, CourseCatalogInput } from '@/models/catalog';

const CourseCatalogTab: React.FC = () => {
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

  // 페이지네이션 상태
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [itemsPerPage] = useState(10);

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

  // 오류 처리 및 로드 실패 시 재시도
  const handleRetry = () => {
    refetch();
  };

  // 현재 페이지의 아이템 계산
  const startIndex = (currentPageIndex - 1) * itemsPerPage;
  const displayedCatalogs = catalogs.slice(startIndex, startIndex + itemsPerPage);

  // 카탈로그 생성 처리
  const handleCreate = async () => {
    try {
      await createNewCatalog(formData);
      setShowCreateModal(false);
      // 폼 초기화
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
    } catch (err) {
      console.error('Failed to delete catalog:', err);
    }
  };

  // 삭제 확인 모달 액션
  const handleDeleteClick = (catalog: CourseCatalog) => {
    selectCatalog(catalog.id);
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

        {/* 페이지 제목 및 설명 */}
        <Container
          header={
            <Header
              variant="h1"
              description={t('admin:catalog.description')}
              actions={
                <Button
                  variant="primary"
                  onClick={() => setShowCreateModal(true)}
                >
                  {t('admin:catalog.actions.createCatalog')}
                </Button>
              }
            >
              {t('admin:catalog.title')}
            </Header>
          }
        >
          {error && (
            <Alert
              type="error"
              header={t('common:error')}
              action={<Button onClick={handleRetry}>{t('common:retry')}</Button>}
              dismissible
            >
              {t('admin:catalog.errors.loadFailed')}
            </Alert>
          )}

          {loading && (
            <Box textAlign="center" padding="l">
              <Spinner size="large" />
              <Box variant="p" padding={{ top: 's' }}>
                {t('common:loading')}
              </Box>
            </Box>
          )}

          {!loading && catalogs.length === 0 && (
            <Box textAlign="center" padding="l">
              <Box variant="h3">{t('admin:catalog.noCatalogs')}</Box>
              <Box padding={{ top: 's' }}>
                <Button onClick={() => setShowCreateModal(true)}>
                  {t('admin:catalog.actions.createFirstCatalog')}
                </Button>
              </Box>
            </Box>
          )}
        </Container>

        {/* 카드 섹션 */}
        {!loading && catalogs.length > 0 && (
          <Container
            header={
              <Header
                variant="h2"
                counter={`(\${catalogs.length})`}
              >
                {t('admin:catalog.courseList')}
              </Header>
            }
          >
            <Cards
              cardDefinition={{
                header: (item: CourseCatalog) => item.title,
                sections: [
                  {
                    id: "info",
                    content: (item: CourseCatalog) => (
                      <SpaceBetween size="s">
                        <Box>
                          <Box variant="awsui-key-label">{t('admin:catalog.fields.awsCode')}</Box>
                          <Box variant="p">{item.awsCode || '-'}</Box>
                        </Box>
                        <Box>
                          <Box variant="awsui-key-label">{t('admin:catalog.fields.version')}</Box>
                          <Box variant="p">{item.version || '1.0'}</Box>
                        </Box>
                        <Box>
                          <Box variant="awsui-key-label">{t('admin:catalog.fields.level')}</Box>
                          <Box variant="p">{item.level || '-'}</Box>
                        </Box>
                        <Box>
                          <Box variant="awsui-key-label">{t('admin:catalog.fields.duration')}</Box>
                          <Box variant="p">{item.durations ? `\${item.durations} \${t('common:hours')}` : '-'}</Box>
                        </Box>
                      </SpaceBetween>
                    )
                  },
                  {
                    id: "description",
                    header: t('admin:catalog.fields.description'),
                    content: (item: CourseCatalog) => item.description || t('admin:catalog.noDescription')
                  },
                  {
                    id: "actions",
                    content: (item: CourseCatalog) => (
                      <SpaceBetween direction="horizontal" size="xs">
                        <Button variant="link" onClick={() => openEditModal(item)}>
                          {t('common:edit')}
                        </Button>
                        <Button variant="link" onClick={() => handleDeleteClick(item)}>
                          {t('common:delete')}
                        </Button>
                      </SpaceBetween>
                    )
                  }
                ]
              }}
              cardsPerRow={[
                { cards: 1 },
                { minWidth: 500, cards: 2 }
              ]}
              items={displayedCatalogs}
              empty={
                <Box textAlign="center" color="inherit">
                  <b>{t('admin:catalog.noCatalogs')}</b>
                  <Box padding={{ bottom: "s" }} variant="p" color="inherit">
                    {t('admin:catalog.createPrompt')}
                  </Box>
                  <Button onClick={() => setShowCreateModal(true)}>
                    {t('admin:catalog.actions.createCatalog')}
                  </Button>
                </Box>
              }
            />

            {/* 페이지네이션 */}
            {catalogs.length > itemsPerPage && (
              <Box padding={{ top: 'l' }}>
                <Pagination
                  currentPageIndex={currentPageIndex}
                  onChange={({ detail }) => setCurrentPageIndex(detail.currentPageIndex)}
                  pagesCount={Math.ceil(catalogs.length / itemsPerPage)}
                  ariaLabels={{
                    nextPageLabel: t('common:pagination.next'),
                    previousPageLabel: t('common:pagination.previous'),
                    pageLabel: page => t('common:pagination.pageLabel', { page })
                  }}
                />
              </Box>
            )}
          </Container>
        )}

        {/* 카탈로그 생성 모달 */}
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
              {/* 오류 1: FormField에 required 속성 대신 label에 추가 텍스트 */}
              <FormField
                label={
                  <span>
                    {t('admin:catalog.fields.title')}
                    <span className="awsui-key-label-required"> *</span>
                  </span>
                }
                description={t('admin:catalog.fields.titleDescription', '제목은 필수입니다')}
              >
                <Input
                  value={formData.title}
                  onChange={({ detail }) => setFormData(prev => ({ ...prev, title: detail.value }))}
                />
              </FormField>

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
                    onChange={({ detail }) => setFormData(prev => ({ ...prev, durations: detail.value ? parseInt(detail.value) : 0 }))}
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
                    // 기본 UI 관련 문자열
                    keyHeader: t('common:tagEditor.keyHeader', '키'),
                    valueHeader: t('common:tagEditor.valueHeader', '값'),
                    keyPlaceholder: t('common:tagEditor.keyPlaceholder', '키 입력'),
                    valuePlaceholder: t('common:tagEditor.valuePlaceholder', '값 입력'),
                    optional: t('common:tagEditor.optional', '선택 사항'),

                    // 액션 관련 문자열
                    addButton: t('common:tagEditor.addButton', '태그 추가'),
                    removeButton: t('common:tagEditor.removeButton', '태그 제거'),
                    undoButton: t('common:tagEditor.undoButton', '되돌리기'),

                    // 상태 및 알림 문자열
                    loading: t('common:loading'),
                    emptyTags: t('common:tagEditor.emptyTags', '태그가 없습니다'),
                    undoPrompt: t('common:tagEditor.undoPrompt', '이 태그는 저장 시 삭제됩니다'),

                    // 오류 관련 문자열
                    errorIconAriaLabel: t('common:tagEditor.errorIconAriaLabel', '오류'),
                    duplicateKeyError: t('common:tagEditor.duplicateKeyError', '중복된 태그'),

                    // 제안 관련 문자열
                    keySuggestion: t('common:tagEditor.keySuggestion', '제안 키'),
                    valueSuggestion: t('common:tagEditor.valueSuggestion', '제안 값'),

                    // 함수로 제공되는 문자열들 - 템플릿 리터럴 수정
                    tagLimit: (tagLimit: number) =>
                      t('common:tagEditor.tagLimit', { tagLimit: tagLimit }),
                    tagLimitReached: (tagLimit: number) =>
                      t('common:tagEditor.tagLimitReached', { tagLimit: tagLimit }),
                    enteredKeyLabel: (enteredText: string) =>
                      t('common:tagEditor.enteredKeyLabel', { enteredText: enteredText }),
                    enteredValueLabel: (enteredText: string) =>
                      t('common:tagEditor.enteredValueLabel', { enteredText: enteredText })
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
              {/* 동일한 폼 필드를 여기에도 추가할 수 있습니다 */}
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
                <Button onClick={() => setShowDeleteConfirm(false)}>{t('common:cancel')}</Button>
                <Button
                  variant="primary"
                  onClick={handleDelete}
                  loading={isDeleting}
                  // danger 속성 제거 및 스타일 수정
                  iconName="remove" // 삭제 아이콘 추가
                >
                  {t('common:delete')}
                </Button>
              </SpaceBetween>
            </Box>
          }
        >
          <Box>
            {selectedCatalog && t('admin:catalog.modals.delete.confirmation', { title: selectedCatalog.title })}
          </Box>
        </Modal>
      </SpaceBetween>
    </ContentLayout>
  );
};

export default CourseCatalogTab;