// src/components/admin/surveys/SurveyCatalogTab.tsx
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
  TagEditor,
  Toggle,
  Select,
  Alert,
  DatePicker
} from '@cloudscape-design/components';
import Board, { BoardProps } from "@cloudscape-design/board-components/board";
import BoardItem from "@cloudscape-design/board-components/board-item";
import EnhancedTable from '@/components/common/EnhancedTable';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { useSurveyCatalog } from '@/hooks/useSurveyCatalog';
import {
  SurveyCatalog,
  SurveyCatalogInput,
  QuestionItem,
  QuestionItemInput,
  QuestionType,
  DeployOption,
  DeployTiming,
  DeploySurveyInput
} from '@/models/surveyCatalog';

// 보드 아이템 데이터 타입
interface BoardItemData {
  id: string;
  questionType: string;
  content: string;
  required: boolean;
  tags?: string[];
}

// 보드 아이템 타입
type BoardItemType = BoardProps.Item<BoardItemData>;

/**
 * 문항 타입 매핑
 */
const typeMap: Record<string, string> = {
  [QuestionType.MULTIPLE_CHOICE]: '객관식',
  [QuestionType.RATING]: '평점',
  [QuestionType.OPEN_ENDED]: '주관식',
  [QuestionType.DROPDOWN]: '드롭다운',
  [QuestionType.MATRIX]: '행렬식'
};

/**
 * 설문조사 템플릿 관리 탭 컴포넌트
 * @description 설문조사 템플릿의 CRUD 및 문항 관리, 배포 등의 기능을 제공하는 UI 컴포넌트
 */
