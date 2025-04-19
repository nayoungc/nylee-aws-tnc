import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Container, 
  Header, 
  Select, 
  SpaceBetween,
  FormField,
  Modal,
  Spinner,
  Box,
  Table
} from '@cloudscape-design/components';
import { post } from 'aws-amplify/api';
import { SelectProps } from '@cloudscape-design/components';

// GraphQL 클라이언트 관련 import
import { generateClient } from 'aws-amplify/api';
// 불필요한 DynamoDB import 제거

// 타입 정의
interface Question {
  id?: string;
  question: string;
  options: string[];
  correctAnswer: string | number;
}

interface CourseItem {
  id: string;
  title: string;
  description?: string;
  level?: string;
  category?: string;
  version?: string;
}

interface QuizGenerationResponse {
  questions: Question[];
}

// GraphQL 쿼리 정의
const listCourseCatalogs = /* GraphQL */ `
  query ListCourseCatalogs(
    \$filter: ModelCourseCatalogFilterInput
    \$limit: Int
    \$nextToken: String
  ) {
    listCourseCatalogs(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
      items {
        id
        title
        description
        level
        category
        status
        version
      }
      nextToken
    }
  }
`;

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
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [showAiModal, setShowAiModal] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [existingQuizzes, setExistingQuizzes] = useState<any[]>([]);
  
  // 페이지 로드 시 과정 목록 가져오기
  useEffect(() => {
    fetchCourses();
  }, []);

  // DynamoDB에서 과정 목록 가져오기
  const fetchCourses = async () => {
    setLoadingCourses(true);
    
    try {
      // GraphQL API를 사용하여 데이터 가져오기
      const client = generateClient();
      
      try {
        const response = await client.graphql({
          query: listCourseCatalogs,
          variables: {
            limit: 100, // 최대 100개 항목 가져오기
            filter: {
              status: { eq: "ACTIVE" } // 활성 과정만 필터링
            }
          }
        });

        // any 타입을 사용하여 data 접근 문제 해결
        const responseAny: any = response;
        const courseItems = responseAny.data?.listCourseCatalogs?.items || [];
        
        // 필요한 속성만 추출하여 옵션 형식으로 변환
        const courseOptions: SelectProps.Option[] = courseItems.map((course: CourseItem) => ({
          label: course.title,
          value: course.id,
          description: course.description || '',
          // tags 속성 제거 (타입 문제 해결)
        }));
        
        setCourses(courseOptions);
      } catch (error) {
        console.error('GraphQL 쿼리 오류:', error);
        throw error;
      }
      
    } catch (error) {
      console.error('과정 목록 로드 오류:', error);
      
      // 오류 발생 시 기본 데이터 사용 (개발용)
      if (process.env.NODE_ENV === 'development') {
        const fallbackOptions: SelectProps.Option[] = [
          { label: "AWS Cloud Practitioner", value: "course-1" },
          { label: "AWS Solutions Architect Associate", value: "course-2" },
          { label: "AWS Developer Associate", value: "course-3" }
        ];
        setCourses(fallbackOptions);
      }
    } finally {
      setLoadingCourses(false);
    }
  };

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
              filteringType="auto"
              statusType={loadingCourses ? "loading" : "finished"}
              loadingText="과정 목록을 불러오는 중..."
              empty={
                <Box textAlign="center" color="inherit">
                  <b>과정이 없습니다</b>
                  <Box padding={{ bottom: "xs" }}>
                    사용 가능한 과정이 없습니다. 과정을 먼저 등록하세요.
                  </Box>
                </Box>
              }
            />
          </FormField>
          
          <SpaceBetween direction="horizontal" size="xs">
            <Button 
              variant="primary"
              disabled={!selectedCourse}
            >
              퀴즈 만들기
            </Button>
            <Button 
              onClick={generateQuizWithAI}
              iconName="add-plus"
              disabled={!selectedCourse}
            >
              AI로 자동 생성
            </Button>
          </SpaceBetween>
        </Container>
        
        {/* 기존 퀴즈 목록 */}
        <Container 
          header={
            <Header 
              variant="h2"
              description="선택한 과정의 사전 퀴즈 목록"
            >
              기존 퀴즈
            </Header>
          }
        >
          <Table
            items={existingQuizzes}
            loading={loadingCourses}
            loadingText="퀴즈 목록을 불러오는 중..."
            columnDefinitions={[
              {
                id: "title",
                header: "제목",
                cell: item => item.title
              },
              {
                id: "questionCount",
                header: "문항 수",
                cell: item => item.questionCount
              },
              {
                id: "createdAt",
                header: "생성 일자",
                cell: item => new Date(item.createdAt).toLocaleDateString()
              },
              {
                id: "actions",
                header: "관리",
                cell: item => (
                  <SpaceBetween direction="horizontal" size="xs">
                    <Button iconName="search">보기</Button>
                    <Button iconName="edit">편집</Button>
                    <Button iconName="remove">삭제</Button>
                  </SpaceBetween>
                )
              }
            ]}
            empty={
              <Box textAlign="center" color="inherit">
                <b>퀴즈가 없습니다</b>
                <Box padding={{ bottom: "xs" }}>
                  선택한 과정에 대한 퀴즈가 없습니다. 새 퀴즈를 생성하세요.
                </Box>
              </Box>
            }
          />
        </Container>
        
        {/* AI 퀴즈 생성 모달 */}
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