// src/components/survey/SurveyCatalogTab.tsx
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
  Toggle,
  Select,
  Alert,
  DatePicker
} from '@cloudscape-design/components';
import Board, { BoardProps } from "@cloudscape-design/board-components/board";
import BoardItem from "@cloudscape-design/board-components/board-item";
import EnhancedTable from '@/components/common/EnhancedTable';
import { useAppTranslation } from '@/hooks/useAppTranslation';

interface SurveyCatalog {
  surveyCatalogId: string;
  title: string;
  description: string;
  questionItems: QuestionItem[];
  category: string;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  courseId?: string;
  courseName?: string;
}

// 설문 문항 아이템 타입
interface QuestionItem {
  id: string;
  type: string;
  content: string;
  required: boolean;
}

// 설문 문항 타입
interface SurveyQuestion {
  questionId: string;  // 명시적으로 속성 정의
  content: string;
  questionType: string;  // 명시적으로 속성 정의
  required: boolean;
  tags: string[];
}

// 배포 옵션 타입
type DeployOption = 'manual' | 'auto';
type DeployWhen = 'before' | 'after';

// 보드 아이템 데이터 타입
type BoardItemData = SurveyQuestion;

// 보드 아이템 타입
type BoardItem = BoardProps.Item<BoardItemData>;

// 문항 타입 매핑 정의
const typeMap: Record<string, string> = {
  multipleChoice: '객관식',
  rating: '평점', 
  openEnded: '주관식',
  dropdown: '드롭다운',
  matrix: '행렬식'
};

// 난이도 매핑 정의
const difficultyMap: Record<string, string> = {
  easy: '쉬움',
  medium: '보통',
  hard: '어려움'
};

