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
  
  // 상태가 없으면 리디렉션
  useEffect(() => {
    if (!state?.courseId) {
      navigate('/instructor/assessments/survey');
    }
  }, [state, navigate]);

  // 기본값 설정
  const initialMeta: SurveyMeta = {
    title: `\${state?.courseName || '과정'} \${state?.surveyType === 'pre' ? '사전' : '사후'} 설문조사`,
    description: '본 설문조사는 학습 과정에서의 의견과 경험을 수집하기 위한 도구입니다.',
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
      alert("질문 내용을 입력해주세요.");
      return;
    }

    // 유형이 선택형인 경우 옵션 검사
    if (currentQuestion.type !== 'text' && 
        currentQuestion.options.some(opt => !opt.trim())) {
      alert("모든 보기 옵션을 입력해주세요.");
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
      alert("최소 1개 이상의 질문이 필요합니다.");
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
      console.error('설문조사 저장 오류:', error);
      setSaveError('설문조사 저장 중 오류가 발생했습니다. 다시 시도해주세요.');
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
      <Container header={<Header variant="h2">설문조사 정보</Header>}>
        <SpaceBetween size="l">
          <FormField label="설문조사 제목">
            <Input
              value={surveyMeta.title}
              onChange={({ detail }) => handleMetaChange('title', detail.value)}
              placeholder="설문조사 제목을 입력하세요"
            />
          </FormField>
          
          <FormField label="설명">
            <Textarea
              value={surveyMeta.description}
              onChange={({ detail }) => handleMetaChange('description', detail.value)}
              placeholder="수강생에게 보여질 설문조사 설명을 입력하세요"
            />
          </FormField>
          
          <ColumnLayout columns={2} variant="text-grid">
            <FormField label="시간 제한 (분)">
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
                필수 응답 설문조사
              </Checkbox>
              
              <Checkbox
                checked={surveyMeta.anonymous}
                onChange={({ detail }) => detail && handleMetaChange('anonymous', detail.checked)}
              >
                익명 응답 허용
              </Checkbox>
            </SpaceBetween>
          </ColumnLayout>
          
          <Checkbox
            checked={surveyMeta.shuffleQuestions}
            onChange={({ detail }) => detail && handleMetaChange('shuffleQuestions', detail.checked)}
          >
            문항 순서 섞기
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
                질문 추가
              </Button>
            }
          >
            설문조사 문항 ({questions.length}개)
          </Header>
        }
      >
        {questions.length > 0 ? (
          <Table
            items={questions}
            loading={false}
            loadingText="질문을 불러오는 중..."
            columnDefinitions={[
              {
                id: "question",
                header: "질문",
                cell: (item: Question) => item.question,
                editConfig: {
                  ariaLabel: "질문",
                  editIconAriaLabel: "편집 가능",
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
                header: "유형",
                cell: (item: Question) => 
                  item.type === 'single' ? '단일 선택' : 
                  item.type === 'multiple' ? '다중 선택' : '주관식',
                editConfig: {
                  ariaLabel: "유형",
                  editIconAriaLabel: "편집 가능",
                  editingCell: (item: Question, { currentValue, setValue }) => (
                    <Select
                      autoFocus={true}
                      selectedOption={
                        [
                          { label: "단일 선택", value: "single" },
                          { label: "다중 선택", value: "multiple" },
                          { label: "주관식", value: "text" }
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
                        { label: "단일 선택", value: "single" },
                        { label: "다중 선택", value: "multiple" },
                        { label: "주관식", value: "text" }
                      ]}
                    />
                  )
                }
              },
              {
                id: "options",
                header: "보기 옵션",
                cell: (item: Question) => 
                  item.type === 'text' ? 
                  "주관식 응답" : 
                  item.options.join(", "),
                editConfig: {
                  ariaLabel: "보기 옵션",
                  editIconAriaLabel: "편집 가능",
                  disabledReason: (item: Question) => {
                    if (item.type === "text") {
                      return "주관식 질문은 보기 옵션이 필요하지 않습니다.";
                    }
                    return undefined;
                  },
                  editingCell: (item: Question, { currentValue, setValue }) => (
                    <Textarea
                      autoFocus={true}
                      value={currentValue ?? item.options.join("\n")}
                      placeholder="각 보기를 새 줄에 입력하세요"
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
                header: "작업",
                cell: (item: Question) => (
                  <SpaceBetween direction="horizontal" size="xs">
                    <Button 
                      iconName="edit"
                      onClick={() => handleEditQuestion(questions.indexOf(item))}
                    >
                      상세 편집
                    </Button>
                    <Button 
                      iconName="remove"
                      onClick={() => handleDeleteQuestion(questions.indexOf(item))}
                    >
                      삭제
                    </Button>
                  </SpaceBetween>
                )
              }
            ]}
            empty={
              <Box textAlign="center" color="inherit">
                <b>질문이 없습니다</b>
                <Box padding={{ bottom: "s" }}>
                  '질문 추가' 버튼을 눌러 설문조사 문항을 추가하세요.
                </Box>
                <Button onClick={handleAddQuestion} iconName="add-plus">
                  질문 추가
                </Button>
              </Box>
            }
            header={<Header>설문조사 문항 목록</Header>}
          />
        ) : (
          <Box textAlign="center" color="inherit">
            <b>질문이 없습니다</b>
            <Box padding={{ bottom: "s" }}>
              '질문 추가' 버튼을 눌러 설문조사 문항을 추가하세요.
            </Box>
            <Button onClick={handleAddQuestion} iconName="add-plus">
              질문 추가
            </Button>
          </Box>
        )}
      </Container>
      
      {/* 하단 버튼 */}
      <SpaceBetween direction="horizontal" size="xs" alignItems="center">
        <Button onClick={handleReturn} variant="link">
          취소 및 돌아가기
        </Button>
        <Button 
          onClick={handleSaveSurvey}
          variant="primary"
          loading={saving}
        >
          설문조사 저장
        </Button>
      </SpaceBetween>
      
      {saveError && <Alert type="error">{saveError}</Alert>}
      
      {/* 질문 편집 모달 */}
      <Modal
        visible={isEditingQuestion}
        onDismiss={handleCancelEdit}
        header={editingIndex >= 0 ? '질문 수정' : '새 질문 추가'}
        size="large"
      >
        {currentQuestion && (
          <SpaceBetween size="l">
            <FormField label="질문">
              <Textarea
                value={currentQuestion.question}
                onChange={({ detail }) => detail && 
                  setCurrentQuestion({
                    ...currentQuestion,
                    question: detail.value
                  })
                }
                placeholder="질문 내용을 입력하세요"
              />
            </FormField>
            
            <FormField label="질문 유형">
              <RadioGroup
                items={[
                  { value: 'single', label: '단일 선택' },
                  { value: 'multiple', label: '다중 선택' },
                  { value: 'text', label: '주관식' }
                ]}
                value={currentQuestion.type}
                onChange={({ detail }) => detail && 
                  handleQuestionTypeChange(detail.value as 'multiple' | 'single' | 'text')
                }
              />
            </FormField>
            
            {currentQuestion.type !== 'text' && (
              <FormField label="보기 옵션">
                <SpaceBetween size="xs">
                  {currentQuestion.options.map((option, index) => (
                    <SpaceBetween direction="horizontal" size="xs" key={index}>
                      <Input
                        value={option}
                        onChange={({ detail }) => detail && handleOptionChange(index, detail.value)}
                        placeholder={`보기 \${index + 1}`}
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
                    보기 추가
                  </Button>
                </SpaceBetween>
              </FormField>
            )}
            
            <SpaceBetween direction="horizontal" size="xs" alignItems="center">
              <Button onClick={handleCancelEdit} variant="link">
                취소
              </Button>
              <Button onClick={handleSaveQuestion} variant="primary">
                {editingIndex >= 0 ? '질문 저장' : '질문 추가'}
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
        header="설문조사 저장 완료"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button onClick={handleReturn} variant="primary">
                설문조사 관리로 돌아가기
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <p>설문조사가 성공적으로 저장되었습니다.</p>
      </Modal>
    </SpaceBetween>
  );
}