const SurveyCatalogTab: React.FC = () => {
  const { t } = useAppTranslation();
  const {
    surveyCatalogs,
    loading,
    error,
    refetch,
    selectSurveyCatalog,
    createSurveyCatalog,
    updateSurveyCatalog,
    deleteSurveyCatalog,
    addQuestionItems,
    removeQuestionItems,
    updateQuestionOrder,
    deploySurvey,
    isCreating,
    isUpdating,
    isDeleting,
    isAddingQuestions,
    isRemovingQuestions,
    isDeploying
  } = useSurveyCatalog();

  // 상태
  const [selectedSurveys, setSelectedSurveys] = useState<SurveyCatalog[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editSurvey, setEditSurvey] = useState<SurveyCatalog | null>(null);
  const [questionManagementVisible, setQuestionManagementVisible] = useState<boolean>(false);
  const [currentSurveyForQuestions, setCurrentSurveyForQuestions] = useState<SurveyCatalog | null>(null);
  const [availableQuestions, setAvailableQuestions] = useState<BoardItemData[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<BoardItemData[]>([]);
  const [boardItems, setBoardItems] = useState<BoardItemType[]>([]);
  const [deployModalVisible, setDeployModalVisible] = useState<boolean>(false);
  const [surveyToBeDeployed, setSurveyToBeDeployed] = useState<SurveyCatalog | null>(null);
  const [deployOption, setDeployOption] = useState<DeployOption>(DeployOption.AUTO);
  const [deployWhen, setDeployWhen] = useState<DeployTiming>(DeployTiming.AFTER_COURSE);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [formData, setFormData] = useState<SurveyCatalogInput>({
    title: '',
    description: '',
    category: '',
    tags: [],
    isActive: true
  });

  // 샘플 문항 데이터 로드 - 문항 관리 모달용
  useEffect(() => {
    if (currentSurveyForQuestions) {
      const sampleAvailableQuestions: BoardItemData[] = [
        {
          id: '1',
          content: '강의 내용은 얼마나 유익했습니까?',
          questionType: QuestionType.RATING,
          required: true,
          tags: ['강의평가', '교육품질']
        },
        {
          id: '2',
          content: '향후 개선되었으면 하는 점을 자유롭게 작성해주세요.',
          questionType: QuestionType.OPEN_ENDED,
          required: false,
          tags: ['피드백', '개선사항']
        },
        {
          id: '3',
          content: '강사의 전문성에 대해 어떻게 평가하십니까?',
          questionType: QuestionType.MULTIPLE_CHOICE,
          required: true,
          tags: ['강사평가', '전문성']
        },
        {
          id: '4',
          content: '실습 환경은 학습에 적합했습니까?',
          questionType: QuestionType.RATING,
          required: true,
          tags: ['실습환경', '교육시설']
        },
        {
          id: '5',
          content: '교육 기간은 적절했습니까?',
          questionType: QuestionType.MULTIPLE_CHOICE,
          required: false,
          tags: ['교육구성', '일정']
        }
      ];

      // 현재 설문조사에 이미 포함된 문항들은 제외
      const currentQuestionIds = currentSurveyForQuestions.questionItems.map(q => q.id);
      const filteredQuestions = sampleAvailableQuestions.filter(
        question => !currentQuestionIds.includes(question.id)
      );

      setAvailableQuestions(filteredQuestions);

      // 현재 설문조사에 포함된 문항들을 보드 아이템으로 변환
      const selectedQuestionsData = currentSurveyForQuestions.questionItems.map(q => ({
        id: q.id,
        content: q.content,
        questionType: q.type,
        required: q.required
      }));

      // 보드 아이템 생성
      const boardItemsData = selectedQuestionsData.map((question) => ({
        id: question.id,
        rowSpan: 1,
        columnSpan: 2,
        data: question
      }));

      setBoardItems(boardItemsData);
    }
  }, [currentSurveyForQuestions]);

  // 액션 핸들러
  const handleCreateSurvey = () => {
    setEditSurvey(null);
    resetForm();
    setModalVisible(true);
  };

  const handleEditSurvey = (survey: SurveyCatalog) => {
    setEditSurvey(survey);
    setFormData({
      title: survey.title,
      description: survey.description || '',
      category: survey.category,
      tags: survey.tags,
      isActive: survey.isActive,
      courseId: survey.courseId,
      courseName: survey.courseName
    });
    setModalVisible(true);
  };

  const handleDeploySurvey = (survey: SurveyCatalog) => {
    setSurveyToBeDeployed(survey);
    setDeployModalVisible(true);
  };

  const handleExecuteDeploy = async () => {
    if (!surveyToBeDeployed) return;

    try {
      // 배포 입력 데이터 생성
      const deployInput: DeploySurveyInput = {
        surveyCatalogId: surveyToBeDeployed.surveyCatalogId,
        deployOption: deployOption,
        deployWhen: deployOption === DeployOption.AUTO ? deployWhen : undefined,
        startDate,
        endDate,
        notifyParticipants: true,
        sendReminders: false,
        sendReportToAdmin: true
      };

      // 배포 API 호출
      await deploySurvey(deployInput);

      // 배포 후 모달 닫기
      setDeployModalVisible(false);
      setSurveyToBeDeployed(null);

      // 성공 메시지 표시 (실제 UI에서는 Toast나 알림으로 대체할 수 있음)
      alert('설문조사가 성공적으로 배포되었습니다.');
    } catch (error) {
      console.error('설문조사 배포 오류:', error);
      alert('설문조사 배포에 실패했습니다.');
    }
  };

  const handleManageQuestions = (survey: SurveyCatalog) => {
    setCurrentSurveyForQuestions(survey);
    setQuestionManagementVisible(true);
  };

  const handleDeleteSurvey = async (surveyCatalogId: string) => {
    try {
      await deleteSurveyCatalog(surveyCatalogId);
    } catch (error) {
      console.error('설문조사 삭제 오류:', error);
      alert('설문조사 삭제에 실패했습니다.');
    }
  };

  const handleBatchDelete = async () => {
    try {
      for (const survey of selectedSurveys) {
        await deleteSurveyCatalog(survey.surveyCatalogId);
      }
      setSelectedSurveys([]);
    } catch (error) {
      console.error('설문조사 일괄 삭제 오류:', error);
      alert('일부 설문조사 삭제에 실패했습니다.');
    }
  };

  const handleModalSubmit = async () => {
    try {
      if (editSurvey) {
        // 기존 설문조사 수정
        await updateSurveyCatalog({
          surveyCatalogId: editSurvey.surveyCatalogId,
          ...formData
        });
      } else {
        // 신규 설문조사 추가
        await createSurveyCatalog(formData);
      }
      setModalVisible(false);
      resetForm();
    } catch (error) {
      console.error('설문조사 저장 오류:', error);
      alert('설문조사 저장에 실패했습니다.');
    }
  };

  const handleQuestionManagementSave = async () => {
    if (!currentSurveyForQuestions) return;

    try {
      // 보드 아이템에서 문항 정보 추출하고 타입 변환
      const questionItems: QuestionItemInput[] = boardItems.map((item, index) => ({
        id: item.id,
        // 열거형으로 명시적 타입 변환
        type: item.data.questionType as QuestionType,
        content: item.data.content,
        required: item.data.required,
        order: index
      }));

      // 기존 문항 모두 제거 (API에서 지원하는 경우)
      const existingQuestionIds = currentSurveyForQuestions.questionItems.map(q => q.id);
      if (existingQuestionIds.length > 0) {
        await removeQuestionItems(currentSurveyForQuestions.surveyCatalogId, existingQuestionIds);
      }

      // 새 문항 추가
      if (questionItems.length > 0) {
        await addQuestionItems(currentSurveyForQuestions.surveyCatalogId, questionItems);
      }

      // 모달 닫기
      setQuestionManagementVisible(false);
      setCurrentSurveyForQuestions(null);
      setBoardItems([]);
    } catch (error) {
      console.error('문항 관리 저장 오류:', error);
      alert('문항 저장에 실패했습니다.');
    }
  };

  const handleAddSelectedQuestions = () => {
    if (selectedQuestions.length === 0) return;

    // 새로운 보드 아이템 생성
    const newBoardItems: BoardItemType[] = selectedQuestions.map(question => ({
      id: question.id,
      rowSpan: 1,
      columnSpan: 2,
      data: question
    }));

    // 중복 문항 제거하면서 보드 아이템 추가
    const updatedBoardItems: BoardItemType[] = [
      ...boardItems.filter(item =>
        !newBoardItems.some(newItem => newItem.id === item.id)
      ),
      ...newBoardItems
    ];

    setBoardItems(updatedBoardItems);
    setSelectedQuestions([]);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      tags: [],
      isActive: true
    });
  };

  // 샘플 과정 목록
  const courseOptions = [
    { value: 'course-1', label: 'AWS 기초 과정' },
    { value: 'course-2', label: 'AWS 고급 과정' },
    { value: 'course-3', label: 'AWS DevOps 전문가 과정' },
    { value: 'course-4', label: 'AWS 보안 전문가 과정' },
    { value: 'course-5', label: '클라우드 아키텍처 설계' }
  ];

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
      id: 'courseName',
      header: t('admin:surveyCatalog.columns.course', '연결된 과정'),
      cell: (item: SurveyCatalog) => item.courseName || '-',
      sortingField: 'courseName',
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
            onClick={() => handleManageQuestions(item)}
          >
            {t('admin:surveyCatalog.actions.manageQuestions', '문항 관리')}
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
      key: 'courseName',
      label: t('admin:surveyCatalog.columns.course', '연결된 과정')
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
              <Button
                variant="primary"
                onClick={handleModalSubmit}
                loading={isCreating || isUpdating}
                disabled={!formData.title || !formData.category}
              >
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
              value={formData.title}
              onChange={({ detail }) => setFormData(prev => ({ ...prev, title: detail.value }))}
            />
          </FormField>

          <FormField
            label={t('admin:surveyCatalog.form.description', '설명')}
            description={t('admin:surveyCatalog.form.descriptionDesc', '설문조사의 목적이나 내용에 대한 설명')}
          >
            <Textarea
              value={formData.description || ''}
              onChange={({ detail }) => setFormData(prev => ({ ...prev, description: detail.value }))}
            />
          </FormField>

          <FormField
            label={t('admin:surveyCatalog.form.course', '연결된 과정')}
            description={t('admin:surveyCatalog.form.courseDesc', '이 설문조사가 연결될 교육 과정')}
          >
            <Select
              selectedOption={
                formData.courseId
                  ? { value: formData.courseId, label: formData.courseName || formData.courseId }
                  : null
              }
              options={courseOptions}
              onChange={({ detail }) => {
                setFormData(prev => ({
                  ...prev,
                  courseId: detail.selectedOption?.value,
                  courseName: detail.selectedOption?.label
                }));
              }}
              placeholder="과정 선택(선택사항)"
            />
          </FormField>

          <FormField
            label={t('admin:surveyCatalog.form.category', '카테고리')}
          >
            <Input
              value={formData.category}
              onChange={({ detail }) => setFormData(prev => ({ ...prev, category: detail.value }))}
            />
          </FormField>

          <FormField
            label={t('admin:surveyCatalog.form.tags', '태그')}
            description={t('admin:surveyCatalog.form.tagsDesc', '설문조사를 분류하는 태그를 추가하세요')}
          >
            <TagEditor
              tags={(formData.tags || []).map(tag => ({
                key: tag,
                value: tag,
                existing: true,
                markedForRemoval: false
              }))}
              onChange={({ detail }) => {
                setFormData(prev => ({
                  ...prev,
                  tags: detail.tags
                    .filter(tag => !tag.markedForRemoval)
                    .map(tag => tag.value)
                    .filter((value): value is string => value !== undefined)
                }));
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
              checked={formData.isActive}
              onChange={({ detail }) => setFormData(prev => ({ ...prev, isActive: detail.checked }))}
            >
              {formData.isActive ?
                t('admin:surveyCatalog.status.active', '활성화') :
                t('admin:surveyCatalog.status.inactive', '비활성화')}
            </Toggle>
          </FormField>
        </SpaceBetween>
      </Modal>
    );
  };

  // 문항 관리 모달 (드래그 앤 드롭으로 문항 구성)
  const renderQuestionManagementModal = () => {
    return (
      <Modal
        visible={questionManagementVisible}
        onDismiss={() => setQuestionManagementVisible(false)}
        header={
          <Header variant="h2" description={currentSurveyForQuestions?.title}>
            {t('admin:surveyCatalog.questionModal.title', '설문 문항 관리')}
          </Header>
        }
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setQuestionManagementVisible(false)}>
                {t('common:cancel', '취소')}
              </Button>
              <Button
                variant="primary"
                onClick={handleQuestionManagementSave}
                loading={isAddingQuestions || isRemovingQuestions}
              >
                {t('common:save', '저장')}
              </Button>
            </SpaceBetween>
          </Box>
        }
        size="large"
      >
        <SpaceBetween size="l">
          <ColumnLayout columns={2}>
            {/* 문항 은행 (왼쪽 패널) */}
            <SpaceBetween size="m">
              <Header variant="h3">
                {t('admin:surveyCatalog.questionModal.availableQuestions', '사용 가능한 문항')}
              </Header>
              <EnhancedTable
                title=""
                columnDefinitions={[
                  {
                    id: 'content',
                    header: t('admin:surveyQuestionBank.columns.content', '질문 내용'),
                    cell: (item: BoardItemData) => item.content,
                    sortingField: 'content',
                  },
                  {
                    id: 'questionType',
                    header: t('admin:surveyQuestionBank.columns.questionType', '유형'),
                    cell: (item: BoardItemData) => typeMap[item.questionType] || item.questionType,
                  },
                  {
                    id: 'required',
                    header: t('admin:surveyQuestionBank.columns.required', '필수 여부'),
                    cell: (item: BoardItemData) => item.required ? '필수' : '선택',
                  }
                ]}
                items={availableQuestions}
                selectionType="multi"
                selectedItems={selectedQuestions}
                onSelectionChange={setSelectedQuestions}
                loadingText={t('common:loading', '로딩 중...')}
                empty={t('admin:surveyCatalog.questionModal.emptyAvailableQuestions', '사용 가능한 문항이 없습니다')}
                actions={{
                  primary: {
                    text: t('admin:surveyCatalog.questionModal.addSelected', '선택 추가'),
                    onClick: handleAddSelectedQuestions,
                    disabled: selectedQuestions.length === 0
                  }
                }}
                trackBy="id"
                resizableColumns={true}
                variant="container"
              />
            </SpaceBetween>

            {/* 선택된 문항 (오른쪽 패널) - 드래그 앤 드롭으로 순서 조정 가능 */}
            <SpaceBetween size="m">
              <Box>
                <Header variant="h3">
                  {t('admin:surveyCatalog.questionModal.selectedQuestions', '선택된 문항')}
                </Header>
                <div style={{ marginTop: '8px' }}>
                  {t('admin:surveyCatalog.questionModal.dragHint', '문항을 드래그하여 순서를 조정하세요')}
                </div>
              </Box>

              <Board<BoardItemData>
                renderItem={(item) => (
                  <BoardItem
                    header={
                      <Header actions={
                        <Button
                          iconName="remove"
                          variant="icon"
                          onClick={() => {
                            setBoardItems(boardItems.filter(i => i.id !== item.id));
                          }}
                        />
                      }>
                        {item.data.content.length > 50 ? item.data.content.substring(0, 50) + '...' : item.data.content}
                      </Header>
                    }
                    i18nStrings={{
                      dragHandleAriaLabel: "드래그 핸들",
                      dragHandleAriaDescription:
                        "Space 또는 Enter 키를 눌러 드래그 모드를 활성화하고, 방향키로 이동, 다시 Space 또는 Enter 키를 눌러 확정하거나 Escape 키를 눌러 취소합니다.",
                      resizeHandleAriaLabel: "크기 조절 핸들",
                      resizeHandleAriaDescription:
                        "Space 또는 Enter 키를 눌러 크기 조절 모드를 활성화하고, 방향키로 크기 조절, 다시 Space 또는 Enter 키를 눌러 확정하거나 Escape 키를 눌러 취소합니다."
                    }}
                  >
                    <SpaceBetween size="s">
                      <div>유형: {typeMap[item.data.questionType] || item.data.questionType}</div>
                      <div>
                        <Toggle
                          checked={item.data.required}
                          onChange={({ detail }) => {
                            const updatedItems = boardItems.map(i => {
                              if (i.id === item.id) {
                                return {
                                  ...i,
                                  data: {
                                    ...i.data,
                                    required: detail.checked
                                  }
                                };
                              }
                              return i;
                            });
                            setBoardItems(updatedItems);
                          }}
                        >
                          {item.data.required ? '필수 질문' : '선택 질문'}
                        </Toggle>
                      </div>
                    </SpaceBetween>
                  </BoardItem>
                )}
                onItemsChange={(event) => {
                  const newItems = [...event.detail.items] as BoardItemType[];
                  setBoardItems(newItems);
                }}
                items={boardItems}
                empty={
                  <Box textAlign="center" color="inherit" padding="l">
                    <b>문항이 없습니다</b>
                    <Box padding={{ bottom: "s" }} variant="p" color="inherit">
                      왼쪽에서 문항을 선택하여 추가하세요
                    </Box>
                  </Box>
                }
                i18nStrings={{
                  liveAnnouncementDndStarted: (operationType) =>
                    operationType === "resize" ? "크기 조절 시작" : "드래그 시작",
                  liveAnnouncementDndItemReordered: () => "아이템 위치 이동됨",
                  liveAnnouncementDndItemResized: () => "아이템 크기 조절됨",
                  liveAnnouncementDndItemInserted: () => "아이템 삽입됨",
                  liveAnnouncementDndCommitted: (operationType) =>
                    operationType === "resize" ? "크기 조절 완료" : "드래그 완료",
                  liveAnnouncementDndDiscarded: (operationType) =>
                    operationType === "resize" ? "크기 조절 취소됨" : "드래그 취소됨",
                  liveAnnouncementItemRemoved: () => "아이템 제거됨",
                  navigationAriaLabel: "보드 네비게이션",
                  navigationAriaDescription: "빈 공간이 아닌 곳을 클릭하여 포커스를 이동할 수 있습니다",
                  navigationItemAriaLabel: (item) => item ? item.data.content : "빈 영역"
                }}
              />

              <Box>
                <SpaceBetween direction="horizontal" size="xs">
                  <div>{t('admin:surveyCatalog.questionModal.totalCount', '총 문항 수')}: {boardItems.length}개</div>
                  <div>필수 문항: {boardItems.filter(item => item.data.required).length}개</div>
                </SpaceBetween>
              </Box>
            </SpaceBetween>
          </ColumnLayout>
        </SpaceBetween>
      </Modal>
    );
  };

  // 설문조사 배포 모달
  const renderDeployModal = () => {
    return (
      <Modal
        visible={deployModalVisible}
        onDismiss={() => setDeployModalVisible(false)}
        header={
          <Header variant="h2">
            {t('admin:surveyCatalog.deployModal.title', '설문조사 배포')} - {surveyToBeDeployed?.title}
          </Header>
        }
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setDeployModalVisible(false)}>
                {t('common:cancel', '취소')}
              </Button>
              <Button
                variant="primary"
                onClick={handleExecuteDeploy}
                loading={isDeploying}
                disabled={!startDate || !endDate}
              >
                {t('admin:surveyCatalog.deployModal.deploy', '배포하기')}
              </Button>
            </SpaceBetween>
          </Box>
        }
        size="large"
      >
        <SpaceBetween size="l">
          <FormField
            label={t('admin:surveyCatalog.deployModal.deployOption', '배포 방식')}
            description={t('admin:surveyCatalog.deployModal.deployOptionDesc', '설문조사를 어떻게 배포할지 선택하세요')}
          >
            <SpaceBetween direction="vertical" size="xs">
              <Toggle
                checked={deployOption === DeployOption.AUTO}
                onChange={({ detail }) => setDeployOption(detail.checked ? DeployOption.AUTO : DeployOption.MANUAL)}
              >
                자동 배포: 교육 과정 수강생에게 자동으로 설문조사 요청
              </Toggle>

              {deployOption === DeployOption.AUTO && (
                <FormField
                  label={t('admin:surveyCatalog.deployModal.deployWhen', '배포 시점')}
                  description={t('admin:surveyCatalog.deployModal.deployWhenDesc', '설문조사를 언제 배포할지 선택하세요')}
                >
                  <Select
                    selectedOption={{
                      value: deployWhen,
                      label: deployWhen === DeployTiming.BEFORE_COURSE ? '교육 시작 전' : '교육 종료 후'
                    }}
                    options={[
                      { value: DeployTiming.BEFORE_COURSE, label: '교육 시작 전' },
                      { value: DeployTiming.AFTER_COURSE, label: '교육 종료 후' }
                    ]}
                    onChange={({ detail }) => {
                      if (detail.selectedOption?.value === DeployTiming.BEFORE_COURSE ||
                        detail.selectedOption?.value === DeployTiming.AFTER_COURSE) {
                        setDeployWhen(detail.selectedOption.value);
                      }
                    }}
                  />
                </FormField>
              )}
            </SpaceBetween>
          </FormField>

          {deployOption === DeployOption.MANUAL && (
            <Alert type="info">
              {t('admin:surveyCatalog.deployModal.manualInfo',
                '수동 배포를 선택하셨습니다. 배포 후 생성된 설문조사 링크를 복사하여 참여자들에게 전달할 수 있습니다.')}
            </Alert>
          )}

          <FormField
            label={t('admin:surveyCatalog.deployModal.expires', '응답 가능 기간')}
            description={t('admin:surveyCatalog.deployModal.expiresDesc', '설문조사 응답을 받을 수 있는 기간을 설정하세요')}
          >
            <ColumnLayout columns={2}>
              <DatePicker
                value={startDate}
                onChange={({ detail }) => setStartDate(detail.value || "")}
                placeholder="시작일"
              />
              <DatePicker
                value={endDate}
                onChange={({ detail }) => setEndDate(detail.value || "")}
                placeholder="종료일"
              />
            </ColumnLayout>
          </FormField>

          <FormField
            label={t('admin:surveyCatalog.deployModal.notifyOptions', '알림 설정')}
          >
            <SpaceBetween direction="vertical" size="xs">
              <Toggle checked={true}>
                참여자에게 이메일로 알림 발송
              </Toggle>
              <Toggle checked={false}>
                응답하지 않은 참여자에게 리마인더 발송
              </Toggle>
              <Toggle checked={true}>
                관리자에게 설문조사 결과 요약 보고서 발송
              </Toggle>
            </SpaceBetween>
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
          items={surveyCatalogs}
          loading={loading}
          loadingText={t('common:loading', '로딩 중...')}
          selectionType="multi"
          selectedItems={selectedSurveys}
          onSelectionChange={setSelectedSurveys}
          onRefresh={refetch}
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
        {renderQuestionManagementModal()}
        {renderDeployModal()}
      </SpaceBetween>
    </Box>
  );
};

export default SurveyCatalogTab;