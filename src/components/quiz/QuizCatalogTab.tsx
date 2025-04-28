// src/components/admin/quiz/QuizCatalogTab.tsx
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
  Toggle
} from '@cloudscape-design/components';
import EnhancedTable from '@/components/common/EnhancedTable';
import { useAppTranslation } from '@/hooks/useAppTranslation';

// 임시 타입 및 샘플 데이터
interface QuizCatalog {
  quizCatalogId: string;
  title: string;
  description: string;
  questionItems: any[];
  totalPoints: number;
  defaultTimeLimit: number;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

const QuizCatalogTab: React.FC = () => {
  const { t } = useAppTranslation();
  const [quizzes, setQuizzes] = useState<QuizCatalog[]>([]);
  const [selectedQuizzes, setSelectedQuizzes] = useState<QuizCatalog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editQuiz, setEditQuiz] = useState<QuizCatalog | null>(null);

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
        createdBy: 'admin'
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
        createdBy: 'admin'
      }
    ];
    
    setQuizzes(sampleQuizzes);
    setLoading(false);
  }, []);

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
      header: t('admin:quizCatalog.columns.questionCount', '문항 수'),
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
            {t('admin:quizCatalog.actions.manageQuestions', '문항 관리')}
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
    // 퀴즈 문항 관리 로직 구현
    console.log('문항 관리:', quiz);
    // 여기서 별도의 문항 관리 모달을 열거나 관리 페이지로 이동
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
        questionItems: [], // 초기에는 문항 없음
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        createdBy: 'admin', // 현재 로그인한 사용자로 설정해야 함
        totalPoints: 0 // 문항이 없으므로 초기 배점은 0
      };
      setQuizzes([...quizzes, newQuiz]);
    }
    setModalVisible(false);
  };

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
      </SpaceBetween>
    </Box>
  );
};

export default QuizCatalogTab;