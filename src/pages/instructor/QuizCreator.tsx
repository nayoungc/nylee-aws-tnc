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
  ColumnLayout,
  Select,
  SelectProps
} from '@cloudscape-design/components';
import { useLocation, useNavigate } from 'react-router-dom';
import { post } from 'aws-amplify/api';
import { generateClient } from 'aws-amplify/api';

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
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  
  // 상태가 없으면 리디렉션
  useEffect(() => {
    if (!state?.courseId) {
      navigate('/instructor/assessments/pre-quiz');
    }
  }, [state, navigate]);

  // 기본값 설정
  const initialMeta: QuizMeta = {
    title: `\${state?.courseName || '과정'} \${state?.quizType === 'pre' ? '사전' : '사후'} 퀴즈`,
    description: '본 퀴즈는 학습 과정에서의 지식 수준을 측정하기 위한 도구입니다.',
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
      alert("질문 내용을 입력해주세요.");
      return;
    }

    // 옵션 유효성 검사
    if (currentQuestion.options.some(opt => !opt.trim())) {
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
      alert("최소 1개 이상의 질문이 필요합니다.");
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
      console.error('퀴즈 저장 오류:', error);
      setSaveError('퀴즈 저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  // 퀴즈 관리 페이지로 돌아가기
  const handleReturn = () => {
    navigate('/instructor/assessments/pre-quiz');
  };
  
  return (
    <SpaceBetween size="l">
      {/* 퀴즈 메타데이터 */}
      <Container header={<Header variant="h2">퀴즈 정보</Header>}>
        <SpaceBetween size="l">
          <FormField label="퀴즈 제목">
            <Input
              value={quizMeta.title}
              onChange={({ detail }) => handleMetaChange('title', detail.value)}
              placeholder="퀴즈 제목을 입력하세요"
            />
          </FormField>
          
          <FormField label="설명">
            <Textarea
              value={quizMeta.description}
              onChange={({ detail }) => handleMetaChange('description', detail.value)}
              placeholder="수강생에게 보여질 퀴즈 설명을 입력하세요"
            />
          </FormField>
          
          <ColumnLayout columns={2} variant="text-grid">
            <FormField label="시간 제한 (분)">
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
            
            <FormField label="합격 점수 (%)">
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
              문제 순서 섞기
            </Checkbox>
            
            <Checkbox
              checked={quizMeta.shuffleOptions}
              onChange={({ detail }) => handleMetaChange('shuffleOptions', detail.checked)}
            >
              보기 순서 섞기
            </Checkbox>
            
            <Checkbox
              checked={quizMeta.showFeedback}
              onChange={({ detail }) => handleMetaChange('showFeedback', detail.checked)}
            >
              응시 후 정답 피드백 보여주기
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
                질문 추가
              </Button>
            }
          >
            퀴즈 문항 ({questions.length}개)
          </Header>
        }
      >
        {questions.length > 0 ? (
          <>
            <Cards
              cardDefinition={{
                header: (item: Question) => {
                  const index = questions.findIndex(q => q === item);
                  return `문제 \${index + 1}`;
                },
                sections: [
                  {
                    id: "question",
                    header: "질문",
                    content: (item: Question) => item.question
                  },
                  {
                    id: "options",
                    header: "보기 옵션",
                    content: (item: Question) => (
                      <ul>
                        {item.options.map((opt, idx) => (
                          <li key={idx}>
                            {opt} {idx === item.correctAnswer || opt === item.correctAnswer ? '(정답)' : ''}
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
              loadingText="질문을 불러오는 중..."
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
                  <b>질문이 없습니다</b>
                  <Box padding={{ bottom: "s" }}>
                    '질문 추가' 버튼을 눌러 퀴즈 문항을 추가하세요.
                  </Box>
                  <Button onClick={handleAddQuestion} iconName="add-plus">
                    질문 추가
                  </Button>
                </Box>
              }
              header={<Header>질문 목록</Header>}
              stickyHeader={true}
            />
            
            {/* Cards 컴포넌트 아래에 안내 메시지 추가 */}
            <Box textAlign="right" padding={{ top: "s" }}>
              편집하려면 카드를 클릭하세요
            </Box>
          </>
        ) : (
          <Box textAlign="center" color="inherit">
            <b>질문이 없습니다</b>
            <Box padding={{ bottom: "s" }}>
              '질문 추가' 버튼을 눌러 퀴즈 문항을 추가하세요.
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
          onClick={handleSaveQuiz}
          variant="primary"
          loading={saving}
        >
          퀴즈 저장
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
                onChange={({ detail }) => 
                  setCurrentQuestion({
                    ...currentQuestion,
                    question: detail.value
                  })
                }
                placeholder="질문 내용을 입력하세요"
              />
            </FormField>
            
            <FormField label="보기 옵션">
              <SpaceBetween size="xs">
                {currentQuestion.options.map((option, index) => (
                  <SpaceBetween direction="horizontal" size="xs" key={index}>
                    <Input
                      value={option}
                      onChange={({ detail }) => handleOptionChange(index, detail.value)}
                      placeholder={`보기 \${index + 1}`}
                    />
                    
                    <RadioGroup
                      items={[
                        { value: index.toString(), label: '정답' }
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
                  보기 추가
                </Button>
              </SpaceBetween>
            </FormField>
            
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
        header="퀴즈 저장 완료"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button onClick={handleReturn} variant="primary">
                퀴즈 관리로 돌아가기
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <p>퀴즈가 성공적으로 저장되었습니다.</p>
      </Modal>
    </SpaceBetween>
  );
}