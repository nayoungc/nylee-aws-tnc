import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Header, 
  SpaceBetween,
  FormField,
  Input,
  Button,
  Textarea,
  Cards,
  Box,
  RadioGroup,
  Checkbox,
  Alert,
  Modal,
  ColumnLayout
} from '@cloudscape-design/components';
import { useLocation, useNavigate } from 'react-router-dom';
import { post } from 'aws-amplify/api';
import { useTypedTranslation } from '../../utils/i18n-utils';

// 타입 정의
interface Question {
  id?: string;
  question: string;
  options: string[];
  correctAnswer: string | number;
}

interface QuizMeta {
  title: string;
  description: string;
  timeLimit: number; // 분 단위
  passScore: number; // 백분율
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showFeedback: boolean;
}

interface LocationState {
  courseId: string;
  courseName: string;
  quizType: 'pre' | 'post';
  initialQuestions?: Question[];
}

export default function QuizCreator() {
  const { t, tString } = useTypedTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  // 상태가 없으면 리디렉션
  useEffect(() => {
    if (!state?.courseId) {
      navigate('/instructor/assessments/quiz');
    }
  }, [state, navigate]);

  // 기본값 설정
  const initialMeta: QuizMeta = {
    title: `\${state?.courseName || t('quiz_creator.default_course')} \${state?.quizType === 'pre' ? t('quiz_creator.pre_quiz') : t('quiz_creator.post_quiz')}`,
    description: t('quiz_creator.default_description'),
    timeLimit: 30,
    passScore: 70,
    shuffleQuestions: true,
    shuffleOptions: false,
    showFeedback: true
  };

  // 상태 관리
  const [quizMeta, setQuizMeta] = useState<QuizMeta>(initialMeta);
  const [questions, setQuestions] = useState<Question[]>(state?.initialQuestions || []);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  // 퀴즈 메타데이터 업데이트
  const handleMetaChange = (key: keyof QuizMeta, value: any) => {
    setQuizMeta(prev => ({ ...prev, [key]: value }));
  };

  // 새 질문 추가 시작
  const handleAddQuestion = () => {
    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
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
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
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
      alert(t('quiz_creator.validation.question_required'));
      return;
    }

    // 옵션 유효성 검사
    if (currentQuestion.options.some(opt => !opt.trim())) {
      alert(t('quiz_creator.validation.options_required'));
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
    
    // 정답이 삭제되는 옵션이거나 그 이후의 옵션인 경우 정답 번호 조정
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

  // 퀴즈 저장
  const handleSaveQuiz = async () => {
    if (questions.length === 0) {
      alert(t('quiz_creator.validation.min_question_required'));
      return;
    }

    setSaving(true);
    setSaveError(null);
    
    try {
      const quizData = {
        courseId: state.courseId,
        quizType: state.quizType,
        meta: quizMeta,
        questions: questions
      };
      
      await post({
        apiName: 'quizApi',
        path: '/save-quiz',
        options: {
          body: JSON.stringify(quizData)
        }
      });
      
      setShowSaveModal(true);
    } catch (error) {
      console.error(t('quiz_creator.errors.save_error'), error);
      setSaveError(t('quiz_creator.errors.save_error_message'));
    } finally {
      setSaving(false);
    }
  };

  // 퀴즈 관리 페이지로 돌아가기
  const handleReturn = () => {
    navigate('/instructor/assessments/quiz');
  };
  
  return (
    <SpaceBetween size="l">
      {/* 퀴즈 메타데이터 */}
      <Container header={<Header variant="h2">{t('quiz_creator.sections.quiz_info')}</Header>}>
        <SpaceBetween size="l">
          <FormField label={t('quiz_creator.meta.title_label')}>
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
                  // 최소값 검증 로직 추가
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
                  // 최소값과 최대값 검증 로직 추가
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
              <Button onClick={handleAddQuestion} iconName="add-plus">
                {t('quiz_creator.actions.add_question')}
              </Button>
            }
          >
            {t('quiz_creator.sections.questions_count', { count: questions.length })}
          </Header>
        }
      >
        {questions.length > 0 ? (
          <>
            <Cards
              cardDefinition={{
                header: (item: Question) => {
                  const index = questions.findIndex(q => q === item);
                  return t('quiz_creator.question_number', { number: index + 1 });
                },
                sections: [
                  {
                    id: "question",
                    header: t('quiz_creator.labels.question'),
                    content: (item: Question) => item.question
                  },
                  {
                    id: "options",
                    header: t('quiz_creator.labels.options'),
                    content: (item: Question) => (
                      <ul>
                        {item.options.map((opt, idx) => (
                          <li key={idx}>
                            {opt} {idx === item.correctAnswer || opt === item.correctAnswer ? 
                              `(\${t('quiz_creator.labels.correct_answer')})` : ''}
                          </li>
                        ))}
                      </ul>
                    )
                  }
                ]
              }}
              cardsPerRow={[{ cards: 1 }, { minWidth: 500, cards: 2 }]}
              items={questions}
              loading={false}
              loadingText={tString('quiz_creator.loading.questions')}
              selectionType="single"
              selectedItems={selectedQuestion ? [selectedQuestion] : []}
              onSelectionChange={({ detail }) => {
                if (detail.selectedItems.length > 0) {
                  const selected = detail.selectedItems[0];
                  setSelectedQuestion(selected);
                  const index = questions.findIndex(q => q === selected);
                  if (index !== -1) {
                    handleEditQuestion(index);
                  }
                  setTimeout(() => setSelectedQuestion(null), 100);
                }
              }}
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
            
            {/* Cards 컴포넌트 아래에 안내 메시지 추가 */}
            <Box textAlign="right" padding={{ top: "s" }}>
              {t('quiz_creator.hints.click_to_edit')}
            </Box>
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
          {t('quiz_creator.actions.save_quiz')}
        </Button>
      </SpaceBetween>
      
      {saveError && <Alert type="error">{saveError}</Alert>}
      
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
            <FormField label={t('quiz_creator.labels.question')}>
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
            
            <FormField label={t('quiz_creator.labels.options')}>
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
        <p>{t('quiz_creator.messages.save_success')}</p>
      </Modal>
    </SpaceBetween>
  );
}