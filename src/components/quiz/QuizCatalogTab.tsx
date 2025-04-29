// src/components/quiz/QuizCatalogTab.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Header,
  Modal,
  SpaceBetween,
  FormField,
  Input,
  Select,
  Textarea,
  Toggle,
  ColumnLayout,
  Table
} from '@cloudscape-design/components';
import Board, { BoardProps } from "@cloudscape-design/board-components/board";
import BoardItem from "@cloudscape-design/board-components/board-item";
import EnhancedTable from '@/components/common/EnhancedTable';
import { useAppTranslation } from '@/hooks/useAppTranslation';

// 임시 타입 및 샘플 데이터
interface QuizCatalog {
  quizCatalogId: string;
  title: string;
  description: string;
  questionItems: QuestionItem[];
  totalPoints: number;
  defaultTimeLimit: number;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  courseId?: string;
  courseName?: string;
}

// 퀴즈 아이템 타입 (questionItems 배열의 요소)
interface QuestionItem {
  questionId: string;
  points: number;
}

// 퀴즈 문제 타입
interface Question {
  questionId: string;
  content: string;
  questionType: 'multipleChoice' | 'trueFalse' | 'essay' | 'matching' | 'coding' | string;
  points: number;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard' | string;
}

// 보드 아이템 데이터 타입
type BoardItemData = Question;

// 보드 아이템 타입 (Board 컴포넌트의 요구사항에 맞춤)
type BoardItem = BoardProps.Item<BoardItemData>;

