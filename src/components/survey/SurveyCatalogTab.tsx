// src/components/admin/survey/SurveyCatalogTab.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Header,
  Modal,
  SpaceBetween,
  FormField,
  Input,
  Textarea,
  Multiselect,
  ColumnLayout,
  Container,
  TagEditor,
  Toggle
} from '@cloudscape-design/components';
import EnhancedTable from '@/components/common/EnhancedTable';
import { useAppTranslation } from '@/hooks/useAppTranslation';

interface SurveyCatalog {
  surveyCatalogId: string;
  title: string;
  description: string;
  questionItems: any[];
  category: string;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

const SurveyCatalogTab: React.FC = () => {
  const { t } = useAppTranslation();
  const [surveys, setSurveys] = useState<SurveyCatalog[]>([]);
  const [selectedSurveys, setSelectedSurveys] = useState<SurveyCatalog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editSurvey, setEditSurvey] = useState<SurveyCatalog | null>(null);

  // 샘플 데이터 로드
  useEffect(() => {
    // API 호출 또는 데이터 로드 로직
    const sampleSurveys: SurveyCatalog[] = [
      {
        surveyCatalogId: '1',
        title: '교육 만족도 조사',
        description: '교육 프로그램에 대한 전반적인 만족도 평가 설문',
        questionItems: [
          { id: '1', type: 'rating', content: '강의 내용은 얼마나 유익했습니까?' },
          { id: '2', type: 'openEnded', content: '향후 개선되었으면 하는 점을 자유롭게 작성해주세요.' }
        ],
        category: '교육평가',
        tags: ['교육품질', '만족도'],
        isActive: true,
        createdAt: '2023-09-01',
        updatedAt: '2023-09-01',
        createdBy: 'admin'
      },
      {
        surveyCatalogId: '2',
        title: '강사 평가',
        description: '강사의 교육 역량 및 커뮤니케이션 평가',
        questionItems: [
          { id: '3', type: 'rating', content: '강사의 교육 방식은 이해하기 쉬웠습니까?' },
          { id: '4', type: 'multipleChoice', content: '강사의 교육 자료는 충분했습니까?' }
        ],
        category: '강사평가',
        tags: ['강사역량', '교육방법'],
        isActive: true,
        createdAt: '2023-09-05',
        updatedAt: '2023-09-05',
        createdBy: 'admin'
      }
    ];
    setSurveys(sampleSurveys);
    setLoading(false);
  }, []);

  // 테이블 컬럼 정의
  const columnDefinitions = [
    {
      id: 'title',
      header: t('admin:surveyCatalog.columns.title', '설문조사 제목'),
      cell: (item: SurveyCatalog) => item.title,
      sortingField: 'title',
      isRowHeader: true,
    },
    {
      id: 'category',
      header: t('admin:surveyCatalog.columns.category', '카테고리'),
      cell: (item: SurveyCatalog) => item.category,
      sortingField: 'category',
    },
    {
      id: 'questionCount',
      header: t('admin:surveyCatalog.columns.questionCount', '문항 수'),
      cell: (item: SurveyCatalog) => item.questionItems.length,
      sortingField: 'questionCount',
    },
    {
      id: 'tags',
      header: t('admin:surveyCatalog.columns.tags', '태그'),
      cell: (item: SurveyCatalog) => item.tags.join(', '),
      sortingField: 'tags',
    },
    {
      id: 'isActive',
      header: t('admin:surveyCatalog.columns.status', '상태'),
      cell: (item: SurveyCatalog) => item.isActive ? 
        t('admin:surveyCatalog.status.active', '활성화') : 
        t('admin:surveyCatalog.status.inactive', '비활성화'),
      sortingField: 'isActive',
    },
    {
      id: 'createdAt',
      header: t('admin:surveyCatalog.columns.createdAt', '생성일'),
      cell: (item: SurveyCatalog) => item.createdAt,
      sortingField: 'createdAt',
    },
    {
      id: 'actions',
      header: t('admin:surveyCatalog.columns.actions', '작업'),
      cell: (item: SurveyCatalog) => (
        <SpaceBetween direction="horizontal" size="xs">
          <Button 
            variant="link" 
            onClick={() => handleDeploySurvey(item)}
          >
            {t('admin:surveyCatalog.actions.deploy', '배포')}
          </Button>
          <Button 
            variant="link" 
            onClick={() => handleEditSurvey(item)}
          >
            {t('common:edit', '편집')}
          </Button>
          <Button 
            variant="link" 
            onClick={() => handleDeleteSurvey(item.surveyCatalogId)}
          >
            {t('common:delete', '삭제')}
          </Button>
        </SpaceBetween>
      ),
    },
  ];

