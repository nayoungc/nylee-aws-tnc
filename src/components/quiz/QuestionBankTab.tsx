// src/components/admin/quiz/QuestionBankTab.tsx
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
  ColumnLayout
} from '@cloudscape-design/components';
import EnhancedTable from '@/components/common/EnhancedTable';
import { useAppTranslation } from '@/hooks/useAppTranslation';

// 임시 타입 및 샘플 데이터
interface Question {
  questionId: string;
  content: string;
  questionType: 'multipleChoice' | 'trueFalse' | 'essay' | 'matching' | 'coding';
  options: any[];
  correctAnswer: any;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  points: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

const QuestionBankTab: React.FC = () => {
  const { t } = useAppTranslation();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editQuestion, setEditQuestion] = useState<Question | null>(null);

  // 샘플 데이터 로드
  useEffect(() => {
    // API 호출 또는 데이터 로드 로직
    const sampleQuestions: Question[] = [
      {
        questionId: '1',
        content: 'AWS IAM의 주요 구성 요소가 아닌 것은?',
        questionType: 'multipleChoice',
        options: [
          { id: 'A', text: 'User' },
          { id: 'B', text: 'Role' },
          { id: 'C', text: 'Policy' },
          { id: 'D', text: 'Database' }
        ],
        correctAnswer: { id: 'D' },
        explanation: 'IAM의 주요 구성 요소는 User, Role, Group, Policy입니다. Database는 IAM의 구성 요소가 아닙니다.',
        difficulty: 'medium',
        tags: ['AWS', 'IAM', '보안'],
        points: 10,
        createdAt: '2023-09-01',
        updatedAt: '2023-09-01',
        createdBy: 'admin'
      },
      {
        questionId: '2',
        content: 'Amazon S3 스토리지 클래스 중 가장 비용 효율적인 장기 보관용 클래스는?',
        questionType: 'multipleChoice',
        options: [
          { id: 'A', text: 'S3 Standard' },
          { id: 'B', text: 'S3 Intelligent-Tiering' },
          { id: 'C', text: 'S3 Glacier Deep Archive' },
          { id: 'D', text: 'S3 One Zone-IA' }
        ],
        correctAnswer: { id: 'C' },
        explanation: 'S3 Glacier Deep Archive는 가장 비용 효율적인 장기 보관용 스토리지 클래스입니다.',
        difficulty: 'medium',
        tags: ['AWS', 'S3', '스토리지'],
        points: 10,
        createdAt: '2023-09-02',
        updatedAt: '2023-09-02',
        createdBy: 'admin'
      },
      {
        questionId: '3',
        content: '클라우드 컴퓨팅의 주요 이점은 무엇인지 설명하시오.',
        questionType: 'essay',
        options: [],
        correctAnswer: { sampleAnswer: '클라우드 컴퓨팅의 주요 이점은 확장성, 유연성, 비용 효율성 등이 있습니다...' },
        explanation: '',
        difficulty: 'medium',
        tags: ['클라우드', '기초'],
        points: 20,
        createdAt: '2023-09-03',
        updatedAt: '2023-09-03',
        createdBy: 'admin'
      }
    ];
    
    setQuestions(sampleQuestions);
    setLoading(false);
  }, []);

