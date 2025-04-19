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
  ButtonDropdown
} from '@cloudscape-design/components';
import { post } from 'aws-amplify/api';
import { SelectProps } from '@cloudscape-design/components';
import { generateClient } from 'aws-amplify/api';
import { useNavigate } from 'react-router-dom';

// 타입 정의
interface Question {
  id?: string;
  question: string;
  options: string[];
  type: 'multiple' | 'single' | 'text';
}

interface CourseItem {
  id: string;
  title: string;
  description?: string;
  level?: string;
  category?: string;
  version?: string;
}

interface Survey {
  id: string;
  title: string;
  courseId: string;
  surveyType: 'pre' | 'post';
  questionCount: number;
  responseCount: number;
  createdAt: string;
  updatedAt?: string;
}

interface SurveyGenerationResponse {
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

// 설문조사 목록 쿼리
const listSurveys = /* GraphQL */ `
  query ListSurveys(
    \$filter: ModelSurveyFilterInput
    \$limit: Int
    \$nextToken: String
  ) {
    listSurveys(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
      items {
        id
        title
        courseId
        surveyType
        questionCount
        responseCount
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

// 타입 가드 함수
function isSurveyGenerationResponse(obj: unknown): obj is SurveyGenerationResponse {
  return (
    typeof obj === 'object' && 
    obj !== null && 
    'questions' in obj && 
    Array.isArray((obj as any).questions)
  );
}

export default function SurveyManagement() {
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState<SelectProps.Option | null>(null);
  const [courses, setCourses] = useState<SelectProps.Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingSurveys, setLoadingSurveys] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [existingSurveys, setExistingSurveys] = useState<Survey[]>([]);
  const [surveyType, setSurveyType] = useState<'pre' | 'post'>('pre');
  const [syncSurveys, setSyncSurveys] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [surveyToDelete, setSurveyToDelete] = useState<Survey | null>(null);
  
  // 페이지 로드 시 과정 목록 가져오기
  useEffect(() => {
    fetchCourses();
  }, []);

  // 과정 선택 시 설문조사 목록 가져오기
  useEffect(() => {
    if (selectedCourse?.value) {
      fetchSurveys(selectedCourse.value as string, surveyType);
    }
  }, [selectedCourse, surveyType]);

  // 과정 목록 가져오기
  const fetchCourses = async () => {
    setLoadingCourses(true);
    
    try {
      // GraphQL API를 사용하여 데이터 가져오기
      const client = generateClient();
      
      try {
        const response = await client.graphql({
          query: listCourseCatalogs,
          variables: {
            limit: 100,
            filter: {
              status: { eq: "ACTIVE" }
            }
          }
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

  // 설문조사 목록 가져오기
  const fetchSurveys = async (courseId: string, type: 'pre' | 'post') => {
    setLoadingSurveys(true);
    
    try {
      const client = generateClient();
      
      const response = await client.graphql({
        query: listSurveys,
        variables: {
          filter: {
            courseId: { eq: courseId },
            surveyType: { eq: type }
          },
          limit: 100
        }
      });

      const responseAny: any = response;
      const surveyItems = responseAny.data?.listSurveys?.items || [];
      
      // 날짜 기준 내림차순 정렬 (최신순)
      const sortedSurveys = [...surveyItems].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setExistingSurveys(sortedSurveys);
    } catch (error) {
      console.error('설문조사 목록 로드 오류:', error);
      
      // 개발용 더미 데이터
      if (process.env.NODE_ENV === 'development') {
        const dummyData: Survey[] = [
          {
            id: 'survey-1',
            title: `\${type === 'pre' ? '사전' : '사후'} 학습 만족도 설문조사`,
            courseId,
            surveyType: type,
            questionCount: 10,
            responseCount: 24,
            createdAt: new Date().toISOString(),
          },
          {
            id: 'survey-2',
            title: `\${type === 'pre' ? '사전' : '사후'} 기대사항 설문조사`,
            courseId,
            surveyType: type,
            questionCount: 5,
            responseCount: 12,
            createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
          }
        ];
        setExistingSurveys(dummyData);
      } else {
        setExistingSurveys([]);
      }
    } finally {
      setLoadingSurveys(false);
    }
  };

  // AI로 설문조사 생성하기
  const generateSurveyWithAI = async () => {
    if (!selectedCourse) return;
    
    setLoading(true);
    setShowAiModal(true);
    
    try {
      const response = await post({
        apiName: 'surveyApi',
        path: '/generate-survey',
        options: {
          body: JSON.stringify({
            courseId: selectedCourse.value,
            surveyType: surveyType,
            questionCount: 8
          })
        }
      }).response;
      
      // 안전한 타입 처리
      const jsonData: unknown = await response.body.json();
      
      // 타입 가드로 응답 형식 검증
      if (isSurveyGenerationResponse(jsonData)) {
        setGeneratedQuestions(jsonData.questions);
      } else {
        console.error('응답 데이터가 예상 형식과 일치하지 않음:', jsonData);
        setGeneratedQuestions([]);
      }
    } catch (error) {
      console.error('설문조사 생성 오류:', error);
      setGeneratedQuestions([]);
      
      // 개발용 더미 데이터
      if (process.env.NODE_ENV === 'development') {
        setTimeout(() => {
          const dummyQuestions: Question[] = [
            {
              question: "이번 과정에 대한 전반적인 기대치를 평가해주세요.",
              type: "single",
              options: ["매우 낮음", "낮음", "보통", "높음", "매우 높음"]
            },
            {
              question: "이 과정을 수강하는 주된 목적은 무엇입니까?",
              type: "multiple",
              options: ["업무 역량 강화", "자기 계발", "승진/이직 준비", "자격증 취득", "기타"]
            },
            {
              question: "이 과정에서 가장 배우고 싶은 내용은 무엇입니까?",
              type: "text",
              options: []
            },
            {
              question: "해당 주제에 대한 사전 지식 수준이 어느 정도입니까?",
              type: "single",
              options: ["초보자 (지식 없음)", "기초 (기본 개념만 알고 있음)", "중급 (일부 경험 있음)", "전문가 (관련 분야 경력 있음)"]
            }
          ];
          setGeneratedQuestions(dummyQuestions);
        }, 1500);
      }
    } finally {
      setLoading(false);
    }
  };

  // 체크박스 변경 핸들러
  const handleSyncCheckboxChange = (checked: boolean) => {
    setSyncSurveys(checked);
  };

  // 설문조사 타입 변경 핸들러
  const handleSurveyTypeChange = ({ detail }: { detail: { selectedId: string } }) => {
    setSurveyType(detail.selectedId as 'pre' | 'post');
  };

  // 새 설문조사 생성 페이지로 이동
  const navigateToSurveyCreator = (questions?: Question[]) => {
    if (!selectedCourse) return;
    
    navigate('/instructor/assessments/survey-creator', { 
      state: { 
        courseId: selectedCourse.value, 
        courseName: selectedCourse.label,
        surveyType: surveyType,
        initialQuestions: questions || []
      }
    });
  };

  // 설문조사 복사하기 (사전 → 사후 또는 사후 → 사전)
  const copySurvey = async (surveyId: string) => {
    setLoading(true);
    
    try {
      const response = await post({
        apiName: 'surveyApi',
        path: '/copy-survey',
        options: {
          body: JSON.stringify({
            surveyId,
            targetType: surveyType === 'pre' ? 'post' : 'pre'
          })
        }
      });
      
      // 복사 성공 후 목록 새로고침
      if (selectedCourse) {
        fetchSurveys(selectedCourse.value as string, surveyType);
      }
      
      // 성공 알림
      alert(`설문조사가 \${surveyType === 'pre' ? '사후' : '사전'} 설문조사로 복사되었습니다.`);
    } catch (error) {
      console.error('설문조사 복사 오류:', error);
      alert('설문조사 복사 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 설문조사 삭제
  const handleDeleteSurvey = (survey: Survey) => {
    setSurveyToDelete(survey);
    setShowDeleteModal(true);
  };
  
  // 설문조사 삭제 확인
  const confirmDeleteSurvey = async () => {
    if (!surveyToDelete) return;
    
    try {
      await post({
        apiName: 'surveyApi',
        path: '/delete-survey',
        options: {
          body: JSON.stringify({ surveyId: surveyToDelete.id })
        }
      });
      
      // 삭제 후 목록 새로고침
      if (selectedCourse) {
        fetchSurveys(selectedCourse.value as string, surveyType);
      }
      
      setShowDeleteModal(false);
      setSurveyToDelete(null);
    } catch (error) {
      console.error('설문조사 삭제 오류:', error);
      alert('설문조사 삭제 중 오류가 발생했습니다.');
    }
  };

  // 설문조사 결과 보기
  const viewSurveyResults = (surveyId: string) => {
    navigate(`/instructor/analytics/survey-results/\${surveyId}`);
  };
  
  return (
    <SpaceBetween size="l">
      <Container header={<Header variant="h2">설문조사 관리</Header>}>
        <SpaceBetween size="l">
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

          <FormField label="설문조사 유형">
            <SegmentedControl
              selectedId={surveyType}
              onChange={handleSurveyTypeChange}
              label="설문조사 유형 선택"
              options={[
                { id: 'pre', text: '사전 설문조사' },
                { id: 'post', text: '사후 설문조사' },
              ]}
            />
          </FormField>

          {surveyType === 'post' && (
            <Checkbox 
              checked={syncSurveys}
              onChange={({ detail }) => handleSyncCheckboxChange(detail.checked)}
            >
              사후 설문조사를 사전 설문조사와 동일하게 설정
            </Checkbox>
          )}
          
          <SpaceBetween direction="horizontal" size="xs">
            <Button 
              variant="primary"
              disabled={!selectedCourse || (surveyType === 'post' && syncSurveys)}
              onClick={() => navigateToSurveyCreator()}
            >
              설문조사 만들기
            </Button>
            <Button 
              onClick={generateSurveyWithAI}
              iconName="add-plus"
              disabled={!selectedCourse || (surveyType === 'post' && syncSurveys)}
            >
              AI로 자동 생성
            </Button>
            {surveyType === 'post' && syncSurveys && existingSurveys.length > 0 && (
              <Button 
                variant="normal"
                iconName="copy"
                onClick={() => copySurvey(existingSurveys[0].id)}
              >
                사전 설문조사에서 복사
              </Button>
            )}
          </SpaceBetween>
        </SpaceBetween>
      </Container>
      
      {/* 기존 설문조사 목록 */}
      <Container 
        header={
          <Header 
            variant="h2"
            description={`선택한 과정의 \${surveyType === 'pre' ? '사전' : '사후'} 설문조사 목록`}
            counter={`(\${existingSurveys.length})`}
          >
            설문조사 목록
          </Header>
        }
      >
        <Table
          items={existingSurveys}
          loading={loadingSurveys}
          loadingText="설문조사 목록을 불러오는 중..."
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
              id: "responseCount",
              header: "응답 수",
              cell: item => item.responseCount
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
                  <ButtonDropdown
                    items={[
                      { text: '결과 보기', id: 'view' },
                      { text: '편집', id: 'edit' },
                      { text: '복제', id: 'duplicate' },
                      { text: `\${surveyType === 'pre' ? '사후' : '사전'} 설문조사로 복사`, id: 'copy-to-other' },
                      { text: '삭제', id: 'delete' }
                    ]}
                    onItemClick={({ detail }) => {
                      switch (detail.id) {
                        case 'view':
                          viewSurveyResults(item.id);
                          break;
                        case 'edit':
                          // TODO: 편집 로직 구현
                          break;
                        case 'duplicate':
                          // TODO: 복제 로직 구현
                          break;
                        case 'copy-to-other':
                          copySurvey(item.id);
                          break;
                        case 'delete':
                          handleDeleteSurvey(item);
                          break;
                      }
                    }}
                  >
                    작업
                  </ButtonDropdown>
                </SpaceBetween>
              )
            }
          ]}
          empty={
            <Box textAlign="center" color="inherit">
              <b>설문조사가 없습니다</b>
              <Box padding={{ bottom: "xs" }}>
                선택한 과정에 대한 설문조사가 없습니다. 새 설문조사를 생성하세요.
              </Box>
            </Box>
          }
        />
      </Container>
      
      {/* AI 설문조사 생성 모달 */}
      <Modal
        visible={showAiModal}
        onDismiss={() => setShowAiModal(false)}
        header={`AI \${surveyType === 'pre' ? '사전' : '사후'} 설문조사 자동 생성`}
        size="large"
      >
        {loading ? (
          <Box textAlign="center" padding="l">
            <Spinner />
            <p>과정 자료를 분석하여 설문조사를 생성하고 있습니다...</p>
          </Box>
        ) : (
          <SpaceBetween size="l">
            <p>생성된 {generatedQuestions.length}개의 질문이 있습니다. 필요에 맞게 수정할 수 있습니다.</p>
            
            {/* 생성된 질문 목록 표시 */}
            {generatedQuestions.map((q, index) => (
              <div key={index}>
                <p><strong>질문 {index+1}:</strong> {q.question}</p>
                {q.type !== 'text' && (
                  <ul>
                    {q.options.map((opt, idx) => (
                      <li key={idx}>{opt}</li>
                    ))}
                  </ul>
                )}
                <p><em>유형: {q.type === 'single' ? '단일 선택' : q.type === 'multiple' ? '다중 선택' : '주관식'}</em></p>
              </div>
            ))}
            
            <SpaceBetween direction="horizontal" size="xs" alignItems="center">
              <Button onClick={() => setShowAiModal(false)}>취소</Button>
              <Button 
                variant="primary" 
                onClick={() => {
                  setShowAiModal(false);
                  navigateToSurveyCreator(generatedQuestions);
                }}
              >
                이 질문으로 설문조사 만들기
              </Button>
            </SpaceBetween>
          </SpaceBetween>
        )}
      </Modal>

      {/* 설문조사 삭제 확인 모달 */}
      <Modal
        visible={showDeleteModal}
        onDismiss={() => {
          setShowDeleteModal(false);
          setSurveyToDelete(null);
        }}
        header="설문조사 삭제"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button 
                variant="link" 
                onClick={() => {
                  setShowDeleteModal(false);
                  setSurveyToDelete(null);
                }}
              >
                취소
              </Button>
              <Button 
                variant="primary" 
                onClick={confirmDeleteSurvey}
              >
                삭제
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <p>
          정말로 "{surveyToDelete?.title}" 설문조사를 삭제하시겠습니까? 
          이 작업은 되돌릴 수 없으며, 모든 응답 데이터가 함께 삭제됩니다.
        </p>
        {surveyToDelete?.responseCount && surveyToDelete.responseCount > 0 && (
          <Box color="text-status-error">
            <strong>주의:</strong> 이 설문조사에는 {surveyToDelete.responseCount}개의 응답 데이터가 있습니다.
          </Box>
        )}
      </Modal>
    </SpaceBetween>
  );
}