  // 필터링 속성 정의
  const filteringProperties = [
    {
      key: 'title',
      label: t('admin:surveyCatalog.columns.title', '설문조사 제목')
    },
    {
      key: 'category',
      label: t('admin:surveyCatalog.columns.category', '카테고리')
    },
    {
      key: 'tags',
      label: t('admin:surveyCatalog.columns.tags', '태그')
    },
    {
      key: 'isActive',
      label: t('admin:surveyCatalog.columns.status', '상태')
    }
  ];

  // 액션 핸들러
  const handleRefresh = () => {
    setLoading(true);
    // API 호출 또는 데이터 리로드 로직
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleCreateSurvey = () => {
    setEditSurvey(null);
    setModalVisible(true);
  };

  const handleEditSurvey = (survey: SurveyCatalog) => {
    setEditSurvey(survey);
    setModalVisible(true);
  };

  const handleDeploySurvey = (survey: SurveyCatalog) => {
    // 설문조사 배포 로직 구현
    console.log('배포할 설문조사:', survey);
    // 여기서 별도의 배포 모달을 열거나 배포 페이지로 이동
  };

  const handleDeleteSurvey = (surveyCatalogId: string) => {
    // 삭제 로직 구현
    setSurveys(surveys.filter(s => s.surveyCatalogId !== surveyCatalogId));
  };

  const handleBatchDelete = () => {
    // 선택된 항목 일괄 삭제 로직
    const remainingSurveys = surveys.filter(
      s => !selectedSurveys.some(ss => ss.surveyCatalogId === s.surveyCatalogId)
    );
    setSurveys(remainingSurveys);
    setSelectedSurveys([]);
  };

  const handleModalSubmit = (formData: any) => {
    // 저장 로직 구현 (신규 또는 수정)
    if (editSurvey) {
      // 기존 설문조사 수정
      setSurveys(surveys.map(s => 
        s.surveyCatalogId === editSurvey.surveyCatalogId ? 
          { ...s, ...formData, updatedAt: new Date().toISOString().split('T')[0] } : s
      ));
    } else {
      // 신규 설문조사 추가
      const newSurvey = {
        ...formData,
        surveyCatalogId: Date.now().toString(), // 임시 ID 생성
        questionItems: [], // 초기에는 문항 없음
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        createdBy: 'admin' // 현재 로그인한 사용자로 설정해야 함
      };
      setSurveys([...surveys, newSurvey]);
    }
    setModalVisible(false);
  };

  // 설문조사 템플릿 편집/생성 모달
  const renderSurveyModal = () => {
    return (
      <Modal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        header={
          <Header variant="h2">
            {editSurvey 
              ? t('admin:surveyCatalog.modal.editTitle', '설문조사 템플릿 편집') 
              : t('admin:surveyCatalog.modal.createTitle', '새 설문조사 템플릿 생성')}
          </Header>
        }
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setModalVisible(false)}>
                {t('common:cancel', '취소')}
              </Button>
              <Button variant="primary" onClick={() => handleModalSubmit({/* 폼 데이터 */})}>
                {t('common:save', '저장')}
              </Button>
            </SpaceBetween>
          </Box>
        }
        size="large"
      >
        <SpaceBetween size="l">
          <FormField
            label={t('admin:surveyCatalog.form.title', '설문조사 제목')}
            description={t('admin:surveyCatalog.form.titleDesc', '설문조사의 제목을 입력하세요')}
          >
            <Input
              value={editSurvey?.title || ''}
              onChange={({ detail }) => {
                if (editSurvey) {
                  setEditSurvey({ ...editSurvey, title: detail.value });
                }
              }}
            />
          </FormField>

          <FormField
            label={t('admin:surveyCatalog.form.description', '설명')}
            description={t('admin:surveyCatalog.form.descriptionDesc', '설문조사의 목적이나 내용에 대한 설명')}
          >
            <Textarea
              value={editSurvey?.description || ''}
              onChange={({ detail }) => {
                if (editSurvey) {
                  setEditSurvey({ ...editSurvey, description: detail.value });
                }
              }}
            />
          </FormField>

          <FormField
            label={t('admin:surveyCatalog.form.category', '카테고리')}
          >
            <Input
              value={editSurvey?.category || ''}
              onChange={({ detail }) => {
                if (editSurvey) {
                  setEditSurvey({ ...editSurvey, category: detail.value });
                }
              }}
            />
          </FormField>

          <FormField
            label={t('admin:surveyCatalog.form.tags', '태그')}
            description={t('admin:surveyCatalog.form.tagsDesc', '설문조사를 분류하는 태그를 추가하세요')}
          >
            <TagEditor
  tags={editSurvey?.tags?.map(tag => ({ 
    key: tag, 
    value: tag,
    existing: true,  // 필요한 existing 속성 추가
    markedForRemoval: false
  })) || []}
  onChange={({ detail }) => {
    if (editSurvey) {
      setEditSurvey({ 
        ...editSurvey, 
        tags: detail.tags
          .filter(tag => !tag.markedForRemoval)
          .map(tag => tag.value)
          .filter((value): value is string => value !== undefined)
      });
    }
  }}
              i18nStrings={{
                keyHeader: t('common:tagEditor.keyHeader', '키'),
                valueHeader: t('common:tagEditor.valueHeader', '값'),
                addButton: t('common:tagEditor.addButton', '태그 추가'),
                removeButton: t('common:tagEditor.removeButton', '태그 제거'),
                undoButton: t('common:tagEditor.undoButton', '되돌리기'),
                undoPrompt: t('common:tagEditor.undoPrompt', '이 태그는 저장 후 삭제됩니다'),
                loading: t('common:tagEditor.loading', '태그 로딩 중'),
                keyPlaceholder: t('common:tagEditor.keyPlaceholder', '태그 입력'),
                valuePlaceholder: t('common:tagEditor.valuePlaceholder', '값 입력'),
                emptyTags: t('common:tagEditor.emptyTags', '추가된 태그 없음'),
              }}
              allowedCharacterPattern="[a-zA-Z0-9_-]+"
            />
          </FormField>

          <FormField
            label={t('admin:surveyCatalog.form.isActive', '활성화 상태')}
          >
            <Toggle
              checked={editSurvey?.isActive || false}
              onChange={({ detail }) => {
                if (editSurvey) {
                  setEditSurvey({ ...editSurvey, isActive: detail.checked });
                }
              }}
            >
              {editSurvey?.isActive ? 
                t('admin:surveyCatalog.status.active', '활성화') : 
                t('admin:surveyCatalog.status.inactive', '비활성화')}
            </Toggle>
          </FormField>
        </SpaceBetween>
      </Modal>
    );
  };

  return (
    <Box padding="l">
      <SpaceBetween size="l">
        <Header
          variant="h1"
          description={t('admin:surveyCatalog.description', '설문조사 템플릿을 관리하고 배포합니다.')}
        >
          {t('admin:surveyCatalog.title', '설문 템플릿 관리')}
        </Header>

        <EnhancedTable
          title={t('admin:surveyCatalog.tableTitle', '설문조사 템플릿 목록')}
          description={t('admin:surveyCatalog.tableDescription', '모든 설문조사 템플릿을 조회하고 관리할 수 있습니다.')}
          columnDefinitions={columnDefinitions}
          items={surveys}
          loading={loading}
          selectionType="multi"
          selectedItems={selectedSurveys}
          onSelectionChange={setSelectedSurveys}
          onRefresh={handleRefresh}
          actions={{
            primary: {
              text: t('admin:surveyCatalog.actions.create', '새 설문조사 만들기'),
              onClick: handleCreateSurvey
            }
          }}
          batchActions={[
            {
              text: t('admin:surveyCatalog.actions.batchDelete', '선택 항목 삭제'),
              onClick: handleBatchDelete,
              disabled: selectedSurveys.length === 0
            }
          ]}
          filteringProperties={filteringProperties}
          usePropertyFilter={true}
          defaultSortingColumn="createdAt"
          defaultSortingDescending={true}
          emptyText={{
            title: t('admin:surveyCatalog.emptyState.title', '설문조사 템플릿이 없습니다'),
            subtitle: t('admin:surveyCatalog.emptyState.subtitle', '새 설문조사 템플릿을 추가해보세요'),
            action: {
              text: t('admin:surveyCatalog.actions.create', '새 설문조사 만들기'),
              onClick: handleCreateSurvey
            }
          }}
          stickyHeader={true}
          stripedRows={true}
          resizableColumns={true}
          preferences={true}
          trackBy="surveyCatalogId"
        />
        
        {renderSurveyModal()}
      </SpaceBetween>
    </Box>
  );
};

export default SurveyCatalogTab;