  // 테이블 컬럼 정의
  const columnDefinitions = [
    {
      id: 'content',
      header: t('admin:questionBank.columns.content', '문항 내용'),
      cell: (item: Question) => item.content,
      sortingField: 'content',
      isRowHeader: true,
    },
    {
      id: 'questionType',
      header: t('admin:questionBank.columns.questionType', '문제 유형'),
      cell: (item: Question) => {
        const typeMap: Record<string, string> = {
          multipleChoice: '객관식',
          trueFalse: '진위형',
          essay: '서술형',
          matching: '짝맞추기',
          coding: '코딩'
        };
        return typeMap[item.questionType] || item.questionType;
      },
      sortingField: 'questionType',
    },
    {
      id: 'difficulty',
      header: t('admin:questionBank.columns.difficulty', '난이도'),
      cell: (item: Question) => {
        const difficultyMap: Record<string, string> = {
          easy: '쉬움',
          medium: '보통',
          hard: '어려움'
        };
        return difficultyMap[item.difficulty] || item.difficulty;
      },
      sortingField: 'difficulty',
    },
    {
      id: 'points',
      header: t('admin:questionBank.columns.points', '배점'),
      cell: (item: Question) => item.points,
      sortingField: 'points',
    },
    {
      id: 'tags',
      header: t('admin:questionBank.columns.tags', '태그'),
      cell: (item: Question) => item.tags.join(', '),
      sortingField: 'tags',
    },
    {
      id: 'createdAt',
      header: t('admin:questionBank.columns.createdAt', '생성일'),
      cell: (item: Question) => item.createdAt,
      sortingField: 'createdAt',
    },
    {
      id: 'actions',
      header: t('admin:questionBank.columns.actions', '작업'),
      cell: (item: Question) => (
        <SpaceBetween direction="horizontal" size="xs">
          <Button 
            variant="link" 
            onClick={() => handleEditQuestion(item)}
          >
            {t('common:edit', '편집')}
          </Button>
          <Button 
            variant="link" 
            onClick={() => handleDeleteQuestion(item.questionId)}
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
      key: 'content',
      label: t('admin:questionBank.columns.content', '문항 내용')
    },
    {
      key: 'questionType',
      label: t('admin:questionBank.columns.questionType', '문제 유형')
    },
    {
      key: 'difficulty',
      label: t('admin:questionBank.columns.difficulty', '난이도')
    },
    {
      key: 'tags',
      label: t('admin:questionBank.columns.tags', '태그')
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

  const handleCreateQuestion = () => {
    setEditQuestion(null);
    setModalVisible(true);
  };

  const handleEditQuestion = (question: Question) => {
    setEditQuestion(question);
    setModalVisible(true);
  };

  const handleDeleteQuestion = (questionId: string) => {
    // 삭제 로직 구현
    setQuestions(questions.filter(q => q.questionId !== questionId));
  };

  const handleBatchDelete = () => {
    // 선택된 항목 일괄 삭제 로직
    const remainingQuestions = questions.filter(
      q => !selectedQuestions.some(sq => sq.questionId === q.questionId)
    );
    setQuestions(remainingQuestions);
    setSelectedQuestions([]);
  };

  const handleModalSubmit = (formData: any) => {
    // 저장 로직 구현 (신규 또는 수정)
    if (editQuestion) {
      // 기존 질문 수정
      setQuestions(questions.map(q => 
        q.questionId === editQuestion.questionId ? { ...q, ...formData, updatedAt: new Date().toISOString().split('T')[0] } : q
      ));
    } else {
      // 신규 질문 추가
      const newQuestion = {
        ...formData,
        questionId: Date.now().toString(), // 임시 ID 생성
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        createdBy: 'admin' // 현재 로그인한 사용자로 설정해야 함
      };
      setQuestions([...questions, newQuestion]);
    }
    setModalVisible(false);
  };

  // 질문 편집/생성 모달
  const renderQuestionModal = () => {
    return (
      <Modal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        header={
          <Header variant="h2">
            {editQuestion 
              ? t('admin:questionBank.modal.editTitle', '문항 편집') 
              : t('admin:questionBank.modal.createTitle', '새 문항 생성')}
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
            label={t('admin:questionBank.form.content', '문항 내용')}
            description={t('admin:questionBank.form.contentDesc', '학습자에게 제시될 질문을 입력하세요.')}
          >
            <Textarea
              value={editQuestion?.content || ''}
              onChange={({ detail }) => {
                if (editQuestion) {
                  setEditQuestion({ ...editQuestion, content: detail.value });
                }
              }}
            />
          </FormField>

          <FormField
            label={t('admin:questionBank.form.questionType', '문제 유형')}
          >
            <Select
              selectedOption={{ 
                value: editQuestion?.questionType || 'multipleChoice', 
                label: editQuestion?.questionType 
                  ? {
                      multipleChoice: '객관식',
                      trueFalse: '진위형',
                      essay: '서술형',
                      matching: '짝맞추기',
                      coding: '코딩'
                    }[editQuestion.questionType] 
                  : '객관식'
              }}
              options={[
                { value: 'multipleChoice', label: '객관식' },
                { value: 'trueFalse', label: '진위형' },
                { value: 'essay', label: '서술형' },
                { value: 'matching', label: '짝맞추기' },
                { value: 'coding', label: '코딩' }
              ]}
              onChange={({ detail }) => {
                if (editQuestion) {
                  setEditQuestion({ 
                    ...editQuestion, 
                    questionType: detail.selectedOption.value as any,
                    // 문항 유형이 바뀌면 옵션과 정답도 초기화
                    options: detail.selectedOption.value === 'essay' || detail.selectedOption.value === 'coding' 
                      ? [] 
                      : editQuestion.options,
                    correctAnswer: {}
                  });
                }
              }}
            />
          </FormField>

          <FormField
            label={t('admin:questionBank.form.difficulty', '난이도')}
          >
            <Select
              selectedOption={{ 
                value: editQuestion?.difficulty || 'medium', 
                label: editQuestion?.difficulty 
                  ? { easy: '쉬움', medium: '보통', hard: '어려움' }[editQuestion.difficulty] 
                  : '보통'
              }}
              options={[
                { value: 'easy', label: '쉬움' },
                { value: 'medium', label: '보통' },
                { value: 'hard', label: '어려움' }
              ]}
              onChange={({ detail }) => {
                if (editQuestion) {
                  setEditQuestion({ 
                    ...editQuestion, 
                    difficulty: detail.selectedOption.value as any
                  });
                }
              }}
            />
          </FormField>

          <FormField
            label={t('admin:questionBank.form.points', '배점')}
            description={t('admin:questionBank.form.pointsDesc', '문항의 배점을 입력하세요')}
          >
            <Input
              type="number"
              value={(editQuestion?.points || 10).toString()}
              onChange={({ detail }) => {
                if (editQuestion) {
                  setEditQuestion({ 
                    ...editQuestion, 
                    points: parseInt(detail.value) || 0
                  });
                }
              }}
            />
          </FormField>

          <FormField
            label={t('admin:questionBank.form.tags', '태그')}
            description={t('admin:questionBank.form.tagsDesc', '문항을 분류하는 태그를 입력하세요 (쉼표로 구분)')}
          >
            <Input
              value={editQuestion?.tags?.join(', ') || ''}
              onChange={({ detail }) => {
                if (editQuestion) {
                  const tagsArray = detail.value
                    .split(',')
                    .map(tag => tag.trim())
                    .filter(tag => tag);
                  setEditQuestion({ 
                    ...editQuestion, 
                    tags: tagsArray
                  });
                }
              }}
            />
          </FormField>

          {/* 문항 유형에 따라 추가 필드 표시 */}
          {editQuestion?.questionType === 'multipleChoice' && (
            <FormField
              label={t('admin:questionBank.form.options', '선택지')}
              description={t('admin:questionBank.form.optionsDesc', '각 선택지를 추가하고 정답을 선택하세요')}
            >
              {/* 여기에 선택지 입력 폼 구현 */}
              <Box>
                {/* 간단한 구현을 위해 목업 */}
                <div>A. User</div>
                <div>B. Role</div>
                <div>C. Policy</div>
                <div>D. Database (정답)</div>
              </Box>
            </FormField>
          )}

          {editQuestion?.questionType === 'essay' && (
            <FormField
              label={t('admin:questionBank.form.sampleAnswer', '예시 답안')}
              description={t('admin:questionBank.form.sampleAnswerDesc', '채점 기준이 될 예시 답안을 작성하세요')}
            >
              <Textarea
                value={editQuestion?.correctAnswer?.sampleAnswer || ''}
                onChange={({ detail }) => {
                  if (editQuestion) {
                    setEditQuestion({ 
                      ...editQuestion, 
                      correctAnswer: { ...editQuestion.correctAnswer, sampleAnswer: detail.value }
                    });
                  }
                }}
              />
            </FormField>
          )}

          <FormField
            label={t('admin:questionBank.form.explanation', '설명')}
            description={t('admin:questionBank.form.explanationDesc', '문항에 대한 설명 또는 힌트')}
          >
            <Textarea
              value={editQuestion?.explanation || ''}
              onChange={({ detail }) => {
                if (editQuestion) {
                  setEditQuestion({ 
                    ...editQuestion, 
                    explanation: detail.value
                  });
                }
              }}
            />
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
          description={t('admin:questionBank.description', '퀴즈에 사용될 문항을 관리합니다.')}
        >
          {t('admin:questionBank.title', '문항 은행')}
        </Header>

        <EnhancedTable
          title={t('admin:questionBank.tableTitle', '문항 목록')}
          description={t('admin:questionBank.tableDescription', '모든 퀴즈 문항을 조회하고 관리할 수 있습니다.')}
          columnDefinitions={columnDefinitions}
          items={questions}
          loading={loading}
          selectionType="multi"
          selectedItems={selectedQuestions}
          onSelectionChange={setSelectedQuestions}
          onRefresh={handleRefresh}
          actions={{
            primary: {
              text: t('admin:questionBank.actions.create', '새 문항 만들기'),
              onClick: handleCreateQuestion
            }
          }}
          batchActions={[
            {
              text: t('admin:questionBank.actions.batchDelete', '선택 항목 삭제'),
              onClick: handleBatchDelete,
              disabled: selectedQuestions.length === 0
            }
          ]}
          filteringProperties={filteringProperties}
          usePropertyFilter={true}
          defaultSortingColumn="createdAt"
          defaultSortingDescending={true}
          emptyText={{
            title: t('admin:questionBank.emptyState.title', '문항이 없습니다'),
            subtitle: t('admin:questionBank.emptyState.subtitle', '새 문항을 추가해보세요'),
            action: {
              text: t('admin:questionBank.actions.create', '새 문항 만들기'),
              onClick: handleCreateQuestion
            }
          }}
          stickyHeader={true}
          stripedRows={true}
          resizableColumns={true}
          preferences={true}
          trackBy="questionId"
        />
        
        {renderQuestionModal()}
      </SpaceBetween>
    </Box>
  );
};

export default QuestionBankTab;