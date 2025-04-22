// src/pages/instructor/quizizz/QuizCreate.tsx 
import {
  Alert,
  Box,
  Button,
  Checkbox,
  ColumnLayout,
  Container,
  FormField,
  Header,
  Input,
  Modal,
  ProgressBar,
  RadioGroup,
  Select,
  SpaceBetween,
  Spinner,
  Table,
  Textarea
} from '@cloudscape-design/components';
import { useTypedTranslation } from '@utils/i18n-utils';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  listCourseCatalogs,
} from '@api/catalog';

import { CourseCatalog, Question, Quiz } from '@/api/types';
import {
  createQuiz,
  generateQuizFromContent,
  getQuiz,
  updateQuiz
} from '@api/quiz';
import { v4 as uuidv4 } from 'uuid';

// 타입 정의
interface QuizMeta {
  title: string;
  description: string;
  timeLimit: number;
  passScore: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showFeedback: boolean;
}

interface LocationState {
  quizId?: string;
  courseId?: string;
  courseName?: string;
  quizType?: 'pre' | 'post';
  initialQuestions?: Question[];
  editMode?: boolean;
  copyMode?: boolean;
  preQuizId?: string;
}

export default function QuizCreate() {
  const { t, tString } = useTypedTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState || {};
  const { quizId } = useParams<{ quizId: string }>();
  const editingQuizId = quizId || state.quizId;

  // 상태 관리
  const [courses, setCourses] = useState<CourseCatalog[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(
    state.courseId && state.courseName
      ? { label: state.courseName, value: state.courseId }
      : null
  );
  const [quizType, setQuizType] = useState<'pre' | 'post'>(state.quizType || 'pre');
  const [quizMeta, setQuizMeta] = useState<QuizMeta>({
    title: '',
    description: '',
    timeLimit: 30,
    passScore: 70,
    shuffleQuestions: true,
    shuffleOptions: false,
    showFeedback: true
  });
  const [questions, setQuestions] = useState<Question[]>(state.initialQuestions || []);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [fileImportProgress, setFileImportProgress] = useState(0);
  const [isFileImporting, setIsFileImporting] = useState(false);
  const [showAiGenerationModal, setShowAiGenerationModal] = useState(false);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [aiQuestionCount, setAiQuestionCount] = useState(5);
  const [aiModelType, setAiModelType] = useState<'basic' | 'advanced'>('basic');
  const [aiContextPrompt, setAiContextPrompt] = useState('');
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);

  const isEditMode = !!editingQuizId;
  const isCopyMode = !!state.copyMode;

  // 페이지 로드 시 과정 목록 가져오기
  useEffect(() => {
    fetchCourses();

    // 퀴즈 기본 제목 설정
    if (state.courseId && state.courseName) {
      const defaultTitle = `\${state.courseName} \${
        state.quizType === 'post' ? t('quiz_creator.post_quiz') : t('quiz_creator.pre_quiz')
      }`;
      setQuizMeta(prev => ({ ...prev, title: defaultTitle, description: t('quiz_creator.default_description') }));
    }

    // 편집 모드일 경우 퀴즈 데이터 가져오기
    if (isEditMode && editingQuizId) {
      fetchQuiz(editingQuizId);
    }
  }, []);

  // 과정 목록 가져오기
  const fetchCourses = async () => {
    try {
      setLoading(true);

      // DynamoDB API 호출
      const response = await listCourseCatalogs();

      if (response.data && Array.isArray(response.data)) {
        // 타입 변환 적용
        const mappedCourses = response.data.map(item => ({
          catalogId: item.catalogId || '',
          title: item.title || '',
          version: item.version || 'v1',
          isPublished: item.isPublished !== undefined ? item.isPublished : true,
          status: item.status || 'ACTIVE',
          description: item.description,
          level: item.level,
          // 기타 필요한 필드...
        } as CourseCatalog));
        
        setCourses(mappedCourses);

        const courseOptions = mappedCourses.map(course => ({
          label: course.title,
          value: course.catalogId
        }));

        // 이미 선택된 과정이 없고 과정이 있다면 첫 번째 과정 선택
        if (!selectedCourse && courseOptions.length > 0) {
          setSelectedCourse(courseOptions[0]);
          setQuizMeta(prev => ({
            ...prev,
            title: `\${courseOptions[0].label} \${
              quizType === 'post' ? t('quiz_creator.post_quiz') : t('quiz_creator.pre_quiz')
            }`
          }));
        }
      } else if (process.env.NODE_ENV === 'development') {
        // 개발 환경인 경우 샘플 데이터 제공
        const sampleCourses = [
          {
            catalogId: 'sample-1',
            title: 'AWS Cloud Practitioner',
            version: 'v1',
            isPublished: true,
            status: 'ACTIVE',
            description: '클라우드 기초 개념 학습',
            level: 'Foundational'
          },
          {
            catalogId: 'sample-2',
            title: 'AWS Solutions Architect Associate',
            version: 'v1',
            isPublished: true,
            status: 'ACTIVE',
            description: 'AWS 아키텍처 설계 학습',
            level: 'Associate'
          }
        ] as CourseCatalog[];
        
        setCourses(sampleCourses);
        
        if (!selectedCourse) {
          setSelectedCourse({
            label: sampleCourses[0].title,
            value: sampleCourses[0].catalogId
          });
          setQuizMeta(prev => ({
            ...prev,
            title: `\${sampleCourses[0].title} \${
              quizType === 'post' ? t('quiz_creator.post_quiz') : t('quiz_creator.pre_quiz')
            }`
          }));
        }
      }
    } catch (error) {
      console.error(t('quiz_creator.errors.course_load'), error);
      setError(t('quiz_creator.errors.course_load_message'));
    } finally {
      setLoading(false);
    }
  };

  // 편집 모드에서 퀴즈 가져오기
  const fetchQuiz = async (quizId: string) => {
    try {
      setLoading(true);

      const response = await getQuiz(quizId);

      if (response.data) {
        const quiz = response.data;

        // 퀴즈 메타데이터 설정
        setQuizMeta({
          title: quiz.title,
          description: quiz.description || '',
          timeLimit: quiz.timeLimit || 30,
          passScore: quiz.passScore || 70,
          shuffleQuestions: quiz.shuffleQuestions || false,
          shuffleOptions: quiz.shuffleOptions || false,
          showFeedback: quiz.showFeedback || true
        });

        // 퀴즈 타입 설정
        setQuizType(quiz.quizType);

        // 과정 설정
        if (quiz.courseId) {
          setSelectedCourse({
            label: quiz.courseName || quiz.courseId,
            value: quiz.courseId
          });
        }

        // 질문 가져오기
        if (quiz.questions) {
          setQuestions(quiz.questions);
        }
      }
    } catch (error) {
      console.error(t('quiz_creator.errors.quiz_load'), error);
      setError(t('quiz_creator.errors.quiz_load_message'));
    } finally {
      setLoading(false);
    }
  };

  // 과정 선택 변경 핸들러
  const handleCourseChange = (selectedOption: any) => {
    setSelectedCourse(selectedOption);

    // 과정 선택 시 제목 자동 업데이트
    if (selectedOption) {
      setQuizMeta(prev => ({
        ...prev,
        title: `\${selectedOption.label} \${
          quizType === 'post' ? t('quiz_creator.post_quiz') : t('quiz_creator.pre_quiz')
        }`
      }));
    }
  };

  // 퀴즈 타입 변경 핸들러
  const handleQuizTypeChange = (type: 'pre' | 'post') => {
    setQuizType(type);

    // 퀴즈 타입 변경 시 제목 자동 업데이트
    if (selectedCourse) {
      setQuizMeta(prev => ({
        ...prev,
        title: `\${selectedCourse.label} \${
          type === 'post' ? t('quiz_creator.post_quiz') : t('quiz_creator.pre_quiz')
        }`
      }));
    }
  };

  // 퀴즈 메타데이터 업데이트
  const handleMetaChange = (key: keyof QuizMeta, value: any) => {
    setQuizMeta(prev => ({ ...prev, [key]: value }));
  };

  // 새 질문 추가 시작
  const handleAddQuestion = () => {
    setCurrentQuestion({
      id: uuidv4(),
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
    });
    setIsEditingQuestion(true);
    setEditingIndex(-1);
  };

  // 기존 질문 편집 시작
  const handleEditQuestion = (index: number) => {
    setCurrentQuestion({ ...questions[index] });
    setIsEditingQuestion(true);
    setEditingIndex(index);
  };

  // 질문 삭제
  const handleDeleteQuestion = (index: number) => {
    if (window.confirm(tString('quiz_creator.confirm_delete_question'))) {
      const newQuestions = [...questions];
      newQuestions.splice(index, 1);
      setQuestions(newQuestions);
    }
  };

  // 질문 편집 취소
  const handleCancelEdit = () => {
    setCurrentQuestion(null);
    setIsEditingQuestion(false);
    setEditingIndex(-1);
  };

  // 질문 저장
  const handleSaveQuestion = () => {
    if (!currentQuestion) return;

    // 질문 유효성 검사
    if (!currentQuestion.question.trim()) {
      setError(t('quiz_creator.validation.question_required'));
      return;
    }

    // 옵션 유효성 검사
    if (currentQuestion.options.some(opt => !opt.trim())) {
      setError(t('quiz_creator.validation.options_required'));
      return;
    }

    const newQuestions = [...questions];

    if (editingIndex >= 0) {
      // 기존 질문 수정
      newQuestions[editingIndex] = { ...currentQuestion };
    } else {
      // 새 질문 추가
      newQuestions.push({ ...currentQuestion });
    }

    setQuestions(newQuestions);
    setCurrentQuestion(null);
    setIsEditingQuestion(false);
    setEditingIndex(-1);
    setError(null);
  };

  // 옵션 수정
  const handleOptionChange = (index: number, value: string) => {
    if (!currentQuestion) return;

    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;

    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions
    });
  };

  // 옵션 추가
  const handleAddOption = () => {
    if (!currentQuestion) return;

    setCurrentQuestion({
      ...currentQuestion,
      options: [...currentQuestion.options, '']
    });
  };

  // 옵션 삭제
  const handleRemoveOption = (index: number) => {
    if (!currentQuestion || currentQuestion.options.length <= 2) return;

    const newOptions = [...currentQuestion.options];
    newOptions.splice(index, 1);

    // 정답 인덱스 조정
    let newCorrectAnswer = currentQuestion.correctAnswer;
    if (typeof newCorrectAnswer === 'number') {
      if (newCorrectAnswer === index) {
        newCorrectAnswer = 0;
      } else if (newCorrectAnswer > index) {
        newCorrectAnswer = newCorrectAnswer - 1;
      }
    }

    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions,
      correctAnswer: newCorrectAnswer
    });
  };

  // 파일에서 문제 임포트 처리
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsFileImporting(true);
    setFileImportProgress(0);

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;

        // 파일 형식에 따라 다른 파싱 로직 적용
        let parsedQuestions: Question[] = [];

        if (file.name.endsWith('.json')) {
          parsedQuestions = JSON.parse(content);
        } else if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
          // CSV/TXT 파싱 로직 (간단한 형식 가정)
          const lines = content.split('\n');

          for (let i = 0; i < lines.length; i += 6) {
            if (i + 5 >= lines.length) break;

            const question = lines[i].trim();
            const options = [
              lines[i + 1].trim(),
              lines[i + 2].trim(),
              lines[i + 3].trim(),
              lines[i + 4].trim()
            ];
            const correctAnswer = parseInt(lines[i + 5].trim()) - 1;

            if (question && options.every(opt => opt) && !isNaN(correctAnswer)) {
              parsedQuestions.push({
                id: uuidv4(),
                question,
                options,
                correctAnswer
              });
            }
          }
        }

        // 진행 상황 100%로 설정
        setFileImportProgress(100);

        // 가져온 질문 추가
        setQuestions(prev => [...prev, ...parsedQuestions]);

        setTimeout(() => {
          setIsFileImporting(false);
          setShowImportModal(false);
        }, 1000);

      } catch (error) {
        console.error(t('quiz_creator.errors.file_import'), error);
        setError(t('quiz_creator.errors.file_import_message'));
        setIsFileImporting(false);
        setShowImportModal(false);
      }
    };

    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        const percentLoaded = Math.round((e.loaded / e.total) * 100);
        setFileImportProgress(percentLoaded);
      }
    };

    reader.readAsText(file);
  };

  // AI로 문제 생성
  const handleGenerateQuestions = async () => {
    if (!selectedCourse) {
      setError(t('quiz_creator.validation.course_required'));
      return;
    }

    setGeneratingQuestions(true);
    setError(null);

    try {
      const questions = await generateQuizFromContent({
        courseId: selectedCourse.value,
        quizType,
        modelType: aiModelType,
        questionCount: aiQuestionCount,
        contextPrompt: aiContextPrompt
      });

      setGeneratedQuestions(questions);
    } catch (error) {
      console.error(t('quiz_creator.errors.ai_generation'), error);
      setError(t('quiz_creator.errors.ai_generation_message'));
    } finally {
      setGeneratingQuestions(false);
    }
  };

  // 생성된 문제 추가
  const handleAddGeneratedQuestions = () => {
    setQuestions(prev => [...prev, ...generatedQuestions]);
    setShowAiGenerationModal(false);
    setGeneratedQuestions([]);
  };

  // 퀴즈 저장
  const handleSaveQuiz = async () => {
    // 유효성 검사
    if (!selectedCourse) {
      setError(t('quiz_creator.validation.course_required'));
      return;
    }

    if (questions.length === 0) {
      setError(t('quiz_creator.validation.min_question_required'));
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // 저장할 퀴즈 데이터 구성
      const quizData: Partial<Quiz> = {
        id: editingQuizId || uuidv4(),
        courseId: selectedCourse.value,
        courseName: selectedCourse.label,
        quizType,
        title: quizMeta.title,
        description: quizMeta.description,
        timeLimit: quizMeta.timeLimit,
        passScore: quizMeta.passScore,
        shuffleQuestions: quizMeta.shuffleQuestions,
        shuffleOptions: quizMeta.shuffleOptions,
        showFeedback: quizMeta.showFeedback,
        questions,
        questionCount: questions.length
      };

      // 수정된 Gen 2 API 호출
      let result;
      if (isEditMode) {
        result = await updateQuiz(quizData);
      } else {
        result = await createQuiz(quizData);
      }

      if (result.errors) {
        throw new Error(result.errors.toString());
      }

      setShowSaveModal(true);
    } catch (error) {
      console.error(t('quiz_creator.errors.save_error'), error);
      setError(t('quiz_creator.errors.save_error_message'));
    } finally {
      setSaving(false);
    }
  };

  // 퀴즈 관리 페이지로 돌아가기
  const handleReturn = () => {
    navigate('/instructor/assessments/quiz-list');
  };

  return (
      <SpaceBetween size="l">
        {error && <Alert type="error">{error}</Alert>}

        {/* 과정 선택 섹션 */}
        <Container header={<Header variant="h2">{t('quiz_creator.course_selection.title')}</Header>}>
          <SpaceBetween size="l">
            <FormField label={t('quiz_creator.course_selection.course')}>
              <Select
                placeholder={tString('quiz_creator.course_selection.placeholder')}
                selectedOption={selectedCourse}
                onChange={({ detail }) => handleCourseChange(detail.selectedOption)}
                options={courses.map(course => ({
                  label: course.title,
                  value: course.catalogId,
                  description: course.description
                }))}
                statusType={loading ? 'loading' : 'finished'}
                loadingText={tString('quiz_creator.loading.courses')}
                disabled={isEditMode}
                empty={
                  <Box textAlign="center" color="inherit">
                    <b>{t('quiz_creator.course_selection.no_courses')}</b>
                    <Box padding={{ bottom: "xs" }}>
                      {t('quiz_creator.course_selection.create_course')}
                    </Box>
                  </Box>
                }
              />
            </FormField>

            <FormField label={t('quiz_creator.quiz_type_selection.label')}>
              <SpaceBetween direction="horizontal" size="xs">
                <Button
                  variant={quizType === 'pre' ? 'primary' : 'normal'}
                  onClick={() => handleQuizTypeChange('pre')}
                  disabled={isEditMode}
                >
                  {t('quiz_creator.pre_quiz')}
                </Button>
                <Button
                  variant={quizType === 'post' ? 'primary' : 'normal'}
                  onClick={() => handleQuizTypeChange('post')}
                  disabled={isEditMode}
                >
                  {t('quiz_creator.post_quiz')}
                </Button>
              </SpaceBetween>
            </FormField>
          </SpaceBetween>
        </Container>

        {/* 퀴즈 메타데이터 */}
        <Container header={<Header variant="h2">{t('quiz_creator.sections.quiz_info')}</Header>}>
          <SpaceBetween size="l">
            <FormField
              label={t('quiz_creator.meta.title_label')}
              constraintText={t('common.required')}
            >
              <Input
                value={quizMeta.title}
                onChange={({ detail }) => handleMetaChange('title', detail.value)}
                placeholder={tString('quiz_creator.meta.title_placeholder')}
              />
            </FormField>

            <FormField label={t('quiz_creator.meta.description_label')}>
              <Textarea
                value={quizMeta.description}
                onChange={({ detail }) => handleMetaChange('description', detail.value)}
                placeholder={tString('quiz_creator.meta.description_placeholder')}
              />
            </FormField>

            <ColumnLayout columns={2} variant="text-grid">
              <FormField label={t('quiz_creator.meta.time_limit')}>
                <Input
                  type="number"
                  value={quizMeta.timeLimit.toString()}
                  onChange={({ detail }) => {
                    const value = parseInt(detail.value) || 0;
                    const validValue = Math.max(0, value);
                    handleMetaChange('timeLimit', validValue);
                  }}
                  step={5}
                />
              </FormField>

              <FormField label={t('quiz_creator.meta.pass_score')}>
                <Input
                  type="number"
                  value={quizMeta.passScore.toString()}
                  onChange={({ detail }) => {
                    const value = parseInt(detail.value) || 0;
                    const validValue = Math.min(100, Math.max(0, value));
                    handleMetaChange('passScore', validValue);
                  }}
                  step={5}
                />
              </FormField>
            </ColumnLayout>

            <SpaceBetween size="s" direction="horizontal">
              <Checkbox
                checked={quizMeta.shuffleQuestions}
                onChange={({ detail }) => handleMetaChange('shuffleQuestions', detail.checked)}
              >
                {t('quiz_creator.meta.shuffle_questions')}
              </Checkbox>

              <Checkbox
                checked={quizMeta.shuffleOptions}
                onChange={({ detail }) => handleMetaChange('shuffleOptions', detail.checked)}
              >
                {t('quiz_creator.meta.shuffle_options')}
              </Checkbox>

              <Checkbox
                checked={quizMeta.showFeedback}
                onChange={({ detail }) => handleMetaChange('showFeedback', detail.checked)}
              >
                {t('quiz_creator.meta.show_feedback')}
              </Checkbox>
            </SpaceBetween>
          </SpaceBetween>
        </Container>

        {/* 질문 목록 */}
        <Container
          header={
            <Header
              variant="h2"
              actions={
                <SpaceBetween direction="horizontal" size="xs">
                  <Button onClick={() => setShowImportModal(true)} iconName="upload">
                    {t('quiz_creator.actions.import_questions')}
                  </Button>
                  <Button onClick={() => setShowAiGenerationModal(true)} iconName="file-open">
                    {t('quiz_creator.actions.ai_generate')}
                  </Button>
                  <Button onClick={handleAddQuestion} iconName="add-plus">
                    {t('quiz_creator.actions.add_question')}
                  </Button>
                </SpaceBetween>
              }
            >
              {t('quiz_creator.sections.questions_count', { count: questions.length })}
            </Header>
          }
        >
          {questions.length > 0 ? (
            <>
              <Table
                items={questions}
                columnDefinitions={[
                  {
                    id: "index",
                    header: "#",
                    cell: (item: Question) => {
                      // items 배열에서 인덱스를 직접 계산
                      const index = questions.findIndex(q => q.id === item.id);
                      return index + 1;
                    },
                    width: 50
                  },
                  {
                    id: "question",
                    header: t('quiz_creator.labels.question'),
                    cell: item => item.question
                  },
                  {
                    id: "options",
                    header: t('quiz_creator.labels.options'),
                    cell: (item: Question) => (
                      <ul>
                        {item.options.map((opt: string, idx: number) => (
                          <li key={idx}>
                            {opt} {idx === item.correctAnswer || opt === item.correctAnswer ?
                              `(\${t('quiz_creator.labels.correct')})` : ''}
                          </li>
                        ))}
                      </ul>
                    ),
                    width: 300
                  },
                  {
                    id: "actions",
                    header: t('common.actions'),
                    cell: (item: Question) => {
                      const index = questions.findIndex(q => q.id === item.id); // Assuming you have an id field

                      return (
                        <SpaceBetween direction="horizontal" size="xs">
                          <Button iconName="edit" onClick={() => handleEditQuestion(index)}>
                            {t('common.edit')}
                          </Button>
                          <Button iconName="remove" onClick={() => handleDeleteQuestion(index)}>
                            {t('common.delete')}
                          </Button>
                        </SpaceBetween>
                      );
                    },
                    width: 200
                  }
                ]}
                trackBy="id"
                empty={
                  <Box textAlign="center" color="inherit">
                    <b>{t('quiz_creator.empty_states.no_questions')}</b>
                    <Box padding={{ bottom: "s" }}>
                      {t('quiz_creator.empty_states.add_instructions')}
                    </Box>
                    <Button onClick={handleAddQuestion} iconName="add-plus">
                      {t('quiz_creator.actions.add_question')}
                    </Button>
                  </Box>
                }
                header={<Header>{t('quiz_creator.sections.question_list')}</Header>}
                stickyHeader={true}
              />
            </>
          ) : (
            <Box textAlign="center" color="inherit">
              <b>{t('quiz_creator.empty_states.no_questions')}</b>
              <Box padding={{ bottom: "s" }}>
                {t('quiz_creator.empty_states.add_instructions')}
              </Box>
              <Button onClick={handleAddQuestion} iconName="add-plus">
                {t('quiz_creator.actions.add_question')}
              </Button>
            </Box>
          )}
        </Container>

        {/* 하단 버튼 */}
        <SpaceBetween direction="horizontal" size="xs" alignItems="center">
          <Button onClick={handleReturn} variant="link">
            {t('quiz_creator.actions.cancel_return')}
          </Button>
          <Button
            onClick={handleSaveQuiz}
            variant="primary"
            loading={saving}
          >
            {isEditMode ?
              t('quiz_creator.actions.update_quiz') :
              t('quiz_creator.actions.save_quiz')
            }
          </Button>
        </SpaceBetween>

        {/* 질문 편집 모달 */}
        <Modal
          visible={isEditingQuestion}
          onDismiss={handleCancelEdit}
          header={editingIndex >= 0 ?
            t('quiz_creator.modal.edit_question') :
            t('quiz_creator.modal.add_question')}
          size="large"
        >
          {currentQuestion && (
            <SpaceBetween size="l">
              <FormField
                label={t('quiz_creator.labels.question')}
                constraintText={t('common.required')}
              >
                <Textarea
                  value={currentQuestion.question}
                  onChange={({ detail }) =>
                    setCurrentQuestion({
                      ...currentQuestion,
                      question: detail.value
                    })
                  }
                  placeholder={tString('quiz_creator.placeholders.question')}
                />
              </FormField>

              <FormField label={t('quiz_creator.labels.explanation')}>
                <Textarea
                  value={currentQuestion.explanation || ''}
                  onChange={({ detail }) =>
                    setCurrentQuestion({
                      ...currentQuestion,
                      explanation: detail.value
                    })
                  }
                  placeholder={tString('quiz_creator.placeholders.explanation')}
                />
              </FormField>

              <FormField
                label={t('quiz_creator.labels.options')}
                constraintText={t('common.required')}
              >
                <SpaceBetween size="xs">
                  {currentQuestion.options.map((option, index) => (
                    <SpaceBetween direction="horizontal" size="xs" key={index}>
                      <Input
                        value={option}
                        onChange={({ detail }) => handleOptionChange(index, detail.value)}
                        placeholder={tString('quiz_creator.placeholders.option', { number: index + 1 })}
                      />

                      <RadioGroup
                        items={[
                          { value: index.toString(), label: t('quiz_creator.labels.correct') }
                        ]}
                        value={currentQuestion.correctAnswer === index ? index.toString() : ''}
                        onChange={({ detail }) =>
                          setCurrentQuestion({
                            ...currentQuestion,
                            correctAnswer: parseInt(detail.value)
                          })
                        }
                      />

                      <Button
                        iconName="remove"
                        variant="icon"
                        disabled={currentQuestion.options.length <= 2}
                        onClick={() => handleRemoveOption(index)}
                      />
                    </SpaceBetween>
                  ))}

                  <Button
                    iconName="add-plus"
                    onClick={handleAddOption}
                    disabled={currentQuestion.options.length >= 6}
                  >
                    {t('quiz_creator.actions.add_option')}
                  </Button>
                </SpaceBetween>
              </FormField>

              <FormField label={t('quiz_creator.labels.difficulty')}>
                <Select
                  selectedOption={
                    currentQuestion.difficulty ?
                      { label: currentQuestion.difficulty, value: currentQuestion.difficulty } :
                      null
                  }
                  onChange={({ detail }) => setCurrentQuestion({
                    ...currentQuestion,
                    difficulty: detail.selectedOption?.value
                  })}
                  options={[
                    { label: tString('quiz_creator.difficulty.easy'), value: 'easy' },
                    { label: tString('quiz_creator.difficulty.medium'), value: 'medium' },
                    { label: tString('quiz_creator.difficulty.hard'), value: 'hard' }
                  ]}
                  placeholder={tString('quiz_creator.placeholders.select_difficulty')}
                />
              </FormField>

              <FormField label={t('quiz_creator.labels.tags')}>
                <Input
                  value={(currentQuestion.tags || []).join(', ')}
                  onChange={({ detail }) => setCurrentQuestion({
                    ...currentQuestion,
                    tags: detail.value.split(',').map(t => t.trim())
                  })}
                  placeholder={tString('quiz_creator.placeholders.tags')}
                />
                <Box color="text-status-info" fontSize="body-s" padding={{ top: "xxxs" }}>
                  {t('quiz_creator.hints.tags')}
                </Box>
              </FormField>

              <SpaceBetween direction="horizontal" size="xs" alignItems="center">
                <Button onClick={handleCancelEdit} variant="link">
                  {t('quiz_creator.actions.cancel')}
                </Button>
                <Button onClick={handleSaveQuestion} variant="primary">
                  {editingIndex >= 0 ?
                    t('quiz_creator.actions.save_question') :
                    t('quiz_creator.actions.add_question')}
                </Button>
              </SpaceBetween>
            </SpaceBetween>
          )}
        </Modal>

        {/* 저장 완료 모달 */}
        <Modal
          visible={showSaveModal}
          onDismiss={() => {
            setShowSaveModal(false);
            handleReturn();
          }}
          header={t('quiz_creator.modal.save_success')}
          footer={
            <Box float="right">
              <SpaceBetween direction="horizontal" size="xs">
                <Button onClick={handleReturn} variant="primary">
                  {t('quiz_creator.actions.return_to_management')}
                </Button>
              </SpaceBetween>
            </Box>
          }
        >
          <p>{isEditMode ?
            t('quiz_creator.messages.update_success') :
            t('quiz_creator.messages.save_success')}
          </p>
        </Modal>

        {/* 파일 임포트 모달 */}
        <Modal
          visible={showImportModal}
          onDismiss={() => setShowImportModal(false)}
          header={t('quiz_creator.modal.import_questions')}
          size="medium"
        >
          <SpaceBetween size="l">
            <Box>
              <p>{t('quiz_creator.import.description')}</p>
              <ul>
                <li>{t('quiz_creator.import.format_json')}</li>
                <li>{t('quiz_creator.import.format_csv')}</li>
                <li>{t('quiz_creator.import.format_txt')}</li>
              </ul>
            </Box>

            {isFileImporting ? (
              <Box textAlign="center">
                <ProgressBar
                  value={fileImportProgress}
                  description={t('quiz_creator.import.processing')}
                  label={t('quiz_creator.import.loading')}
                />
              </Box>
            ) : (
              <SpaceBetween size="s">
                <input
                  type="file"
                  accept=".json,.csv,.txt"
                  onChange={handleFileImport}
                  style={{ display: 'none' }}
                  id="file-upload-input"
                />
                <label htmlFor="file-upload-input">
                  <Button iconName="upload" fullWidth>
                    {t('quiz_creator.import.select_file')}
                  </Button>
                </label>
                <Box color="text-status-info" fontSize="body-s" textAlign="center">
                  {t('quiz_creator.import.supported_formats')}
                </Box>
              </SpaceBetween>
            )}

            <Box float="right">
              <Button onClick={() => setShowImportModal(false)}>
                {t('common.cancel')}
              </Button>
            </Box>
          </SpaceBetween>
        </Modal>

        {/* AI 문제 생성 모달 */}
        <Modal
          visible={showAiGenerationModal}
          onDismiss={() => setShowAiGenerationModal(false)}
          header={t('quiz_creator.modal.ai_generation')}
          size="large"
        >
          {generatingQuestions ? (
            <Box textAlign="center" padding="l">
              <Spinner />
              <p>{t('quiz_creator.ai.generating')}</p>
            </Box>
          ) : (
            <SpaceBetween size="l">
              {error && <Alert type="error">{error}</Alert>}

              <FormField label={t('quiz_creator.ai.model_type')}>
                <SpaceBetween direction="horizontal" size="xs">
                  <Button
                    variant={aiModelType === 'basic' ? 'primary' : 'normal'}
                    onClick={() => setAiModelType('basic')}
                  >
                    {t('quiz_creator.ai.model_basic')}
                  </Button>
                  <Button
                    variant={aiModelType === 'advanced' ? 'primary' : 'normal'}
                    onClick={() => setAiModelType('advanced')}
                  >
                    {t('quiz_creator.ai.model_advanced')}
                  </Button>
                </SpaceBetween>
                <Box color="text-status-info" fontSize="body-s" padding={{ top: "xxxs" }}>
                  {aiModelType === 'advanced' ?
                    t('quiz_creator.ai.model_advanced_description') :
                    t('quiz_creator.ai.model_basic_description')}
                </Box>
              </FormField>

              <FormField label={t('quiz_creator.ai.question_count')}>
                <Input
                  type="number"
                  value={aiQuestionCount.toString()}
                  onChange={({ detail }) => {
                    const value = parseInt(detail.value) || 1;
                    setAiQuestionCount(Math.min(Math.max(1, value), 20));
                  }}
                  step={1}
                />
                <Box color="text-status-info" fontSize="body-s" padding={{ top: "xxxs" }}>
                  {t('quiz_creator.ai.question_count_hint')}
                </Box>
              </FormField>

              <FormField
                label={t('quiz_creator.ai.context')}
                description={t('quiz_creator.ai.context_description')}
              >
                <Textarea
                  value={aiContextPrompt}
                  onChange={({ detail }) => setAiContextPrompt(detail.value)}
                  placeholder={tString('quiz_creator.ai.context_placeholder')}
                  rows={4}
                />
              </FormField>

              {generatedQuestions.length > 0 ? (
                <>
                  <Box>{t('quiz_creator.ai.generated_count', { count: generatedQuestions.length })}</Box>

                  <Table
                    items={generatedQuestions}
                    columnDefinitions={[
                      {
                        id: "question",
                        header: t('quiz_creator.labels.question'),
                        cell: item => item.question
                      },
                      {
                        id: "options",
                        header: t('quiz_creator.labels.options'),
                        cell: item => (
                          <ul>
                            {item.options.map((opt, idx) => (
                              <li key={idx}>
                                {opt} {idx === item.correctAnswer || opt === item.correctAnswer ?
                                  `(\${t('quiz_creator.labels.correct')})` : ''}
                              </li>
                            ))}
                          </ul>
                        )
                      },
                      {
                        id: "quality",
                        header: t('quiz_creator.ai.quality'),
                        cell: item => (
                          <Box color={
                            (item.quality ?? 0) >= 0.8 ? "text-status-success" :
                              (item.quality ?? 0) >= 0.6 ? "text-status-info" :
                                "text-status-warning"
                          }>
                            {(item.quality ?? 0) >= 0.8 ? t('quiz_creator.ai.quality_high') :
                              (item.quality ?? 0) >= 0.6 ? t('quiz_creator.ai.quality_medium') :
                                t('quiz_creator.ai.quality_low')}
                          </Box>
                        ),
                        width: 100
                      }
                    ]}
                    selectionType="multi"
                    trackBy="id"
                    empty={
                      <Box textAlign="center">{t('quiz_creator.ai.no_questions')}</Box>
                    }
                  />

                  <SpaceBetween direction="horizontal" size="xs">
                    <Button onClick={() => handleGenerateQuestions()}>
                      {t('quiz_creator.ai.regenerate')}
                    </Button>
                    <Button onClick={() => setShowAiGenerationModal(false)}>
                      {t('common.cancel')}
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleAddGeneratedQuestions}
                      disabled={generatedQuestions.length === 0}
                    >
                      {t('quiz_creator.ai.add_questions')}
                    </Button>
                  </SpaceBetween>
                </>
              ) : (
                <SpaceBetween direction="horizontal" size="xs">
                  <Button onClick={() => setShowAiGenerationModal(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleGenerateQuestions}
                  >
                    {t('quiz_creator.ai.generate_questions')}
                  </Button>
                </SpaceBetween>
              )}
            </SpaceBetween>
          )}
        </Modal>
      </SpaceBetween>
  );
}