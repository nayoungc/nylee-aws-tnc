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
  Table,
  Checkbox,
  SegmentedControl,
  Tabs
} from '@cloudscape-design/components';
import { post } from 'aws-amplify/api';
import { SelectProps } from '@cloudscape-design/components';
import { generateClient } from 'aws-amplify/api';
import { useNavigate } from 'react-router-dom';
import { useTypedTranslation } from '../../utils/i18n-utils';

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

// GraphQL 쿼리 정의 - 이스케이프 문자 제거
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

export default function QuizManagement() {
  const { t, tString } = useTypedTranslation();
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState<SelectProps.Option | null>(null);
  const [courses, setCourses] = useState<SelectProps.Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [showAiModal, setShowAiModal] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [existingQuizzes, setExistingQuizzes] = useState<any[]>([]);
  const [quizType, setQuizType] = useState<'pre' | 'post'>('pre');
  const [syncQuizzes, setSyncQuizzes] = useState<boolean>(false);
  // Amplify Gen 2에 맞는 클라이언트 생성 방식
  const [client] = useState(() => generateClient());
  
  // 페이지 로드 시 과정 목록 가져오기
  useEffect(() => {
    fetchCourses();
  }, []);

  // 과정 목록 가져오기
  const fetchCourses = async () => {
    setLoadingCourses(true);
    
    try {
      // GraphQL API를 사용하여 데이터 가져오기      
      try {
        const response = await client.graphql({
          query: listCourseCatalogs,
          variables: {
            limit: 100,
            filter: {
              status: { eq: "ACTIVE" }
            }
          },
          authMode: 'userPool'
        });

        const responseAny: any = response;
        const courseItems = responseAny.data?.listCourseCatalogs?.items || [];
        
        const courseOptions: SelectProps.Option[] = courseItems.map((course: CourseItem) => ({
          label: course.title,
          value: course.id,
          description: course.description || '',
        }));
        
        setCourses(courseOptions);
      } catch (error) {
        console.error(t('quiz_management.errors.graphql_query'), error);
        throw error;
      }
      
    } catch (error) {
      console.error(t('quiz_management.errors.course_load'), error);
      
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
            quizType: quizType, // 현재 선택된 퀴즈 타입 전달
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
        console.error(t('quiz_management.errors.response_format'), jsonData);
        setGeneratedQuestions([]);
      }
    } catch (error) {
      console.error(t('quiz_management.errors.quiz_generation'), error);
      setGeneratedQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  // 체크박스 변경 핸들러
  const handleSyncCheckboxChange = (checked: boolean) => {
    setSyncQuizzes(checked);
  };

  // 퀴즈 타입 변경 핸들러
  const handleQuizTypeChange = ({ detail }: { detail: { selectedId: string } }) => {
    setQuizType(detail.selectedId as 'pre' | 'post');
  };

  // 퀴즈 생성 페이지로 이동
  const navigateToQuizCreator = (questions?: Question[]) => {
    if (!selectedCourse) return;
    
    navigate('/instructor/assessments/quiz-creator', { 
      state: { 
        courseId: selectedCourse.value, 
        courseName: selectedCourse.label,
        quizType: quizType,
        initialQuestions: questions || []
      }
    });
  };
  
  return (
    <SpaceBetween size="l">
      <Container header={<Header variant="h2">{t('quiz_management.title')}</Header>}>
        <SpaceBetween size="l">
          <FormField label={t('quiz_management.course_selection')}>
            <Select
              selectedOption={selectedCourse}
              onChange={({ detail }) => setSelectedCourse(detail.selectedOption)}
              options={courses}
              placeholder={tString('quiz_management.course_placeholder')}
              filteringType="auto"
              statusType={loadingCourses ? "loading" : "finished"}
              loadingText={tString('quiz_management.loading.courses')}
              empty={
                <Box textAlign="center" color="inherit">
                  <b>{t('quiz_management.empty_states.no_courses')}</b>
                  <Box padding={{ bottom: "xs" }}>
                    {t('quiz_management.empty_states.register_course')}
                  </Box>
                </Box>
              }
            />
          </FormField>

          <FormField label={t('quiz_management.quiz_type')}>
            <SegmentedControl
              selectedId={quizType}
              onChange={handleQuizTypeChange}
              label={tString('quiz_management.select_quiz_type')}
              options={[
                { id: 'pre', text: tString('quiz_management.pre_quiz') },
                { id: 'post', text: tString('quiz_management.post_quiz') },
              ]}
            />
          </FormField>

          {quizType === 'post' && (
            <Checkbox 
              checked={syncQuizzes}
              onChange={({ detail }) => handleSyncCheckboxChange(detail.checked)}
            >
              {t('quiz_management.sync_with_pre_quiz')}
            </Checkbox>
          )}
          
          <SpaceBetween direction="horizontal" size="xs">
            <Button 
              variant="primary"
              disabled={!selectedCourse || (quizType === 'post' && syncQuizzes)}
              onClick={() => navigateToQuizCreator()}
            >
              {t('quiz_management.actions.create_quiz')}
            </Button>
            <Button 
              onClick={generateQuizWithAI}
              iconName="add-plus"
              disabled={!selectedCourse || (quizType === 'post' && syncQuizzes)}
            >
              {t('quiz_management.actions.ai_generate')}
            </Button>
            {quizType === 'post' && syncQuizzes && (
              <Button 
                variant="normal"
                iconName="copy"
              >
                {t('quiz_management.actions.copy_from_pre')}
              </Button>
            )}
          </SpaceBetween>
        </SpaceBetween>
      </Container>
      
      {/* 기존 퀴즈 목록 */}
      <Container 
        header={
          <Header 
            variant="h2"
            description={t('quiz_management.existing_quiz_description', { 
              type: quizType === 'pre' ? t('quiz_management.pre_quiz') : t('quiz_management.post_quiz')
            })}
          >
            {t('quiz_management.existing_quizzes')}
          </Header>
        }
      >
        <Table
          items={existingQuizzes}
          loading={loadingCourses}
          loadingText={tString('quiz_management.loading.quizzes')}
          columnDefinitions={[
            {
              id: "title",
              header: t('quiz_management.columns.title'),
              cell: item => item.title
            },
            {
              id: "questionCount",
              header: t('quiz_management.columns.question_count'),
              cell: item => item.questionCount
            },
            {
              id: "createdAt",
              header: t('quiz_management.columns.created_at'),
              cell: item => new Date(item.createdAt).toLocaleDateString()
            },
            {
              id: "actions",
              header: t('quiz_management.columns.actions'),
              cell: item => (
                <SpaceBetween direction="horizontal" size="xs">
                  <Button iconName="search">{t('quiz_management.actions.view')}</Button>
                  <Button iconName="edit">{t('quiz_management.actions.edit')}</Button>
                  <Button iconName="remove">{t('quiz_management.actions.delete')}</Button>
                </SpaceBetween>
              )
            }
          ]}
          empty={
            <Box textAlign="center" color="inherit">
              <b>{t('quiz_management.empty_states.no_quizzes')}</b>
              <Box padding={{ bottom: "xs" }}>
                {t('quiz_management.empty_states.create_new_quiz')}
              </Box>
            </Box>
          }
        />
      </Container>
      
      {/* AI 퀴즈 생성 모달 */}
      <Modal
        visible={showAiModal}
        onDismiss={() => setShowAiModal(false)}
        header={t('quiz_management.modal.ai_generation', {
          type: quizType === 'pre' ? t('quiz_management.pre_quiz') : t('quiz_management.post_quiz')
        })}
        size="large"
      >
        {loading ? (
          <Box textAlign="center" padding="l">
            <Spinner />
            <p>{t('quiz_management.modal.generating')}</p>
          </Box>
        ) : (
          <SpaceBetween size="l">
            <p>{t('quiz_management.modal.generated_count', { count: generatedQuestions.length })}</p>
            
            {/* 생성된 질문 목록 표시 */}
            {generatedQuestions.map((q, index) => (
              <div key={index}>
                <p>
                  <strong>{t('quiz_management.question_number', { number: index + 1 })}:</strong> {q.question}
                </p>
                <ul>
                  {q.options.map((option, optIndex) => (
                    <li key={optIndex}>
                      {option} {q.correctAnswer === option || q.correctAnswer === optIndex ? 
                        `(\${t('quiz_management.correct_answer')})` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            
            <SpaceBetween direction="horizontal" size="xs" alignItems="center">
              <Button onClick={() => setShowAiModal(false)}>
                {t('quiz_management.actions.cancel')}
              </Button>
              <Button 
                variant="primary" 
                onClick={() => {
                  setShowAiModal(false);
                  navigateToQuizCreator(generatedQuestions);
                }}
              >
                {t('quiz_management.actions.create_with_questions')}
              </Button>
            </SpaceBetween>
          </SpaceBetween>
        )}
      </Modal>
    </SpaceBetween>
  );
}