const QuizCatalogTab: React.FC = () => {
  const { t } = useAppTranslation();
  const [quizzes, setQuizzes] = useState<QuizCatalog[]>([]);
  const [selectedQuizzes, setSelectedQuizzes] = useState<QuizCatalog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editQuiz, setEditQuiz] = useState<QuizCatalog | null>(null);
  const [questionManagementVisible, setQuestionManagementVisible] = useState<boolean>(false);
  const [currentQuizForQuestions, setCurrentQuizForQuestions] = useState<QuizCatalog | null>(null);
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [boardItems, setBoardItems] = useState<BoardItem[]>([]);

  // 샘플 데이터 로드
  useEffect(() => {
    // API 호출 또는 데이터 로드 로직
    const sampleQuizzes: QuizCatalog[] = [
      {
        quizCatalogId: '1',
        title: 'AWS 기초 지식 평가',
        description: 'AWS의 주요 서비스와 개념에 대한 이해를 평가하는 퀴즈',
        questionItems: [
          { questionId: '1', points: 10 },
          { questionId: '2', points: 10 }
        ],
        totalPoints: 20,
        defaultTimeLimit: 30,
        category: 'AWS',
        difficulty: 'beginner',
        tags: ['AWS', '클라우드 기초', 'Cloud Practitioner'],
        isActive: true,
        createdAt: '2023-09-01',
        updatedAt: '2023-09-01',
        createdBy: 'admin',
        courseId: 'aws-101',
        courseName: 'AWS 입문'
      },
      {
        quizCatalogId: '2',
        title: 'AWS 보안 심화 문제',
        description: 'AWS의 보안 서비스와 모범 사례에 대한 평가',
        questionItems: [
          { questionId: '3', points: 20 },
          { questionId: '4', points: 20 },
          { questionId: '5', points: 20 }
        ],
        totalPoints: 60,
        defaultTimeLimit: 60,
        category: 'AWS 보안',
        difficulty: 'advanced',
        tags: ['AWS', '보안', 'Security Specialty'],
        isActive: true,
        createdAt: '2023-09-10',
        updatedAt: '2023-09-10',
        createdBy: 'admin',
        courseId: 'aws-security',
        courseName: 'AWS 보안'
      }
    ];
    
    setQuizzes(sampleQuizzes);
    setLoading(false);
  }, []);

  // 샘플 문제 데이터 로드 - 문제 관리 모달용
  useEffect(() => {
    if (currentQuizForQuestions) {
      const sampleAvailableQuestions: Question[] = [
        {
          questionId: '1',
          content: 'AWS IAM의 주요 구성 요소가 아닌 것은?',
          questionType: 'multipleChoice',
          points: 10,
          tags: ['AWS', 'IAM', '보안'],
          difficulty: 'medium'
        },
        {
          questionId: '2',
          content: 'Amazon S3 스토리지 클래스 중 가장 비용 효율적인 장기 보관용 클래스는?',
          questionType: 'multipleChoice',
          points: 10,
          tags: ['AWS', 'S3', '스토리지'],
          difficulty: 'medium'
        },
        {
          questionId: '3',
          content: '클라우드 컴퓨팅의 주요 이점은 무엇인지 설명하시오.',
          questionType: 'essay',
          points: 20,
          tags: ['클라우드', '기초'],
          difficulty: 'medium'
        },
        {
          questionId: '4',
          content: 'AWS에서 서버리스 아키텍처를 구성하는 주요 서비스는?',
          questionType: 'multipleChoice',
          points: 15,
          tags: ['AWS', '서버리스'],
          difficulty: 'hard'
        },
        {
          questionId: '5',
          content: 'EC2 인스턴스 유형 중 메모리 최적화 인스턴스는?',
          questionType: 'multipleChoice',
          points: 10,
          tags: ['AWS', 'EC2'],
          difficulty: 'easy'
        }
      ];
      
      // 현재 퀴즈에 이미 포함된 문제들은 제외
      const filteredQuestions = sampleAvailableQuestions.filter(question => 
        !currentQuizForQuestions.questionItems.some(item => item.questionId === question.questionId)
      );
      
      setAvailableQuestions(filteredQuestions);
      
      // 현재 퀴즈에 포함된 문제들을 보드 아이템으로 변환
      const currentQuestionIds = currentQuizForQuestions.questionItems.map(q => q.questionId);
      const selectedQuestionsData = sampleAvailableQuestions.filter(q => 
        currentQuestionIds.includes(q.questionId)
      );
      
      // 보드 아이템 생성
      const boardItemsData = selectedQuestionsData.map((question) => ({
        id: question.questionId,
        columnSpan: 2,
        rowSpan: 1,
        data: question
      }));
      
      setBoardItems(boardItemsData);
    }
  }, [currentQuizForQuestions]);

  // 테이블 컬럼 정의
  const columnDefinitions = [
    {
      id: 'title',
      header: t('admin:quizCatalog.columns.title', '퀴즈 제목'),
      cell: (item: QuizCatalog) => item.title,
      sortingField: 'title',
      isRowHeader: true,
    },
    {
      id: 'courseName',
      header: t('admin:quizCatalog.columns.course', '연결된 과정'),
      cell: (item: QuizCatalog) => item.courseName || '-',
      sortingField: 'courseName',
    },
    {
      id: 'category',
      header: t('admin:quizCatalog.columns.category', '카테고리'),
      cell: (item: QuizCatalog) => item.category,
      sortingField: 'category',
    },
    {
      id: 'difficulty',
      header: t('admin:quizCatalog.columns.difficulty', '난이도'),
      cell: (item: QuizCatalog) => {
        const difficultyMap: Record<string, string> = {
          beginner: '초급',
          intermediate: '중급',
          advanced: '고급'
        };
        return difficultyMap[item.difficulty] || item.difficulty;
      },
      sortingField: 'difficulty',
    },
    {
      id: 'questionCount',
      header: t('admin:quizCatalog.columns.questionCount', '문제 수'),
      cell: (item: QuizCatalog) => item.questionItems.length,
      sortingField: 'questionCount',
    },
    {
      id: 'totalPoints',
      header: t('admin:quizCatalog.columns.totalPoints', '총 배점'),
      cell: (item: QuizCatalog) => item.totalPoints,
      sortingField: 'totalPoints',
    },
    {
      id: 'defaultTimeLimit',
      header: t('admin:quizCatalog.columns.timeLimit', '제한 시간(분)'),
      cell: (item: QuizCatalog) => item.defaultTimeLimit,
      sortingField: 'defaultTimeLimit',
    },
    {
      id: 'isActive',
      header: t('admin:quizCatalog.columns.status', '상태'),
      cell: (item: QuizCatalog) => item.isActive ? 
        t('admin:quizCatalog.status.active', '활성화') : 
        t('admin:quizCatalog.status.inactive', '비활성화'),
      sortingField: 'isActive',
    },
    {
      id: 'createdAt',
      header: t('admin:quizCatalog.columns.createdAt', '생성일'),
      cell: (item: QuizCatalog) => item.createdAt,
      sortingField: 'createdAt',
    },
    {
      id: 'actions',
      header: t('admin:quizCatalog.columns.actions', '작업'),
      cell: (item: QuizCatalog) => (
        <SpaceBetween direction="horizontal" size="xs">
          <Button 
            variant="link" 
            onClick={() => handleEditQuiz(item)}
          >
            {t('common:edit', '편집')}
          </Button>
          <Button 
            variant="link" 
            onClick={() => handleManageQuestions(item)}
          >
            {t('admin:quizCatalog.actions.manageQuestions', '문제 관리')}
          </Button>
          <Button 
            variant="link" 
            onClick={() => handlePreviewQuiz(item)}
          >
            {t('admin:quizCatalog.actions.preview', '미리보기')}
          </Button>
          <Button 
            variant="link" 
            onClick={() => handleDeleteQuiz(item.quizCatalogId)}
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
      label: t('admin:quizCatalog.columns.title', '퀴즈 제목')
    },
    {
      key: 'courseName',
      label: t('admin:quizCatalog.columns.course', '연결된 과정')
    },
    {
      key: 'category',
      label: t('admin:quizCatalog.columns.category', '카테고리')
    },
    {
      key: 'difficulty',
      label: t('admin:quizCatalog.columns.difficulty', '난이도')
    },
    {
      key: 'isActive',
      label: t('admin:quizCatalog.columns.status', '상태')
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

  const handleCreateQuiz = () => {
    setEditQuiz(null);
    setModalVisible(true);
  };

  const handleEditQuiz = (quiz: QuizCatalog) => {
    setEditQuiz(quiz);
    setModalVisible(true);
  };

  const handleManageQuestions = (quiz: QuizCatalog) => {
    // 퀴즈 문제 관리 모달 열기
    setCurrentQuizForQuestions(quiz);
    setQuestionManagementVisible(true);
  };

  const handlePreviewQuiz = (quiz: QuizCatalog) => {
    // 퀴즈 미리보기 로직 구현
    console.log('퀴즈 미리보기:', quiz);
    // 미리보기 모달 또는 페이지 열기
  };

  const handleDeleteQuiz = (quizCatalogId: string) => {
    // 삭제 로직 구현
    setQuizzes(quizzes.filter(q => q.quizCatalogId !== quizCatalogId));
  };

  const handleBatchDelete = () => {
    // 선택된 항목 일괄 삭제 로직
    const remainingQuizzes = quizzes.filter(
      q => !selectedQuizzes.some(sq => sq.quizCatalogId === q.quizCatalogId)
    );
    setQuizzes(remainingQuizzes);
    setSelectedQuizzes([]);
  };

  const handleModalSubmit = (formData: any) => {
    // 저장 로직 구현 (신규 또는 수정)
    if (editQuiz) {
      // 기존 퀴즈 수정
      setQuizzes(quizzes.map(q => 
        q.quizCatalogId === editQuiz.quizCatalogId ? 
          { ...q, ...formData, updatedAt: new Date().toISOString().split('T')[0] } : q
      ));
    } else {
      // 신규 퀴즈 추가
      const newQuiz = {
        ...formData,
        quizCatalogId: Date.now().toString(), // 임시 ID 생성
        questionItems: [], // 초기에는 문제 없음
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        createdBy: 'admin', // 현재 로그인한 사용자로 설정해야 함
        totalPoints: 0 // 문제가 없으므로 초기 배점은 0
      };
      setQuizzes([...quizzes, newQuiz]);
    }
    setModalVisible(false);
  };

  const handleQuestionManagementSave = () => {
    // 현재 보드 아이템을 기반으로 퀴즈 문제 저장
    if (currentQuizForQuestions) {
      // 보드 아이템에서 문제 ID와 배점 추출
      const questionItems = boardItems.map(item => ({
        questionId: item.id,
        points: item.data.points
      }));
      
      // 총 배점 계산 - 수정: boardItems에서 바로 계산
      const totalPoints = boardItems.reduce((sum, item) => sum + item.data.points, 0);
      
      // 퀴즈 업데이트
      const updatedQuiz = {
        ...currentQuizForQuestions,
        questionItems,
        totalPoints,
        updatedAt: new Date().toISOString().split('T')[0]
      };
      
      // 퀴즈 목록 업데이트
      setQuizzes(quizzes.map(q => 
        q.quizCatalogId === currentQuizForQuestions.quizCatalogId ? updatedQuiz : q
      ));
      
      // 모달 닫기
      setQuestionManagementVisible(false);
      setCurrentQuizForQuestions(null);
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
      
      // 중복 문제 제거하면서 보드 아이템 추가
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

  const handleRemoveSelectedBoardItems = () => {
    // 선택한 보드 아이템 제거 로직
    // (현재 구현은 없지만, 보드 컴포넌트에 선택 기능을 추가할 수 있음)
  };

  // 샘플 과정 목록
  const courseOptions = [
    { value: 'aws-101', label: 'AWS 입문' },
    { value: 'aws-solutions-architect', label: 'AWS 솔루션 아키텍트' },
    { value: 'aws-developer', label: 'AWS 개발자' },
    { value: 'aws-sysops', label: 'AWS SysOps' },
    { value: 'aws-security', label: 'AWS 보안' },
    { value: 'cloud-intro', label: '클라우드 컴퓨팅 개론' }
  ];

  // 퀴즈 템플릿 편집/생성 모달
  const renderQuizModal = () => {
    return (
      <Modal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        header={
          <Header variant="h2">
            {editQuiz 
              ? t('admin:quizCatalog.modal.editTitle', '퀴즈 템플릿 편집') 
              : t('admin:quizCatalog.modal.createTitle', '새 퀴즈 템플릿 생성')}
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
            label={t('admin:quizCatalog.form.title', '퀴즈 제목')}
            description={t('admin:quizCatalog.form.titleDesc', '퀴즈의 제목을 입력하세요')}
          >
            <Input
              value={editQuiz?.title || ''}
              onChange={({ detail }) => {
                if (editQuiz) {
                  setEditQuiz({ ...editQuiz, title: detail.value });
                }
              }}
            />
          </FormField>

          <FormField
            label={t('admin:quizCatalog.form.description', '설명')}
            description={t('admin:quizCatalog.form.descriptionDesc', '퀴즈의 목적이나 내용에 대한 설명')}
          >
            <Textarea
              value={editQuiz?.description || ''}
              onChange={({ detail }) => {
                if (editQuiz) {
                  setEditQuiz({ ...editQuiz, description: detail.value });
                }
              }}
            />
          </FormField>

          <FormField
            label={t('admin:quizCatalog.form.course', '연결된 과정')}
            description={t('admin:quizCatalog.form.courseDesc', '이 퀴즈가 연결될 교육 과정')}
          >
            <Select
              selectedOption={
                editQuiz?.courseId 
                  ? { value: editQuiz.courseId, label: editQuiz.courseName || editQuiz.courseId } 
                  : null
              }
              options={courseOptions}
              onChange={({ detail }) => {
                if (editQuiz) {
                  setEditQuiz({ 
                    ...editQuiz, 
                    courseId: detail.selectedOption?.value,
                    courseName: detail.selectedOption?.label
                  });
                }
              }}
              placeholder="과정 선택(선택사항)"
            />
          </FormField>

          <FormField
            label={t('admin:quizCatalog.form.category', '카테고리')}
          >
            <Input
              value={editQuiz?.category || ''}
              onChange={({ detail }) => {
                if (editQuiz) {
                  setEditQuiz({ ...editQuiz, category: detail.value });
                }
              }}
            />
          </FormField>

          <FormField
            label={t('admin:quizCatalog.form.difficulty', '난이도')}
          >
            <Select
              selectedOption={{ 
                value: editQuiz?.difficulty || 'beginner', 
                label: editQuiz?.difficulty 
                  ? { 
                      beginner: '초급', 
                      intermediate: '중급', 
                      advanced: '고급' 
                    }[editQuiz.difficulty] 
                  : '초급'
              }}
              options={[
                { value: 'beginner', label: '초급' },
                { value: 'intermediate', label: '중급' },
                { value: 'advanced', label: '고급' }
              ]}
              onChange={({ detail }) => {
                if (editQuiz) {
                  setEditQuiz({ 
                    ...editQuiz, 
                    difficulty: detail.selectedOption.value as any
                  });
                }
              }}
            />
          </FormField>

          <FormField
            label={t('admin:quizCatalog.form.timeLimit', '제한 시간(분)')}
            description={t('admin:quizCatalog.form.timeLimitDesc', '퀴즈 응시 제한 시간 (분 단위)')}
          >
            <Input
              type="number"
              value={(editQuiz?.defaultTimeLimit || 30).toString()}
              onChange={({ detail }) => {
                if (editQuiz) {
                  setEditQuiz({ 
                    ...editQuiz, 
                    defaultTimeLimit: parseInt(detail.value) || 0
                  });
                }
              }}
            />
          </FormField>

          <FormField
            label={t('admin:quizCatalog.form.tags', '태그')}
            description={t('admin:quizCatalog.form.tagsDesc', '퀴즈를 분류하는 태그를 입력하세요 (쉼표로 구분)')}
          >
            <Input
              value={editQuiz?.tags?.join(', ') || ''}
              onChange={({ detail }) => {
                if (editQuiz) {
                  const tagsArray = detail.value
                    .split(',')
                    .map(tag => tag.trim())
                    .filter(tag => tag);
                  setEditQuiz({ 
                    ...editQuiz, 
                    tags: tagsArray
                  });
                }
              }}
            />
          </FormField>

          <FormField
            label={t('admin:quizCatalog.form.isActive', '활성화 상태')}
          >
            <Toggle
              checked={editQuiz?.isActive || false}
              onChange={({ detail }) => {
                if (editQuiz) {
                  setEditQuiz({ ...editQuiz, isActive: detail.checked });
                }
              }}
            >
              {editQuiz?.isActive ? 
                t('admin:quizCatalog.status.active', '활성화') : 
                t('admin:quizCatalog.status.inactive', '비활성화')}
            </Toggle>
          </FormField>
        </SpaceBetween>
      </Modal>
    );
  };

  // 문제 관리 모달 (드래그 앤 드롭으로 문제 구성)
  const renderQuestionManagementModal = () => {
    // 타입 매핑 정의
    const typeMap: Record<string, string> = {
      multipleChoice: '객관식',
      trueFalse: '진위형',
      essay: '서술형',
      matching: '짝맞추기',
      coding: '코딩'
    };
    
    const difficultyMap: Record<string, string> = {
      easy: '쉬움',
      medium: '보통',
      hard: '어려움'
    };

    return (
      <Modal
        visible={questionManagementVisible}
        onDismiss={() => setQuestionManagementVisible(false)}
        header={
          <Header variant="h2" description={currentQuizForQuestions?.title}>
            {t('admin:quizCatalog.questionModal.title', '퀴즈 문제 관리')}
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
            {/* 문제 은행 (왼쪽 패널) */}
            <SpaceBetween size="m">
              <Header variant="h3">
                {t('admin:quizCatalog.questionModal.availableQuestions', '사용 가능한 문제')}
              </Header>
              <Table
                columnDefinitions={[
                  {
                    id: 'content',
                    header: t('admin:questionBank.columns.content', '문제 내용'),
                    cell: (item: Question) => item.content,
                    sortingField: 'content',
                  },
                  {
                    id: 'questionType',
                    header: t('admin:questionBank.columns.questionType', '유형'),
                    cell: (item: Question) => {
                      return typeMap[item.questionType] || item.questionType;
                    },
                  },
                  {
                    id: 'difficulty',
                    header: t('admin:questionBank.columns.difficulty', '난이도'),
                    cell: (item: Question) => {
                      return difficultyMap[item.difficulty] || item.difficulty;
                    },
                  },
                  {
                    id: 'points',
                    header: t('admin:questionBank.columns.points', '배점'),
                    cell: (item: Question) => item.points,
                  },
                ]}
                items={availableQuestions}
                selectionType="multi"
                selectedItems={selectedQuestions}
                onSelectionChange={({ detail }) => setSelectedQuestions(detail.selectedItems)}
                loading={loading}
                loadingText="로딩 중..."
                empty="사용 가능한 문제가 없습니다"
                header={<SpaceBetween
                  direction="horizontal" 
                  size="xs" 
                  alignItems="center"
                >
                  <span>총 {availableQuestions.length}개의 문제</span>
                  <Button 
                    iconName="add-plus" 
                    disabled={selectedQuestions.length === 0}
                    onClick={handleAddSelectedQuestions}
                  >
                    {t('admin:quizCatalog.questionModal.addSelected', '선택 추가')}
                  </Button>
                </SpaceBetween>}
                trackBy="questionId"
                visibleColumns={['content', 'questionType', 'difficulty', 'points']}
                stickyHeader={true}
                resizableColumns={true}
              />
            </SpaceBetween>

            {/* 선택된 문제 (오른쪽 패널) - 드래그 앤 드롭으로 순서 조정 가능 */}
            <SpaceBetween size="m">
              <Box>
                <Header variant="h3">
                  {t('admin:quizCatalog.questionModal.selectedQuestions', '선택된 문제')}
                </Header>
                <div style={{ marginTop: '8px' }}>
                  {t('admin:quizCatalog.questionModal.dragHint', '문제를 드래그하여 순서를 조정하세요')}
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
                      <div>유형: {typeMap[item.data.questionType] || item.data.questionType}</div>
                      <div>난이도: {difficultyMap[item.data.difficulty] || item.data.difficulty}</div>
                      <div>배점: 
                        <Input
                          type="number"
                          value={item.data.points.toString()}
                          onChange={({ detail }) => {
                            // 배점 업데이트
                            const updatedItems = boardItems.map(i => {
                              if (i.id === item.id) {
                                return {
                                  ...i,
                                  data: {
                                    ...i.data,
                                    points: parseInt(detail.value) || i.data.points
                                  }
                                };
                              }
                              return i;
                            });
                            setBoardItems(updatedItems);
                          }}
                        />
                      </div>
                    </SpaceBetween>
                  </BoardItem>
                )}
                onItemsChange={(event) => {
                  // TypeScript는 readonly 배열을 변경 가능한 배열에 할당할 수 없으므로
                  // 새 배열로 복사해야 함
                  const newItems = [...event.detail.items] as BoardItem[];
                  setBoardItems(newItems);
                }}
                items={boardItems}
                empty={
                  <Box textAlign="center" color="inherit" padding="l">
                    <b>문제가 없습니다</b>
                    <Box padding={{ bottom: "s" }} variant="p" color="inherit">
                      왼쪽에서 문제를 선택하여 추가하세요
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
                  <div>{t('admin:quizCatalog.questionModal.totalCount', '총 문제 수')}: {boardItems.length}개</div>
                  <div>{t('admin:quizCatalog.questionModal.totalPoints', '총 배점')}: {boardItems.reduce((sum, item) => sum + item.data.points, 0)}점</div>
                </SpaceBetween>
              </Box>
            </SpaceBetween>
          </ColumnLayout>
        </SpaceBetween>
      </Modal>
    );
  };

  return (
    <Box padding="l">
      <SpaceBetween size="l">
        <Header
          variant="h1"
          description={t('admin:quizCatalog.description', '퀴즈 템플릿을 관리합니다.')}
        >
          {t('admin:quizCatalog.title', '퀴즈 템플릿 관리')}
        </Header>

        <EnhancedTable
          title={t('admin:quizCatalog.tableTitle', '퀴즈 템플릿 목록')}
          description={t('admin:quizCatalog.tableDescription', '모든 퀴즈 템플릿을 조회하고 관리할 수 있습니다.')}
          columnDefinitions={columnDefinitions}
          items={quizzes}
          loading={loading}
          selectionType="multi"
          selectedItems={selectedQuizzes}
          onSelectionChange={setSelectedQuizzes}
          onRefresh={handleRefresh}
          actions={{
            primary: {
              text: t('admin:quizCatalog.actions.create', '새 퀴즈 만들기'),
              onClick: handleCreateQuiz
            }
          }}
          batchActions={[
            {
              text: t('admin:quizCatalog.actions.batchDelete', '선택 항목 삭제'),
              onClick: handleBatchDelete,
              disabled: selectedQuizzes.length === 0
            }
          ]}
          filteringProperties={filteringProperties}
          usePropertyFilter={true}
          defaultSortingColumn="createdAt"
          defaultSortingDescending={true}
          emptyText={{
            title: t('admin:quizCatalog.emptyState.title', '퀴즈 템플릿이 없습니다'),
            subtitle: t('admin:quizCatalog.emptyState.subtitle', '새 퀴즈 템플릿을 추가해보세요'),
            action: {
              text: t('admin:quizCatalog.actions.create', '새 퀴즈 만들기'),
              onClick: handleCreateQuiz
            }
          }}
          stickyHeader={true}
          stripedRows={true}
          resizableColumns={true}
          preferences={true}
          trackBy="quizCatalogId"
        />
        
        {renderQuizModal()}
        {renderQuestionManagementModal()}
      </SpaceBetween>
    </Box>
  );
};

export default QuizCatalogTab;