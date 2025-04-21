// src/pages/instructor/courses/CourseDetail.tsx
import React from 'react';  
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTypedTranslation } from '@utils/i18n-utils';
import MainLayout from '@layouts/MainLayout';
import { generateClient, GraphQLResult } from 'aws-amplify/api';

import { 
  Container, 
  Header, 
  SpaceBetween, 
  Box, 
  Button, 
  Alert,
  StatusIndicator, 
  Table,
  ExpandableSection,
  Tabs,
  ColumnLayout
} from '@cloudscape-design/components';
import { client } from '../../../graphql/client';

// StatusIndicator의 타입 정의
type StatusIndicatorType = "success" | "warning" | "error" | "info" | "stopped" | "in-progress" | "loading";

// 평가 아이템 타입 정의
interface AssessmentItem {
  id: string;
  name: string;
  type: string;
  status: string;
  statusType: StatusIndicatorType;
  dueDate?: string;
  action: string;
  actionEnabled: boolean;
}

const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTabId, setActiveTabId] = useState('overview');
  const { t, tString, i18n } = useTypedTranslation();
  
  // 평가 상태에 따른 StatusIndicator 타입 매핑
  const getStatusType = (status: string): StatusIndicatorType => {
    switch(status) {
      case 'ACTIVE': return 'success';
      case 'COMPLETED': return 'success';
      case 'COMING_SOON': return 'in-progress';
      case 'EXPIRED': return 'error';
      default: return 'info';
    }
  };
  
  // 평가 타입에 따른 한글 이름
  const getAssessmentTypeName = (type: string): string => {
    switch(type) {
      case 'PRE_QUIZ': return t('course_detail.assessment_types.pre_quiz');
      case 'POST_QUIZ': return t('course_detail.assessment_types.post_quiz');
      case 'SURVEY': return t('course_detail.assessment_types.survey');
      default: return type;
    }
  };
  
  // 평가 상태에 따른 한글 이름
  const getAssessmentStatusName = (status: string): string => {
    switch(status) {
      case 'ACTIVE': return t('course_detail.status.active');
      case 'COMPLETED': return t('course_detail.status.completed');
      case 'COMING_SOON': return t('course_detail.status.coming_soon');
      case 'EXPIRED': return t('course_detail.status.expired');
      default: return status;
    }
  };
  
  // 날짜 포맷팅 함수
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString(i18n.language || 'ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    async function fetchCourseData() {
      if (!courseId) {
        setError(t('course_detail.errors.invalid_id'));
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // 변수를 이 스코프에서 선언하여 접근 가능하게 만듦
        let courseData = null;
        
        try {
          const result = await client.graphql({
            query: `
              query GetCourse(\$courseId: ID!) {
                getCourse(courseId: \$courseId) {
                  courseId
                  title
                  description
                  status
                  startDate
                  endDate
                  location
                  customerId
                  customerName
                  instructor
                  assessments {
                    items {
                      id
                      name
                      type
                      status
                    }
                  }
                }
              }
            `,
            variables: { courseId }
          }) as any; // GraphQLResult 대신 any 사용
          
          // 결과 처리
          courseData = result.data?.getCourse;
          const errors = result.errors;
          
          if (errors) {
            console.error("데이터를 가져오는 중 오류 발생:", errors);
            throw new Error(errors.map((e: any) => e.message).join(', '));
          } else if (courseData) {
            // 데이터 처리
            console.log("가져온 과정 데이터:", courseData);
          } else {
            throw new Error("과정을 찾을 수 없습니다");
          }
        } catch (apiError) {
          console.error("API 호출 중 예외 발생:", apiError);
          throw apiError; // 바깥쪽 catch 블록으로 오류 전파
        }
        
        // 이제 courseData 변수는 이 스코프에서 접근 가능
        setCourse(courseData);
        
      } catch (error: any) {
        console.error('Error fetching course:', error);
        
        // 오류 유형에 따른 메시지 설정
        if (error.name === 'UserUnAuthenticatedException') {
          setError(t('course_detail.errors.authentication'));
        } else {
          setError(t('course_detail.errors.fetch_failed'));
        }
        
        // 개발 환경에서 샘플 데이터 제공
        if (process.env.NODE_ENV === 'development') {
          setCourse({
            courseId: courseId,
            title: 'AWS Cloud Practitioner Essentials',
            description: '클라우드 기초 개념과 AWS 서비스에 대한 기본 지식을 배우는 과정입니다.',
            status: 'ACTIVE',
            startDate: '2023-05-01',
            endDate: '2023-05-05',
            location: 'Seoul AWS Office',
            customerId: 'cust-1',
            customerName: '한국 AWS',
            instructor: 'John Doe',
            assessments: {
              items: [
                { 
                  id: 'pre-1', 
                  name: '사전 평가 테스트',
                  type: 'PRE_QUIZ',
                  status: 'ACTIVE' 
                },
                { 
                  id: 'post-1', 
                  name: '이해도 평가 테스트',
                  type: 'POST_QUIZ',
                  status: 'COMING_SOON' 
                },
                { 
                  id: 'survey-1', 
                  name: '과정 만족도 조사',
                  type: 'SURVEY',
                  status: 'COMING_SOON' 
                }
              ]
            }
          });
        }
      } finally {
        setLoading(false);
      }
    }
  
    fetchCourseData();
  }, [courseId, t]);

  // 평가 항목 시작 핸들러
  const handleStartAssessment = (assessmentId: string, type: string) => {
    switch(type) {
      case 'PRE_QUIZ':
        navigate(`/assessment/pre-quiz/\${assessmentId}`);
        break;
      case 'POST_QUIZ':
        navigate(`/assessment/post-quiz/\${assessmentId}`);
        break;
      case 'SURVEY':
        navigate(`/assessment/survey/\${assessmentId}`);
        break;
      default:
        console.warn(t('course_detail.warnings.unknown_type'), type);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <StatusIndicator type="loading">
            {t('course_detail.loading.message')}
          </StatusIndicator>
        </div>
      </MainLayout>
    );
  }

  if (error || !course) {
    return (
      <MainLayout>
        <Container>
          <Alert type="error" header={t('course_detail.errors.load_failed')}>
            {error || t('course_detail.errors.general')}
            <Box padding={{ top: 'm' }}>
              <Button onClick={() => navigate(-1)}>
                {t('common.go_back')}
              </Button>
            </Box>
          </Alert>
        </Container>
      </MainLayout>
    );
  }

  // 활성화된 평가 있는지 확인
  const activeAssessment = course.assessments?.items?.find((item: any) => item.status === 'ACTIVE');

  // 평가 항목 준비
  const assessmentItems: AssessmentItem[] = course.assessments?.items?.map((assessment: any) => ({
    id: assessment.id,
    name: assessment.name,
    type: assessment.type,
    status: getAssessmentStatusName(assessment.status),
    statusType: getStatusType(assessment.status),
    dueDate: assessment.dueDate ? formatDate(assessment.dueDate) : undefined,
    action: assessment.status === 'ACTIVE' ? t('course_detail.actions.start') : t('course_detail.actions.view'),
    actionEnabled: ['ACTIVE', 'COMPLETED'].includes(assessment.status)
  })) || [];

  return (
    <MainLayout title={course.title}>
      <SpaceBetween size="l">
        {activeAssessment && (
          <Alert
            header={t('course_detail.alerts.active_assessment')}
            type="info"
          >
            {t('course_detail.alerts.assessment_available', {
              type: getAssessmentTypeName(activeAssessment.type),
              name: activeAssessment.name
            })}
            <Box padding={{ top: 's' }}>
              <Button 
                variant="primary"
                onClick={() => handleStartAssessment(activeAssessment.id, activeAssessment.type)}
              >
                {t('course_detail.actions.start_assessment')}
              </Button>
            </Box>
          </Alert>
        )}

        {/* 나머지 코드는 다국어 지원을 위해 t() 함수를 사용하여 수정할 수 있습니다 */}
        <Container
          header={
            <Header
              variant="h2"
              actions={
                <SpaceBetween direction="horizontal" size="xs">
                  <Button onClick={() => navigate('/instructor/courses')}>
                    {t('common.back_to_list')}
                  </Button>
                  <Button variant="primary">
                    {t('course_detail.actions.edit')}
                  </Button>
                </SpaceBetween>
              }
            >
              {t('course_detail.title')} - {course.title}
            </Header>
          }
        >
          {/* 여기에 과정 상세 내용 추가 */}
          <ColumnLayout columns={2}>
            <SpaceBetween size="l">
              <Box variant="awsui-key-label">
                <Box variant="awsui-key-label">{t('course_detail.fields.status')}</Box>
                <div>
                  <StatusIndicator type={getStatusType(course.status)}>
                    {getAssessmentStatusName(course.status)}
                  </StatusIndicator>
                </div>
              </Box>
              <Box variant="awsui-key-label">
                <Box variant="awsui-key-label">{t('course_detail.fields.date_range')}</Box>
                <div>{formatDate(course.startDate)} - {formatDate(course.endDate)}</div>
              </Box>
              <Box variant="awsui-key-label">
                <Box variant="awsui-key-label">{t('course_detail.fields.location')}</Box>
                <div>{course.location || '-'}</div>
              </Box>
            </SpaceBetween>
            
            <SpaceBetween size="l">
              <Box variant="awsui-key-label">
                <Box variant="awsui-key-label">{t('course_detail.fields.customer')}</Box>
                <div>{course.customerName || '-'}</div>
              </Box>
              <Box variant="awsui-key-label">
                <Box variant="awsui-key-label">{t('course_detail.fields.instructor')}</Box>
                <div>{course.instructor || '-'}</div>
              </Box>
              <Box variant="awsui-key-label">
                <Box variant="awsui-key-label">{t('course_detail.fields.course_id')}</Box>
                <div>{course.courseId}</div>
              </Box>
            </SpaceBetween>
          </ColumnLayout>

          <ExpandableSection headerText={t('course_detail.sections.description')} defaultExpanded>
            <p>{course.description || t('course_detail.no_description')}</p>
          </ExpandableSection>
        </Container>
        
        <Container
          header={
            <Header variant="h3">
              {t('course_detail.sections.assessments')}
            </Header>
          }
        >
          <Table
            columnDefinitions={[
              {
                id: "name",
                header: t('course_detail.fields.assessment_name'),
                cell: item => item.name
              },
              {
                id: "type",
                header: t('course_detail.fields.assessment_type'),
                cell: item => getAssessmentTypeName(item.type)
              },
              {
                id: "status",
                header: t('course_detail.fields.status'),
                cell: item => (
                  <StatusIndicator type={item.statusType}>
                    {item.status}
                  </StatusIndicator>
                )
              },
              {
                id: "dueDate",
                header: t('course_detail.fields.due_date'),
                cell: item => item.dueDate || '-'
              },
              {
                id: "actions",
                header: t('common.actions'),
                cell: item => (
                  <Button 
                    disabled={!item.actionEnabled}
                    onClick={() => handleStartAssessment(item.id, item.type)}
                  >
                    {item.action}
                  </Button>
                )
              }
            ]}
            items={assessmentItems}
            empty={
              <Box textAlign="center" color="inherit">
                <b>{t('course_detail.no_assessments')}</b>
                <Box padding={{ bottom: "s" }} color="inherit">
                  {t('course_detail.no_assessments_description')}
                </Box>
              </Box>
            }
          />
        </Container>
      </SpaceBetween>
    </MainLayout>
  );
};

export default CourseDetail;