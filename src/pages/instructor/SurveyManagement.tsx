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
import { useTypedTranslation } from '../../utils/i18n-utils';

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
const listCourseCatalog = /* GraphQL */ `
  query listCourseCatalog(
    \$filter: ModelCourseCatalogFilterInput
    \$limit: Int
    \$nextToken: String
  ) {
    listCourseCatalog(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
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
  const { t, tString } = useTypedTranslation();
  
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
  const [client] = useState(() => generateClient());
  
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
      try {
        const response = await client.graphql({
          query: listCourseCatalog,
          variables: {
            limit: 100,
            filter: {
              status: { eq: "ACTIVE" }
            }
          }
        });

        const responseAny: any = response;
        const courseItems = responseAny.data?.listCourseCatalog?.items || [];
        
        const courseOptions: SelectProps.Option[] = courseItems.map((course: CourseItem) => ({
          label: course.title,
          value: course.id,
          description: course.description || '',
        }));
        
        setCourses(courseOptions);
      } catch (error) {
        console.error(t('survey.errors.graphql_query_error'), error);
        throw error;
      }
      
    } catch (error) {
      console.error(t('survey.errors.load_courses_error'), error);
      
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
      console.error(t('survey.errors.load_surveys_error'), error);
      
      // 개발용 더미 데이터
      if (process.env.NODE_ENV === 'development') {
        const dummyData: Survey[] = [
          {
            id: 'survey-1',
            title: `\${type === 'pre' ? t('survey.pre') : t('survey.post')} \${t('survey.satisfaction_survey')}`,
            courseId,
            surveyType: type,
            questionCount: 10,
            responseCount: 24,
            createdAt: new Date().toISOString(),
          },
          {
            id: 'survey-2',
            title: `\${type === 'pre' ? t('survey.pre') : t('survey.post')} \${t('survey.expectations_survey')}`,
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
        console.error(t('survey.errors.invalid_response_format'), jsonData);
        setGeneratedQuestions([]);
      }
    } catch (error) {
      console.error(t('survey.errors.generate_survey_error'), error);
      setGeneratedQuestions([]);
      
      // 개발용 더미 데이터
      if (process.env.NODE_ENV === 'development') {
        setTimeout(() => {
          const dummyQuestions: Question[] = [
            {
              question: t('survey.dummy.question1'),
              type: "single",
              options: [
                t('survey.dummy.option1_verylow'),
                t('survey.dummy.option1_low'),
                t('survey.dummy.option1_medium'),
                t('survey.dummy.option1_high'),
                t('survey.dummy.option1_veryhigh')
              ]
            },
            {
              question: t('survey.dummy.question2'),
              type: "multiple",
              options: [
                t('survey.dummy.option2_1'),
                t('survey.dummy.option2_2'),
                t('survey.dummy.option2_3'),
                t('survey.dummy.option2_4'),
                t('survey.dummy.option2_5')
              ]
            },
            {
              question: t('survey.dummy.question3'),
              type: "text",
              options: []
            },
            {
              question: t('survey.dummy.question4'),
              type: "single",
              options: [
                t('survey.dummy.option4_1'),
                t('survey.dummy.option4_2'),
                t('survey.dummy.option4_3'),
                t('survey.dummy.option4_4')
              ]
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
      alert(t('survey.alerts.copy_success', { type: surveyType === 'pre' ? t('survey.post') : t('survey.pre') }));
    } catch (error) {
      console.error(t('survey.errors.copy_survey_error'), error);
      alert(t('survey.errors.copy_survey_error_message'));
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
      console.error(t('survey.errors.delete_survey_error'), error);
      alert(t('survey.errors.delete_survey_error_message'));
    }
  };

  // 설문조사 결과 보기
  const viewSurveyResults = (surveyId: string) => {
    navigate(`/instructor/analytics/survey-results/\${surveyId}`);
  };

  const createFromTemplate = () => {
    if (!selectedCourse) return;
    
    // 기본 템플릿 설문조사 문항 생성
    const templateQuestions: Question[] = [
      {
        question: t('survey.template.overall_satisfaction', { 
          period: surveyType === 'pre' ? t('survey.template.before') : t('survey.template.after')
        }),
        options: [
          t('survey.template.very_dissatisfied'),
          t('survey.template.dissatisfied'),
          t('survey.template.neutral'),
          t('survey.template.satisfied'),
          t('survey.template.very_satisfied')
        ],
        type: "single"
      },
      {
        question: t('survey.template.most_expected_part', { 
          course: selectedCourse.label,
          past: surveyType === 'post' ? t('survey.template.beneficial') : ''
        }),
        options: [],
        type: "text"
      },
      {
        question: t('survey.template.participation_purpose', { 
          past: surveyType === 'pre' ? t('survey.template.participating') : t('survey.template.participated')
        }),
        options: [
          t('survey.template.purpose_1'),
          t('survey.template.purpose_2'),
          t('survey.template.purpose_3'),
          t('survey.template.purpose_4'),
          t('survey.template.purpose_5'),
          t('survey.template.purpose_other')
        ],
        type: "multiple"
      },
      {
        question: t('survey.template.additional_comment'),
        options: [],
        type: "text"
      }
    ];
    
    // 과정 유형에 따라 추가 질문 생성
    const courseLabel = selectedCourse?.label || '';
    if (courseLabel.includes("AWS") || courseLabel.includes("Cloud")) {
      templateQuestions.push({
        question: t('survey.template.cloud_experience'),
        options: [
          t('survey.template.experience_none'),
          t('survey.template.experience_basic'),
          t('survey.template.experience_intermediate'),
          t('survey.template.experience_advanced'),
          t('survey.template.experience_expert')
        ],
        type: "single"
      });
    }
    
    if (surveyType === 'post') {
      templateQuestions.push({
        question: t('survey.template.skill_improvement'),
        options: [
          t('survey.template.strongly_disagree'),
          t('survey.template.disagree'),
          t('survey.template.neutral'),
          t('survey.template.agree'),
          t('survey.template.strongly_agree')
        ],
        type: "single"
      });
    }
    
    // 설문조사 생성 페이지로 이동하며 템플릿 문항 전달
    navigateToSurveyCreator(templateQuestions);
  };
  
  return (
    <SpaceBetween size="l">
      <Container header={<Header variant="h2">{t('survey.management_title')}</Header>}>
        <SpaceBetween size="l">
          <FormField label={t('survey.select_course')}>
            <Select
              selectedOption={selectedCourse}
              onChange={({ detail }) => setSelectedCourse(detail.selectedOption)}
              options={courses}
              placeholder={tString('survey.course_placeholder')}
              filteringType="auto"
              statusType={loadingCourses ? "loading" : "finished"}
              loadingText={tString('survey.loading_courses')}
              empty={
                <Box textAlign="center" color="inherit">
                  <b>{t('survey.no_courses')}</b>
                  <Box padding={{ bottom: "xs" }}>
                    {t('survey.register_course_first')}
                  </Box>
                </Box>
              }
            />
          </FormField>

          <FormField label={t('survey.survey_type')}>
            <SegmentedControl
              selectedId={surveyType}
              onChange={handleSurveyTypeChange}
              label={tString('survey.survey_type_selection')}
              options={[
                { id: 'pre', text: tString('survey.pre_survey') },
                { id: 'post', text: tString('survey.post_survey') },
              ]}
            />
          </FormField>

          {surveyType === 'post' && (
            <Checkbox 
              checked={syncSurveys}
              onChange={({ detail }) => handleSyncCheckboxChange(detail.checked)}
            >
              {t('survey.sync_with_pre_survey')}
            </Checkbox>
          )}
          
          <SpaceBetween direction="horizontal" size="xs">
            <Button 
              variant="primary"
              disabled={!selectedCourse || (surveyType === 'post' && syncSurveys)}
              onClick={() => navigateToSurveyCreator()}
            >
              {t('survey.create_survey')}
            </Button>
            <Button 
              onClick={generateSurveyWithAI}
              iconName="add-plus"
              disabled={!selectedCourse || (surveyType === 'post' && syncSurveys)}
            >
              {t('survey.generate_with_ai')}
            </Button>
            {/* 템플릿으로 생성 버튼 추가 */}
            <Button 
              onClick={createFromTemplate}
              iconName="file"
              disabled={!selectedCourse || (surveyType === 'post' && syncSurveys)}
            >
              {t('survey.create_from_template')}
            </Button>
            {surveyType === 'post' && syncSurveys && existingSurveys.length > 0 && (
              <Button 
                variant="normal"
                iconName="copy"
                onClick={() => copySurvey(existingSurveys[0].id)}
              >
                {t('survey.copy_from_pre_survey')}
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
            description={t('survey.survey_list_description', {
              type: surveyType === 'pre' ? t('survey.pre') : t('survey.post')
            })}
            counter={`(\${existingSurveys.length})`}
          >
            {t('survey.survey_list')}
          </Header>
        }
      >
        <Table
          items={existingSurveys}
          loading={loadingSurveys}
          loadingText={tString('survey.loading_surveys')}
          columnDefinitions={[
            {
              id: "title",
              header: t('survey.columns.title'),
              cell: item => item.title
            },
            {
              id: "questionCount",
              header: t('survey.columns.question_count'),
              cell: item => item.questionCount
            },
            {
              id: "responseCount",
              header: t('survey.columns.response_count'),
              cell: item => item.responseCount
            },
            {
              id: "createdAt",
              header: t('survey.columns.created_date'),
              cell: item => new Date(item.createdAt).toLocaleDateString()
            },
            {
              id: "actions",
              header: t('survey.columns.actions'),
              cell: item => (
                <SpaceBetween direction="horizontal" size="xs">
                  <ButtonDropdown
                    items={[
                      { text: tString('survey.actions.view_results'), id: 'view' },
                      { text: tString('survey.actions.edit'), id: 'edit' },
                      { text: tString('survey.actions.duplicate'), id: 'duplicate' },
                      { text: tString('survey.actions.copy_to_other', {
                        type: surveyType === 'pre' ? t('survey.post') : t('survey.pre')
                      }), id: 'copy-to-other' },
                      { text: tString('survey.actions.delete'), id: 'delete' }
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
                    {t('survey.actions.button_text')}
                  </ButtonDropdown>
                </SpaceBetween>
              )
            }
          ]}
          empty={
            <Box textAlign="center" color="inherit">
              <b>{t('survey.no_surveys')}</b>
              <Box padding={{ bottom: "xs" }}>
                {t('survey.create_new_survey_prompt')}
              </Box>
            </Box>
          }
        />
      </Container>
      
      {/* AI 설문조사 생성 모달 */}
      <Modal
        visible={showAiModal}
        onDismiss={() => setShowAiModal(false)}
        header={t('survey.ai_modal.title', {
          type: surveyType === 'pre' ? t('survey.pre') : t('survey.post')
        })}
        size="large"
      >
        {loading ? (
          <Box textAlign="center" padding="l">
            <Spinner />
            <p>{t('survey.ai_modal.generating')}</p>
          </Box>
        ) : (
          <SpaceBetween size="l">
            <p>{t('survey.ai_modal.question_count', { count: generatedQuestions.length })}</p>
            
            {/* 생성된 질문 목록 표시 */}
            {generatedQuestions.map((q, index) => (
              <div key={index}>
                <p><strong>{t('survey.ai_modal.question_number', { number: index + 1 })}</strong> {q.question}</p>
                {q.type !== 'text' && (
                  <ul>
                    {q.options.map((opt, idx) => (
                      <li key={idx}>{opt}</li>
                    ))}
                  </ul>
                )}
                <p><em>{t('survey.ai_modal.type')}: {q.type === 'single' 
                  ? t('survey.question_types.single') 
                  : q.type === 'multiple' 
                  ? t('survey.question_types.multiple') 
                  : t('survey.question_types.text')}
                </em></p>
              </div>
            ))}
            
            <SpaceBetween direction="horizontal" size="xs" alignItems="center">
              <Button onClick={() => setShowAiModal(false)}>
                {t('common.cancel')}
              </Button>
              <Button 
                variant="primary" 
                onClick={() => {
                  setShowAiModal(false);
                  navigateToSurveyCreator(generatedQuestions);
                }}
              >
                {t('survey.ai_modal.create_with_questions')}
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
        header={t('survey.delete_modal.title')}
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
                {t('common.cancel')}
              </Button>
              <Button 
                variant="primary" 
                onClick={confirmDeleteSurvey}
              >
                {t('common.delete')}
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <p>
          {t('survey.delete_modal.confirmation', { title: surveyToDelete?.title })}
        </p>
        {surveyToDelete?.responseCount && surveyToDelete.responseCount > 0 && (
          <Box color="text-status-error">
            <strong>{t('survey.delete_modal.warning')}</strong> {t('survey.delete_modal.response_count', { count: surveyToDelete.responseCount })}
          </Box>
        )}
      </Modal>
    </SpaceBetween>
  );
}