const SurveyCatalogTab: React.FC = () => {
  const { t } = useAppTranslation();
  const [surveys, setSurveys] = useState<SurveyCatalog[]>([]);
  const [selectedSurveys, setSelectedSurveys] = useState<SurveyCatalog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editSurvey, setEditSurvey] = useState<SurveyCatalog | null>(null);
  const [questionManagementVisible, setQuestionManagementVisible] = useState<boolean>(false);
  const [currentSurveyForQuestions, setCurrentSurveyForQuestions] = useState<SurveyCatalog | null>(null);
  const [availableQuestions, setAvailableQuestions] = useState<SurveyQuestion[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<SurveyQuestion[]>([]);
  const [boardItems, setBoardItems] = useState<BoardItem[]>([]);
  const [deployModalVisible, setDeployModalVisible] = useState<boolean>(false);
  const [surveyToBeDeployed, setSurveyToBeDeployed] = useState<SurveyCatalog | null>(null);
  const [deployOption, setDeployOption] = useState<DeployOption>('auto');
  const [deployWhen, setDeployWhen] = useState<DeployWhen>('after');

  // 샘플 데이터 로드
  useEffect(() => {
    // API 호출 또는 데이터 로드 로직
    const sampleSurveys: SurveyCatalog[] = [
      {
        surveyCatalogId: '1',
        title: '교육 만족도 조사',
        description: '교육 프로그램에 대한 전반적인 만족도 평가 설문',
        questionItems: [
          { id: '1', type: 'rating', content: '강의 내용은 얼마나 유익했습니까?', required: true },
          { id: '2', type: 'openEnded', content: '향후 개선되었으면 하는 점을 자유롭게 작성해주세요.', required: false }
        ],
        category: '교육평가',
        tags: ['교육품질', '만족도'],
        isActive: true,
        createdAt: '2023-09-01',
        updatedAt: '2023-09-01',
        createdBy: 'admin',
        courseId: 'course-1',
        courseName: 'AWS 기초 과정'
      },
      {
        surveyCatalogId: '2',
        title: '강사 평가',
        description: '강사의 교육 역량 및 커뮤니케이션 평가',
        questionItems: [
          { id: '3', type: 'rating', content: '강사의 교육 방식은 이해하기 쉬웠습니까?', required: true },
          { id: '4', type: 'multipleChoice', content: '강사의 교육 자료는 충분했습니까?', required: true }
        ],
        category: '강사평가',
        tags: ['강사역량', '교육방법'],
        isActive: true,
        createdAt: '2023-09-05',
        updatedAt: '2023-09-05',
        createdBy: 'admin',
        courseId: 'course-2',
        courseName: 'AWS 고급 과정'
      }
    ];
    setSurveys(sampleSurveys);
    setLoading(false);
  }, []);

  // 샘플 문항 데이터 로드 - 문항 관리 모달용
  useEffect(() => {
    if (currentSurveyForQuestions) {
      const sampleAvailableQuestions: SurveyQuestion[] = [
        {
          questionId: '1',
          content: '강의 내용은 얼마나 유익했습니까?',
          questionType: 'rating',
          required: true,
          tags: ['강의평가', '교육품질']
        },
        {
          questionId: '2',
          content: '향후 개선되었으면 하는 점을 자유롭게 작성해주세요.',
          questionType: 'openEnded',
          required: false,
          tags: ['피드백', '개선사항']
        },
        {
          questionId: '3',
          content: '강사의 전문성에 대해 어떻게 평가하십니까?',
          questionType: 'multipleChoice',
          required: true,
          tags: ['강사평가', '전문성']
        },
        {
          questionId: '5',
          content: '실습 환경은 학습에 적합했습니까?',
          questionType: 'rating',
          required: true,
          tags: ['실습환경', '교육시설']
        },
        {
          questionId: '6',
          content: '교육 기간은 적절했습니까?',
          questionType: 'multipleChoice',
          required: false,
          tags: ['교육구성', '일정']
        }
      ];
      
      // 현재 설문조사에 이미 포함된 문항들은 제외
      const filteredQuestions = sampleAvailableQuestions.filter(question => 
        !currentSurveyForQuestions.questionItems.some(item => item.id === question.questionId)
      );
      
      setAvailableQuestions(filteredQuestions);
      
      // 현재 설문조사에 포함된 문항들을 보드 아이템으로 변환
      const currentQuestionIds = currentSurveyForQuestions.questionItems.map(q => q.id);
      const selectedQuestionsData = sampleAvailableQuestions.filter(q => 
        currentQuestionIds.includes(q.questionId)
      );
      
      // 보드 아이템 생성
      const boardItemsData = selectedQuestionsData.map((question) => ({
        id: question.questionId,
        rowSpan: 1,
        columnSpan: 2,
        data: question
      }));
      
      setBoardItems(boardItemsData);
    }
  }, [currentSurveyForQuestions]);

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
    // 설문조사 배포 모달 표시
    setSurveyToBeDeployed(survey);
    setDeployModalVisible(true);
  };
  
  const handleExecuteDeploy = () => {
    // 설문조사 배포 실행 로직
    console.log('설문조사 배포:', surveyToBeDeployed, '배포 옵션:', deployOption, '배포 시점:', deployWhen);
    
    // 여기서 실제 배포 API 호출
    
    // 배포 후 모달 닫기
    setDeployModalVisible(false);
    setSurveyToBeDeployed(null);
    
    // 성공 메시지 표시
    alert('설문조사가 성공적으로 배포되었습니다.');
  };

  const handleManageQuestions = (survey: SurveyCatalog) => {
    // 설문조사 문항 관리 모달 열기
    setCurrentSurveyForQuestions(survey);
    setQuestionManagementVisible(true);
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
  
  const handleQuestionManagementSave = () => {
    // 현재 보드 아이템을 기반으로 설문조사 문항 저장
    if (currentSurveyForQuestions) {
      // 보드 아이템에서 문항 ID와 필수 여부 추출
      const questionItems = boardItems.map(item => ({
        id: item.id,
        type: item.data.questionType,
        content: item.data.content,
        required: item.data.required
      }));
      
      // 설문조사 업데이트
      const updatedSurvey = {
        ...currentSurveyForQuestions,
        questionItems,
        updatedAt: new Date().toISOString().split('T')[0]
      };
      
      // 설문조사 목록 업데이트
      setSurveys(surveys.map(s => 
        s.surveyCatalogId === currentSurveyForQuestions.surveyCatalogId ? updatedSurvey : s
      ));
      
      // 모달 닫기
      setQuestionManagementVisible(false);
      setCurrentSurveyForQuestions(null);
      setBoardItems([]);
    }
  };

  const handleAddSelectedQuestions = () => {
    if (selectedQuestions.length > 0) {
      // 새로운 보드 아이템 생성
      const newBoardItems: BoardItem[] = selectedQuestions.map(question => ({
        id: question.questionId,
        rowSpan: 1,
        columnSpan: 2,
        data: question
      }));
      
      // 중복 문항 제거하면서 보드 아이템 추가
      const updatedBoardItems: BoardItem[] = [
        ...boardItems.filter(item => 
          !newBoardItems.some(newItem => newItem.id === item.id)
        ),
        ...newBoardItems
      ];
      
      setBoardItems(updatedBoardItems);
      setSelectedQuestions([]);
    }
  };

  // 샘플 과정 목록
  const courseOptions = [
    { value: 'course-1', label: 'AWS 기초 과정' },
    { value: 'course-2', label: 'AWS 고급 과정' },
    { value: 'course-3', label: 'AWS DevOps 전문가 과정' },
    { value: 'course-4', label: 'AWS 보안 전문가 과정' },
    { value: 'course-5', label: '클라우드 아키텍처 설계' }
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
            label={t('admin:surveyCatalog.form.course', '연결된 과정')}
            description={t('admin:surveyCatalog.form.courseDesc', '이 설문조사가 연결될 교육 과정')}
          >
            <Select
              selectedOption={
                editSurvey?.courseId 
                  ? { value: editSurvey.courseId, label: editSurvey.courseName || editSurvey.courseId } 
                  : null
              }
              options={courseOptions}
              onChange={({ detail }) => {
                if (editSurvey) {
                  setEditSurvey({ 
                    ...editSurvey, 
                    courseId: detail.selectedOption?.value,
                    courseName: detail.selectedOption?.label
                  });
                }
              }}
              placeholder="과정 선택(선택사항)"
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
              tags={(editSurvey?.tags || []).map(tag => ({ 
                key: tag, 
                value: tag,
                existing: true,
                markedForRemoval: false
              }))}
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
  
  // 문항 관리 모달 (드래그 앤 드롭으로 문항 구성)
  const renderQuestionManagementModal = () => {
    // EnhancedTable에 전달할 테이블 헤더
    const tableHeader = (
      <SpaceBetween
        direction="horizontal" 
        size="xs" 
        alignItems="center"
      >
        <span>총 {availableQuestions.length}개의 문항</span>
        <Button 
          iconName="add-plus" 
          disabled={selectedQuestions.length === 0}
          onClick={handleAddSelectedQuestions}
        >
          {t('admin:surveyCatalog.questionModal.addSelected', '선택 추가')}
        </Button>
      </SpaceBetween>
    );

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
              <Button variant="primary" onClick={handleQuestionManagementSave}>
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
                title="" // 제목은 비워두고 상단에 별도 헤더 사용
                columnDefinitions={[
                  {
                    id: 'content',
                    header: t('admin:surveyQuestionBank.columns.content', '질문 내용'),
                    cell: (item: SurveyQuestion) => item.content,
                    sortingField: 'content',
                  },
                  {
                    id: 'questionType',
                    header: t('admin:surveyQuestionBank.columns.questionType', '유형'),
                    cell: (item: SurveyQuestion) => {
                      // 안전하게 타입 가드 추가
                      return typeMap[item.questionType] || item.questionType;
                    },
                  },
                  {
                    id: 'required',
                    header: t('admin:surveyQuestionBank.columns.required', '필수 여부'),
                    cell: (item: SurveyQuestion) => item.required ? '필수' : '선택',
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
                    onClick: handleAddSelectedQuestions
                  }
                }}
                trackBy="questionId"
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
                            // 아이템 제거
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
                      <div>유형: {
                        // 안전하게 타입 체크
                        typeMap[item.data.questionType] || item.data.questionType
                      }</div>
                      <div>
                        <Toggle
                          checked={item.data.required}
                          onChange={({ detail }) => {
                            // 필수 여부 업데이트
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
                  // 새 배열로 복사하여 타입 오류 해결
                  const newItems = [...event.detail.items] as BoardItem[];
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
              <Button variant="primary" onClick={handleExecuteDeploy}>
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
                checked={deployOption === 'auto'}
                onChange={({ detail }) => setDeployOption(detail.checked ? 'auto' : 'manual')}
              >
                자동 배포: 교육 과정 수강생에게 자동으로 설문조사 요청
              </Toggle>
              
              {deployOption === 'auto' && (
                <FormField
                  label={t('admin:surveyCatalog.deployModal.deployWhen', '배포 시점')}
                  description={t('admin:surveyCatalog.deployModal.deployWhenDesc', '설문조사를 언제 배포할지 선택하세요')}
                >
                  <Select
                    selectedOption={{
                      value: deployWhen,
                      label: deployWhen === 'before' ? '교육 시작 전' : '교육 종료 후'
                    }}
                    options={[
                      { value: 'before', label: '교육 시작 전' },
                      { value: 'after', label: '교육 종료 후' }
                    ]}
                    onChange={({ detail }) => {
                      if (detail.selectedOption?.value === 'before' || detail.selectedOption?.value === 'after') {
                        setDeployWhen(detail.selectedOption.value);
                      }
                    }}
                  />
                </FormField>
              )}
            </SpaceBetween>
          </FormField>
          
          {deployOption === 'manual' && (
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
                value="2023-12-01"
                onChange={({ detail }) => console.log(detail.value)}
                placeholder="시작일"
              />
              <DatePicker
                value="2023-12-15"
                onChange={({ detail }) => console.log(detail.value)}
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
          items={surveys}
          loading={loading}
          loadingText={t('common:loading', '로딩 중...')}
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
        {renderQuestionManagementModal()}
        {renderDeployModal()}
      </SpaceBetween>
    </Box>
  );
};

export default SurveyCatalogTab;