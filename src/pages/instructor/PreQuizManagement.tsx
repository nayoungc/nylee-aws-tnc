import React, { useState } from 'react';
import { 
  Button, 
  Container, 
  Header, 
  Select, 
  SpaceBetween,
  FormField,
  Modal,
  Spinner,
  Box
} from '@cloudscape-design/components';
import { post } from 'aws-amplify/api';
import { SelectProps } from '@cloudscape-design/components';

// API 응답 타입 정의
interface Question {
  question: string;
  options: string[];
  correctAnswer: string | number;
}

interface QuizGenerationResponse {
  questions: Question[];
}

// 타입 가드 함수
function isQuizGenerationResponse(obj: unknown): obj is QuizGenerationResponse {
  return (
    typeof obj === 'object' && 
    obj !== null && 
    'questions' in obj && 
    Array.isArray((obj as any).questions)
  );
}

export default function PreQuizManagement() {
  const [selectedCourse, setSelectedCourse] = useState<SelectProps.Option | null>(null);
  const [courses, setCourses] = useState<SelectProps.Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  
  // AI로 퀴즈 생성하기
  const generateQuizWithAI = async () => {
    if (!selectedCourse) return;
    
    setLoading(true);
    setShowAiModal(true);
    
    try {
      const response = await post({
        apiName: 'quizApi',
        path: '/generate-quiz',
        options: {
          body: JSON.stringify({
            courseId: selectedCourse.value,
            quizType: 'pre',
            questionCount: 10
          })
        }
      }).response;
      
      // 안전한 타입 처리
      const jsonData: unknown = await response.body.json();
      
      // 타입 가드로 응답 형식 검증
      if (isQuizGenerationResponse(jsonData)) {
        setGeneratedQuestions(jsonData.questions);
      } else {
        console.error('응답 데이터가 예상 형식과 일치하지 않음:', jsonData);
        setGeneratedQuestions([]);
      }
    } catch (error) {
      console.error('퀴즈 생성 오류:', error);
      setGeneratedQuestions([]);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <SpaceBetween size="l">
      <Container header={<Header variant="h2">사전 퀴즈 관리</Header>}>
        <FormField label="과정 선택">
          <Select
            selectedOption={selectedCourse}
            onChange={({ detail }) => setSelectedCourse(detail.selectedOption)}
            options={courses}
            placeholder="과정 선택"
          />
        </FormField>
        
        <SpaceBetween direction="horizontal" size="xs">
          <Button variant="primary">퀴즈 만들기</Button>
          <Button 
            onClick={generateQuizWithAI}
            iconName="add-plus"
          >
            AI로 자동 생성
          </Button>
        </SpaceBetween>
      </Container>
      
      <Modal
        visible={showAiModal}
        onDismiss={() => setShowAiModal(false)}
        header="AI 퀴즈 자동 생성"
        size="large"
      >
        {loading ? (
          <Box textAlign="center" padding="l">
            <Spinner />
            <p>과정 자료를 분석하여 퀴즈를 생성하고 있습니다...</p>
          </Box>
        ) : (
          <SpaceBetween size="l">
            <p>생성된 {generatedQuestions.length}개의 질문이 있습니다. 사용할 질문을 선택하거나 수정할 수 있습니다.</p>
            
            {/* 생성된 질문 목록 표시 */}
            {generatedQuestions.map((q, index) => (
              <div key={index}>
                <p><strong>질문 {index+1}:</strong> {q.question}</p>
              </div>
            ))}
            
            <SpaceBetween direction="horizontal" size="xs" alignItems="center">
              <Button onClick={() => setShowAiModal(false)}>취소</Button>
              <Button variant="primary">적용하기</Button>
            </SpaceBetween>
          </SpaceBetween>
        )}
      </Modal>
    </SpaceBetween>
  );
}