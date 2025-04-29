// src/components/quiz/QuizQuestionBankTab.tsx (renamed from QuestionBankTab)
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
  ColumnLayout,
  Tabs,
  FileUpload,
  Alert
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
  courseId?: string;
  courseName?: string;
  moduleId?: string;
  moduleName?: string;
}

const QuizQuestionBankTab: React.FC = () => {
  const { t } = useAppTranslation();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editQuestion, setEditQuestion] = useState<Question | null>(null);
  const [importModalVisible, setImportModalVisible] = useState<boolean>(false);
  const [importTabId, setImportTabId] = useState('file');
  const [fileUploadValue, setFileUploadValue] = useState<File[]>([]);
  const [aiGenerationModalVisible, setAiGenerationModalVisible] = useState<boolean>(false);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [generatingQuestions, setGeneratingQuestions] = useState<boolean>(false);

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
        createdBy: 'admin',
        courseId: 'aws-101',
        courseName: 'AWS 입문',
        moduleId: 'module-3',
        moduleName: 'AWS 보안 기초'
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
        createdBy: 'admin',
        courseId: 'aws-101',
        courseName: 'AWS 입문',
        moduleId: 'module-5',
        moduleName: 'AWS 스토리지 서비스'
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
        createdBy: 'admin',
        courseId: 'cloud-intro',
        courseName: '클라우드 컴퓨팅 개론',
        moduleId: 'module-1',
        moduleName: '클라우드 컴퓨팅 기초'
      }
    ];

    setQuestions(sampleQuestions);
    setLoading(false);
  }, []);

  // 테이블 컬럼 정의
  const columnDefinitions = [
    {
      id: 'content',
      header: t('admin:questionBank.columns.content', '문제 내용'),
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
      id: 'courseName',
      header: t('admin:questionBank.columns.course', '과정명'),
      cell: (item: Question) => item.courseName || '-',
      sortingField: 'courseName',
    },
    {
      id: 'moduleName',
      header: t('admin:questionBank.columns.module', '모듈'),
      cell: (item: Question) => item.moduleName || '-',
      sortingField: 'moduleName',
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
      label: t('admin:questionBank.columns.content', '문제 내용')
    },
    {
      key: 'questionType',
      label: t('admin:questionBank.columns.questionType', '문제 유형')
    },
    {
      key: 'courseName',
      label: t('admin:questionBank.columns.course', '과정명')
    },
    {
      key: 'moduleName',
      label: t('admin:questionBank.columns.module', '모듈')
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

  const handleImportQuestions = () => {
    setImportModalVisible(true);
  };

  const handleFileUpload = () => {
    // 파일 업로드 처리 로직
    if (fileUploadValue.length > 0) {
      // 파일 파싱 및 문제 가져오기 로직 구현
      console.log('파일에서 문제 가져오기:', fileUploadValue[0].name);

      // 여기서 실제 파일 처리 후 새 문제들을 추가할 것입니다
      // 임시로 몇 개의 더미 문제 추가
      const newQuestions: Question[] = [
        {
          questionId: `imported-\${Date.now()}-1`,
          content: '가져온 문제 1: AWS Lambda의 주요 특징은?',
          questionType: 'multipleChoice',
          options: [
            { id: 'A', text: '서버를 직접 관리해야 함' },
            { id: 'B', text: '서버리스 아키텍처' },
            { id: 'C', text: '항상 실행 상태를 유지함' },
            { id: 'D', text: '단일 언어만 지원함' }
          ],
          correctAnswer: { id: 'B' },
          explanation: 'AWS Lambda는 서버리스 컴퓨팅 서비스입니다.',
          difficulty: 'medium',
          tags: ['AWS', 'Lambda', '서버리스'],
          points: 10,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
          createdBy: 'admin',
          courseId: 'aws-serverless',
          courseName: 'AWS 서버리스 아키텍처',
          moduleId: 'module-1',
          moduleName: 'Lambda 소개'
        },
        {
          questionId: `imported-\${Date.now()}-2`,
          content: '가져온 문제 2: Amazon DynamoDB는 어떤 유형의 데이터베이스인가?',
          questionType: 'multipleChoice',
          options: [
            { id: 'A', text: '관계형 데이터베이스' },
            { id: 'B', text: 'NoSQL 데이터베이스' },
            { id: 'C', text: '그래프 데이터베이스' },
            { id: 'D', text: '인메모리 데이터베이스' }
          ],
          correctAnswer: { id: 'B' },
          explanation: 'Amazon DynamoDB는 완전 관리형 NoSQL 데이터베이스 서비스입니다.',
          difficulty: 'easy',
          tags: ['AWS', 'DynamoDB', '데이터베이스'],
          points: 5,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
          createdBy: 'admin',
          courseId: 'aws-database',
          courseName: 'AWS 데이터베이스 서비스',
          moduleId: 'module-3',
          moduleName: 'DynamoDB 소개'
        }
      ];

      setQuestions([...questions, ...newQuestions]);
      setImportModalVisible(false);
      setFileUploadValue([]);
    }
  };

  const handleAIGenerate = () => {
    setAiGenerationModalVisible(true);
  };

  const handleGenerateQuestions = () => {
    if (!selectedCourse) {
      return; // 과정을 선택하지 않았으면 중단
    }

    setGeneratingQuestions(true);

    // 실제로는 Bedrock API를 호출하여 질문을 생성하겠지만, 여기서는 시뮬레이션
    setTimeout(() => {
      // 생성된 질문 예시
      const generatedQuestions: Question[] = [
        {
          questionId: `ai-gen-\${Date.now()}-1`,
          content: 'AWS Knowledge Base에서 자동 생성된 질문: EC2 인스턴스 유형 중 메모리에 최적화된 유형은?',
          questionType: 'multipleChoice',
          options: [
            { id: 'A', text: 'C5' },
            { id: 'B', text: 'R5' },
            { id: 'C', text: 'M5' },
            { id: 'D', text: 'T3' }
          ],
          correctAnswer: { id: 'B' },
          explanation: 'R5 인스턴스는 메모리 집약적 애플리케이션에 최적화된 인스턴스 유형입니다.',
          difficulty: 'medium',
          tags: ['AWS', 'EC2', '컴퓨팅'],
          points: 10,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
          createdBy: 'ai-bedrock',
          courseId: selectedCourse,
          courseName: 'AWS 컴퓨팅 서비스',
          moduleId: selectedModule || undefined,
          moduleName: selectedModule ? 'EC2 인스턴스 유형' : undefined
        },
        {
          questionId: `ai-gen-\${Date.now()}-2`,
          content: 'AWS Knowledge Base에서 자동 생성된 질문: AWS에서 서버리스 아키텍처의 이점이 아닌 것은?',
          questionType: 'multipleChoice',
          options: [
            { id: 'A', text: '확장성' },
            { id: 'B', text: '낮은 유지 관리' },
            { id: 'C', text: '비용 효율성' },
            { id: 'D', text: '복잡한 네트워킹 제어' }
          ],
          correctAnswer: { id: 'D' },
          explanation: '서버리스 아키텍처는 네트워킹 제어가 제한적일 수 있으며, 복잡한 네트워킹 요구사항에는 EC2와 같은 IaaS 솔루션이 더 적합할 수 있습니다.',
          difficulty: 'hard',
          tags: ['AWS', '서버리스', '아키텍처'],
          points: 15,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
          createdBy: 'ai-bedrock',
          courseId: selectedCourse,
          courseName: 'AWS 서버리스 아키텍처',
          moduleId: selectedModule || undefined,
          moduleName: selectedModule ? '서버리스 아키텍처의 이점' : undefined
        }
      ];

      // 요청한 문제 수만큼 생성 (여기서는 2개만 예시로 추가)
      setQuestions([...questions, ...generatedQuestions]);
      setGeneratingQuestions(false);
      setAiGenerationModalVisible(false);
      // 상태 초기화
      setSelectedCourse('');
      setSelectedModule('');
      setQuestionCount(5);
    }, 2000);
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

  // 샘플 과정 목록
  const courseOptions = [
    { value: 'aws-101', label: 'AWS 입문' },
    { value: 'aws-solutions-architect', label: 'AWS 솔루션 아키텍트' },
    { value: 'aws-developer', label: 'AWS 개발자' },
    { value: 'aws-sysops', label: 'AWS SysOps' },
    { value: 'cloud-intro', label: '클라우드 컴퓨팅 개론' }
  ];

  // 샘플 모듈 목록 (선택된 과정에 따라 다름)
  const getModuleOptions = (courseId: string) => {
    const modulesByCourseid: Record<string, any[]> = {
      'aws-101': [
        { value: 'module-1', label: 'AWS 소개' },
        { value: 'module-2', label: 'AWS 계정 및 접속' },
        { value: 'module-3', label: 'AWS 보안 기초' },
        { value: 'module-4', label: 'AWS 컴퓨팅 서비스' },
        { value: 'module-5', label: 'AWS 스토리지 서비스' }
      ],
      'aws-solutions-architect': [
        { value: 'module-1', label: '아키텍처 설계 원칙' },
        { value: 'module-2', label: '고가용성 설계' },
        { value: 'module-3', label: '성능 최적화' }
      ],
      'cloud-intro': [
        { value: 'module-1', label: '클라우드 컴퓨팅 기초' },
        { value: 'module-2', label: '클라우드 서비스 모델' }
      ]
    };

    return modulesByCourseid[courseId] || [];
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
              ? t('admin:questionBank.modal.editTitle', '문제 편집')
              : t('admin:questionBank.modal.createTitle', '새 문제 생성')}
          </Header>
        }
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setModalVisible(false)}>
                {t('common:cancel', '취소')}
              </Button>
              <Button variant="primary" onClick={() => handleModalSubmit({/* 폼 데이터 */ })}>
                {t('common:save', '저장')}
              </Button>
            </SpaceBetween>
          </Box>
        }
        size="large"
      >
        <SpaceBetween size="l">
          <FormField
            label={t('admin:questionBank.form.content', '문제 내용')}
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

          <ColumnLayout columns={2}>
            <FormField
              label={t('admin:questionBank.form.course', '관련 과정')}
            >
              <Select
                selectedOption={
                  editQuestion?.courseId
                    ? { value: editQuestion.courseId, label: editQuestion.courseName || editQuestion.courseId }
                    : null
                }
                options={courseOptions}
                onChange={({ detail }) => {
                  if (editQuestion) {
                    setEditQuestion({
                      ...editQuestion,
                      courseId: detail.selectedOption?.value,
                      courseName: detail.selectedOption?.label,
                      // 과정이 바뀌면 모듈도 초기화
                      moduleId: undefined,
                      moduleName: undefined
                    });
                  }
                }}
                placeholder="과정 선택(선택사항)"
              />
            </FormField>

            <FormField
              label={t('admin:questionBank.form.module', '관련 모듈')}
            >
              <Select
                selectedOption={
                  editQuestion?.moduleId
                    ? { value: editQuestion.moduleId, label: editQuestion.moduleName || editQuestion.moduleId }
                    : null
                }
                options={editQuestion?.courseId ? getModuleOptions(editQuestion.courseId) : []}
                onChange={({ detail }) => {
                  if (editQuestion) {
                    setEditQuestion({
                      ...editQuestion,
                      moduleId: detail.selectedOption?.value,
                      moduleName: detail.selectedOption?.label
                    });
                  }
                }}
                placeholder="모듈 선택(선택사항)"
                disabled={!editQuestion?.courseId}
              />
            </FormField>
          </ColumnLayout>

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
            description={t('admin:questionBank.form.pointsDesc', '문제의 배점을 입력하세요')}
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
            description={t('admin:questionBank.form.tagsDesc', '문제를 분류하는 태그를 입력하세요 (쉼표로 구분)')}
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

          {/* 문제 유형에 따라 추가 필드 표시 */}
          {editQuestion?.questionType === 'multipleChoice' && (
            <FormField
              label={t('admin:questionBank.form.options', '선택지')}
              description={t('admin:questionBank.form.optionsDesc', '각 선택지를 추가하고 정답을 선택하세요')}
            >
              {/* 여기에 선택지 입력 폼 구현 */}
              <Box>
                {editQuestion.options.map((option, index) => (
                  <SpaceBetween key={option.id} direction="horizontal" size="xs">
                    <Input
                      value={option.text}
                      onChange={({ detail }) => {
                        if (editQuestion) {
                          const newOptions = [...editQuestion.options];
                          newOptions[index] = { ...option, text: detail.value };
                          setEditQuestion({
                            ...editQuestion,
                            options: newOptions
                          });
                        }
                      }}
                    />
                    <Button
                      iconName="status-positive"
                      variant={editQuestion.correctAnswer.id === option.id ? "primary" : "normal"}
                      onClick={() => {
                        if (editQuestion) {
                          setEditQuestion({
                            ...editQuestion,
                            correctAnswer: { id: option.id }
                          });
                        }
                      }}
                    >
                      정답
                    </Button>
                    <Button
                      iconName="remove"
                      variant="icon"
                      onClick={() => {
                        if (editQuestion) {
                          const newOptions = editQuestion.options.filter(o => o.id !== option.id);
                          setEditQuestion({
                            ...editQuestion,
                            options: newOptions,
                            // 만약 삭제한 옵션이 정답이었다면 정답도 초기화
                            correctAnswer: editQuestion.correctAnswer.id === option.id ? {} : editQuestion.correctAnswer
                          });
                        }
                      }}
                    />
                  </SpaceBetween>
                ))}
                <Button
                  iconName="add-plus"
                  onClick={() => {
                    if (editQuestion) {
                      // 새 옵션 추가. A, B, C, D... 다음 알파벳 부여
                      const newOptionId = String.fromCharCode(
                        65 + editQuestion.options.length
                      );
                      setEditQuestion({
                        ...editQuestion,
                        options: [
                          ...editQuestion.options,
                          { id: newOptionId, text: '' }
                        ]
                      });
                    }
                  }}
                >
                  선택지 추가
                </Button>
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
            description={t('admin:questionBank.form.explanationDesc', '문제에 대한 설명 또는 힌트')}
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

  // 파일 가져오기 모달
  const renderImportModal = () => {
    return (
      <Modal
        visible={importModalVisible}
        onDismiss={() => setImportModalVisible(false)}
        header={
          <Header variant="h2">
            {t('admin:questionBank.importModal.title', '문제 가져오기')}
          </Header>
        }
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setImportModalVisible(false)}>
                {t('common:cancel', '취소')}
              </Button>
              <Button
                variant="primary"
                onClick={handleFileUpload}
                disabled={importTabId === 'file' && fileUploadValue.length === 0}
              >
                {t('admin:questionBank.importModal.import', '가져오기')}
              </Button>
            </SpaceBetween>
          </Box>
        }
        size="large"
      >
        <SpaceBetween size="l">
          <Tabs
            activeTabId={importTabId}
            onChange={({ detail }) => setImportTabId(detail.activeTabId)}
            tabs={[
              {
                id: 'file',
                label: t('admin:questionBank.importModal.tabs.file', '파일에서 가져오기'),
                content: (
                  <SpaceBetween size="l">
                    <Alert type="info">
                      {t('admin:questionBank.importModal.fileInfo',
                        'Excel(XLSX) 또는 CSV 형식의 파일에서 문제를 가져올 수 있습니다. 샘플 양식을 다운로드하여 참고하세요.')}
                    </Alert>

                    <Button iconName="download">
                      {t('admin:questionBank.importModal.downloadTemplate', '문제 템플릿 다운로드')}
                    </Button>

                    <FileUpload
                      onChange={({ detail }) => setFileUploadValue(detail.value)}
                      value={fileUploadValue}
                      constraintText={t('admin:questionBank.importModal.fileConstraint', 'Excel(XLSX) 또는 CSV 파일만 허용됩니다.')}
                      accept=".xlsx,.csv"
                      i18nStrings={{
                        dropzoneText: (multiple) => multiple
                          ? "파일들을 여기에 드롭하세요"
                          : "파일을 여기에 드롭하세요"
                      }}
                    />
                  </SpaceBetween>
                )
              },
              {
                id: 'clipboard',
                label: t('admin:questionBank.importModal.tabs.clipboard', '클립보드에서 가져오기'),
                content: (
                  <SpaceBetween size="l">
                    <Alert type="info">
                      {t('admin:questionBank.importModal.clipboardInfo',
                        '엑셀이나 다른 문서에서 복사한 내용을 붙여넣으세요. 각 행은 별도의 문제로 처리됩니다.')}
                    </Alert>

                    <FormField
                      label={t('admin:questionBank.importModal.pasteHere', '내용 붙여넣기')}
                    >
                      <Textarea
                      value="" 
                        rows={10}
                        placeholder={t('admin:questionBank.importModal.pasteFormat',
                          '문제,문제유형,보기A,보기B,보기C,보기D,정답,설명,난이도,배점,태그\n예: AWS IAM의 구성요소는?,multipleChoice,사용자,역할,정책,데이터베이스,C,IAM은 사용자 역할 정책으로 구성됩니다,medium,10,AWS;IAM;보안')}
                      />
                    </FormField>
                  </SpaceBetween>
                )
              }
            ]}
          />
        </SpaceBetween>
      </Modal>
    );
  };

  // AI 문제 생성 모달
  const renderAIGenerationModal = () => {
    return (
      <Modal
        visible={aiGenerationModalVisible}
        onDismiss={() => setAiGenerationModalVisible(false)}
        header={
          <Header variant="h2">
            {t('admin:questionBank.aiModal.title', 'AI 문제 자동 생성')}
          </Header>
        }
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setAiGenerationModalVisible(false)}>
                {t('common:cancel', '취소')}
              </Button>
              <Button
                variant="primary"
                onClick={handleGenerateQuestions}
                disabled={!selectedCourse || generatingQuestions}
                loading={generatingQuestions}
              >
                {t('admin:questionBank.aiModal.generate', '생성하기')}
              </Button>
            </SpaceBetween>
          </Box>
        }
        size="large"
      >
        <SpaceBetween size="l">
          <Alert type="info">
            {t('admin:questionBank.aiModal.info',
              'AWS Bedrock과 Knowledge Base를 활용하여 선택한 교육 과정에 맞는 퀴즈 문제를 자동으로 생성합니다. 생성된 문제는 검토 후 사용하세요.')}
          </Alert>

          <FormField
            label={t('admin:questionBank.aiModal.course', '교육 과정 선택')}
            description={t('admin:questionBank.aiModal.courseDesc', '문제를 생성할 교육 과정을 선택하세요')}
          >
            <Select
              selectedOption={selectedCourse ? { value: selectedCourse, label: courseOptions.find(c => c.value === selectedCourse)?.label || selectedCourse } : null}
              options={courseOptions}
              onChange={({ detail }) => setSelectedCourse(detail.selectedOption?.value || '')}
              placeholder="교육 과정 선택"
            />
          </FormField>

          <FormField
            label={t('admin:questionBank.aiModal.module', '모듈 선택 (선택사항)')}
            description={t('admin:questionBank.aiModal.moduleDesc', '특정 모듈에 대한 문제만 생성하려면 선택하세요')}
          >
            <Select
              selectedOption={selectedModule ? { value: selectedModule, label: getModuleOptions(selectedCourse).find(m => m.value === selectedModule)?.label || selectedModule } : null}
              options={selectedCourse ? getModuleOptions(selectedCourse) : []}
              onChange={({ detail }) => setSelectedModule(detail.selectedOption?.value || '')}
              placeholder="모듈 선택 (선택사항)"
              disabled={!selectedCourse}
            />
          </FormField>

          <FormField
            label={t('admin:questionBank.aiModal.count', '생성할 문제 수')}
          >
            <Input
              type="number"
              value={questionCount.toString()}
              onChange={({ detail }) => setQuestionCount(parseInt(detail.value) || 5)}
            />
          </FormField>

          <FormField
            label={t('admin:questionBank.aiModal.types', '생성할 문제 유형')}
          >
            <SpaceBetween direction="horizontal" size="xs">
              <Button iconName="check">객관식</Button>
              <Button>진위형</Button>
              <Button>서술형</Button>
            </SpaceBetween>
          </FormField>

          <FormField
            label={t('admin:questionBank.aiModal.difficulty', '난이도')}
          >
            <SpaceBetween direction="horizontal" size="xs">
              <Button>쉬움</Button>
              <Button iconName="check">보통</Button>
              <Button>어려움</Button>
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
          description={t('admin:questionBank.description', '퀴즈에 사용될 문제를 관리합니다.')}
        >
          {t('admin:questionBank.title', '퀴즈 문제 은행')}
        </Header>

        <EnhancedTable
          title={t('admin:questionBank.tableTitle', '퀴즈 문제 목록')}
          description={t('admin:questionBank.tableDescription', '모든 퀴즈 문제를 조회하고 관리할 수 있습니다.')}
          columnDefinitions={columnDefinitions}
          items={questions}
          loading={loading}
          selectionType="multi"
          selectedItems={selectedQuestions}
          onSelectionChange={setSelectedQuestions}
          onRefresh={handleRefresh}
          actions={{
            primary: {
              text: t('admin:questionBank.actions.create', '새 문제 만들기'),
              onClick: handleCreateQuestion
            },
            secondary: [
              {
                text: t('admin:questionBank.actions.import', '문제 가져오기'),
                onClick: handleImportQuestions
              },
              {
                text: t('admin:questionBank.actions.aiGenerate', 'AI 문제 생성'),
                onClick: handleAIGenerate
              }
            ]
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
            title: t('admin:questionBank.emptyState.title', '문제가 없습니다'),
            subtitle: t('admin:questionBank.emptyState.subtitle', '새 문제를 추가하거나 가져오세요'),
            action: {
              text: t('admin:questionBank.actions.create', '새 문제 만들기'),
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
        {renderImportModal()}
        {renderAIGenerationModal()}
      </SpaceBetween>
    </Box>
  );
};

export default QuizQuestionBankTab;