// src/pages/instructor/surveys/SurveyCreate.tsx
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Header, 
  SpaceBetween,
  FormField,
  Input,
  Button,
  Textarea,
  Box,
  RadioGroup,
  Checkbox,
  Alert,
  Modal,
  ColumnLayout,
  Select
} from '@cloudscape-design/components';
import { useLocation, useNavigate } from 'react-router-dom';
import { post } from 'aws-amplify/api';
import Table from "@cloudscape-design/components/table";
import { useTypedTranslation } from '../../../utils/i18n-utils';

// 타입 정의
interface Question {
  id?: string;
  question: string;
  options: string[];
  type: 'multiple' | 'single' | 'text'; // 다중 선택, 단일 선택, 주관식
}

interface SurveyMeta {
  title: string;
  description: string;
  timeLimit: number; // 분 단위
  isRequired: boolean;
  shuffleQuestions: boolean;
  anonymous: boolean;
}

interface LocationState {
  courseId: string;
  courseName: string;
  surveyType: 'pre' | 'post';
  initialQuestions?: Question[];
}

export default function SurveyCreator() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const { t, tString } = useTypedTranslation();
  
  // 상태가 없으면 리디렉션
  useEffect(() => {
    if (!state?.courseId) {
      navigate('/instructor/assessments/survey');
    }
  }, [state, navigate]);

  // 기본값 설정
  const initialMeta: SurveyMeta = {
    title: t('surveyCreator.default_title', {
      course: state?.courseName || t('surveyCreator.course'),
      type: state?.surveyType === 'pre' ? t('survey.pre') : t('survey.post')
    }),
    description: t('surveyCreator.default_description'),
    timeLimit: 15,
    isRequired: true,
    shuffleQuestions: false,
    anonymous: true
  };

  // 상태 관리
  const [surveyMeta, setSurveyMeta] = useState<SurveyMeta>(initialMeta);
  const [questions, setQuestions] = useState<Question[]>(state?.initialQuestions || []);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // 설문조사 메타데이터 업데이트
  const handleMetaChange = (key: keyof SurveyMeta, value: any) => {
    setSurveyMeta(prev => ({ ...prev, [key]: value }));
  };

  // 새 질문 추가 시작
  const handleAddQuestion = () => {
    setCurrentQuestion({
      question: '',
      options: ['', ''],
      type: 'single'
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
      alert(t('surveyCreator.alerts.enter_question'));
      return;
    }

    // 유형이 선택형인 경우 옵션 검사
    if (currentQuestion.type !== 'text' && 
        currentQuestion.options.some(opt => !opt.trim())) {
      alert(t('surveyCreator.alerts.enter_all_options'));
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
    
    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions
    });
  };

  // 질문 유형 변경
  const handleQuestionTypeChange = (type: 'multiple' | 'single' | 'text') => {
    if (!currentQuestion) return;
    
    let options = currentQuestion.options;
    
    // 텍스트 유형으로 변경할 경우 옵션 초기화
    if (type === 'text') {
      options = [];
    } 
    // 텍스트에서 선택형으로 변경할 경우 기본 옵션 추가
    else if (currentQuestion.type === 'text' && options.length < 2) {
      options = ['', ''];
    }
    
    setCurrentQuestion({
      ...currentQuestion,
      type,
      options
    });
  };

  // 설문조사 저장
  const handleSaveSurvey = async () => {
    if (questions.length === 0) {
      alert(t('surveyCreator.alerts.min_questions'));
      return;
    }

    setSaving(true);
    setSaveError(null);
    
    try {
      const surveyData = {
        courseId: state.courseId,
        surveyType: state.surveyType || 'pre',
        meta: surveyMeta,
        questions: questions
      };
      
      await post({
        apiName: 'surveyApi',
        path: '/save-survey',
        options: {
          body: JSON.stringify(surveyData)
        }
      });
      
      setShowSaveModal(true);
    } catch (error) {
      console.error(t('surveyCreator.errors.save_error'), error);
      setSaveError(t('surveyCreator.errors.save_error_message'));
    } finally {
      setSaving(false);
    }
  };

  // 설문조사 관리 페이지로 돌아가기
  const handleReturn = () => {
    navigate('/instructor/assessments/survey');
  };
  
  // 테이블에서 옵션 변경 처리를 위한 함수
  const updateQuestionOptions = (questionIndex: number, options: string[]) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      options
    };
    setQuestions(updatedQuestions);
  };
  
  return (
    <SpaceBetween size="l">
      {/* 설문조사 메타데이터 */}
      <Container header={<Header variant="h2">{t('surveyCreator.survey_info')}</Header>}>
        <SpaceBetween size="l">
          <FormField label={t('surveyCreator.survey_title')}>
            <Input
              value={surveyMeta.title}
              onChange={({ detail }) => handleMetaChange('title', detail.value)}
              placeholder={tString('surveyCreator.enter_survey_title')}
            />
          </FormField>
          
          <FormField label={t('surveyCreator.description')}>
            <Textarea
              value={surveyMeta.description}
              onChange={({ detail }) => handleMetaChange('description', detail.value)}
              placeholder={tString('surveyCreator.enter_survey_description')}
            />
          </FormField>
          
          <ColumnLayout columns={2} variant="text-grid">
            <FormField label={t('surveyCreator.time_limit')}>
              <Input
                type="number"
                value={surveyMeta.timeLimit.toString()}
                onChange={({ detail }) => {
                  const value = parseInt(detail.value) || 0;
                  const validValue = Math.max(0, value);
                  handleMetaChange('timeLimit', validValue);
                }}
                step={5}
              />
            </FormField>
            
            <SpaceBetween size="s">
              <Checkbox
                checked={surveyMeta.isRequired}
                onChange={({ detail }) => detail && handleMetaChange('isRequired', detail.checked)}
              >
                {t('surveyCreator.required_response')}
              </Checkbox>
              
              <Checkbox
                checked={surveyMeta.anonymous}
                onChange={({ detail }) => detail && handleMetaChange('anonymous', detail.checked)}
              >
                {t('surveyCreator.allow_anonymous')}
              </Checkbox>
            </SpaceBetween>
          </ColumnLayout>
          
          <Checkbox
            checked={surveyMeta.shuffleQuestions}
            onChange={({ detail }) => detail && handleMetaChange('shuffleQuestions', detail.checked)}
          >
            {t('surveyCreator.shuffle_questions')}
          </Checkbox>
        </SpaceBetween>
      </Container>
      
      {/* 질문 목록 */}
      <Container 
        header={
          <Header
            variant="h2"
            actions={
              <Button onClick={handleAddQuestion} iconName="add-plus">
                {t('surveyCreator.add_question')}
              </Button>
            }
          >
            {t('surveyCreator.survey_questions', { count: questions.length })}
          </Header>
        }
      >
        {questions.length > 0 ? (
          <Table
            items={questions}
            loading={false}
            loadingText={tString('surveyCreator.loading_questions')}
            columnDefinitions={[
              {
                id: "question",
                header: t('surveyCreator.columns.question'),
                cell: (item: Question) => item.question,
                editConfig: {
                  ariaLabel: tString('surveyCreator.columns.question'),
                  editIconAriaLabel: tString('surveyCreator.editable'),
                  editingCell: (item: Question, { currentValue, setValue }) => (
                    <Textarea
                      autoFocus={true}
                      value={currentValue ?? item.question}
                      onChange={event => event.detail && setValue(event.detail.value)}
                    />
                  )
                }
              },
              {
                id: "type",
                header: t('surveyCreator.columns.type'),
                cell: (item: Question) => 
                  item.type === 'single' ? t('survey.question_types.single') : 
                  item.type === 'multiple' ? t('survey.question_types.multiple') : 
                  t('survey.question_types.text'),
                editConfig: {
                  ariaLabel: tString('surveyCreator.columns.type'),
                  editIconAriaLabel: tString('surveyCreator.editable'),
                  editingCell: (item: Question, { currentValue, setValue }) => (
                    <Select
                      autoFocus={true}
                      selectedOption={
                        [
                          { label: t('survey.question_types.single'), value: "single" },
                          { label: t('survey.question_types.multiple'), value: "multiple" },
                          { label: t('survey.question_types.text'), value: "text" }
                        ].find(option => 
                          option.value === (currentValue || item.type)
                        ) || null
                      }
                      onChange={event => {
                        if (!event.detail?.selectedOption?.value) return;
                        
                        const newType = event.detail.selectedOption.value as 'multiple' | 'single' | 'text';
                        setValue(newType);
                        
                        // 주관식으로 변경 시 옵션 초기화
                        if (newType === 'text') {
                          const questionIndex = questions.findIndex(q => q === item);
                          if (questionIndex >= 0) {
                            const updatedQuestions = [...questions];
                            updatedQuestions[questionIndex] = {
                              ...updatedQuestions[questionIndex],
                              options: []
                            };
                            setQuestions(updatedQuestions);
                          }
                        }
                      }}
                      options={[
                        { label: tString('survey.question_types.single'), value: "single" },
                        { label: tString('survey.question_types.multiple'), value: "multiple" },
                        { label: tString('survey.question_types.text'), value: "text" }
                      ]}
                    />
                  )
                }
              },
              {
                id: "options",
                header: t('surveyCreator.columns.options'),
                cell: (item: Question) => 
                  item.type === 'text' ? 
                  t('surveyCreator.text_response') : 
                  item.options.join(", "),
                editConfig: {
                  ariaLabel: tString('surveyCreator.columns.options'),
                  editIconAriaLabel: tString('surveyCreator.editable'),
                  disabledReason: (item: Question) => {
                    if (item.type === "text") {
                      return tString('surveyCreator.text_no_options');
                    }
                    return undefined;
                  },
                  editingCell: (item: Question, { currentValue, setValue }) => (
                    <Textarea
                      autoFocus={true}
                      value={currentValue ?? item.options.join("\n")}
                      placeholder={tString('surveyCreator.enter_options_per_line')}
                      onChange={event => event.detail && setValue(event.detail.value)}
                      
                      onBlur={event => {
                        if (!event.detail) return;
                        
                        // 타입 단언을 사용하여 detail.value가 있음을 명시
                        const detail = event.detail as { value: string };
                        
                        // 옵션을 배열로 변환
                        const options = detail.value
                          .split("\n")
                          .map((opt: string) => opt.trim())
                          .filter((opt: string) => opt.length > 0);
                          
                        const questionIndex = questions.findIndex(q => q === item);
                        if (questionIndex >= 0) {
                          updateQuestionOptions(questionIndex, options);
                        }
                      }}
                    />
                  )
                }
              },
              {
                id: "actions",
                header: t('surveyCreator.columns.actions'),
                cell: (item: Question) => (
                  <SpaceBetween direction="horizontal" size="xs">
                    <Button 
                      iconName="edit"
                      onClick={() => handleEditQuestion(questions.indexOf(item))}
                    >
                      {t('surveyCreator.actions.detailed_edit')}
                    </Button>
                    <Button 
                      iconName="remove"
                      onClick={() => handleDeleteQuestion(questions.indexOf(item))}
                    >
                      {t('common.delete')}
                    </Button>
                  </SpaceBetween>
                )
              }
            ]}
            empty={
              <Box textAlign="center" color="inherit">
                <b>{t('surveyCreator.no_questions')}</b>
                <Box padding={{ bottom: "s" }}>
                  {t('surveyCreator.add_question_prompt')}
                </Box>
                <Button onClick={handleAddQuestion} iconName="add-plus">
                  {t('surveyCreator.add_question')}
                </Button>
              </Box>
            }
            header={<Header>{t('surveyCreator.question_list')}</Header>}
          />
        ) : (
          <Box textAlign="center" color="inherit">
            <b>{t('surveyCreator.no_questions')}</b>
            <Box padding={{ bottom: "s" }}>
              {t('surveyCreator.add_question_prompt')}
            </Box>
            <Button onClick={handleAddQuestion} iconName="add-plus">
              {t('surveyCreator.add_question')}
            </Button>
          </Box>
        )}
      </Container>
      
      {/* 하단 버튼 */}
      <SpaceBetween direction="horizontal" size="xs" alignItems="center">
        <Button onClick={handleReturn} variant="link">
          {t('surveyCreator.cancel_and_return')}
        </Button>
        <Button 
          onClick={handleSaveSurvey}
          variant="primary"
          loading={saving}
        >
          {t('surveyCreator.save_survey')}
        </Button>
      </SpaceBetween>
      
      {saveError && <Alert type="error">{saveError}</Alert>}
      
      {/* 질문 편집 모달 */}
      <Modal
        visible={isEditingQuestion}
        onDismiss={handleCancelEdit}
        header={editingIndex >= 0 ? t('surveyCreator.edit_question') : t('surveyCreator.add_new_question')}
        size="large"
      >
        {currentQuestion && (
          <SpaceBetween size="l">
            <FormField label={t('surveyCreator.question')}>
              <Textarea
                value={currentQuestion.question}
                onChange={({ detail }) => detail && 
                  setCurrentQuestion({
                    ...currentQuestion,
                    question: detail.value
                  })
                }
                placeholder={tString('surveyCreator.enter_question_content')}
              />
            </FormField>
            
            <FormField label={t('surveyCreator.question_type')}>
              <RadioGroup
                items={[
                  { value: 'single', label: t('survey.question_types.single') },
                  { value: 'multiple', label: t('survey.question_types.multiple') },
                  { value: 'text', label: t('survey.question_types.text') }
                ]}
                value={currentQuestion.type}
                onChange={({ detail }) => detail && 
                  handleQuestionTypeChange(detail.value as 'multiple' | 'single' | 'text')
                }
              />
            </FormField>
            
            {currentQuestion.type !== 'text' && (
              <FormField label={t('surveyCreator.option_choices')}>
                <SpaceBetween size="xs">
                  {currentQuestion.options.map((option, index) => (
                    <SpaceBetween direction="horizontal" size="xs" key={index}>
                      <Input
                        value={option}
                        onChange={({ detail }) => detail && handleOptionChange(index, detail.value)}
                        placeholder={tString('surveyCreator.option_placeholder', { number: index + 1 })}
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
                    disabled={currentQuestion.options.length >= 10}
                  >
                    {t('surveyCreator.add_option')}
                  </Button>
                </SpaceBetween>
              </FormField>
            )}
            
            <SpaceBetween direction="horizontal" size="xs" alignItems="center">
              <Button onClick={handleCancelEdit} variant="link">
                {t('common.cancel')}
              </Button>
              <Button onClick={handleSaveQuestion} variant="primary">
                {editingIndex >= 0 ? t('surveyCreator.save_question') : t('surveyCreator.add_question')}
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
        header={t('surveyCreator.save_complete')}
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button onClick={handleReturn} variant="primary">
                {t('surveyCreator.return_to_management')}
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <p>{t('surveyCreator.save_success_message')}</p>
      </Modal>
    </SpaceBetween>
  );
}