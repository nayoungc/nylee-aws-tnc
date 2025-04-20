// src/pages/CourseDetailPage.tsx
import React from 'react';  
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generateClient } from 'aws-amplify/api';
import { useTypedTranslation } from '../../utils/i18n-utils';
import MainLayout from '../../layouts/MainLayout';
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
import { GraphQLQuery } from 'aws-amplify/api';


// 상대 경로로 정의된 쿼리 가져오기
import { getCourseCatalog } from '@graphql/queries';

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

// 쿼리 결과 타입 정의
interface GetCourseQuery {
  getCourse: {
    id: string;
    title: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    location?: string;
    isOnline?: boolean;
    instructorName?: string;
    tags?: string[];
    announcements?: {
      items: Array<{
        id: string;
        title: string;
        content: string;
        createdAt: string;
      }>;
    };
    assessments?: {
      items: Array<{
        id: string;
        name: string;
        type: string;
        status: string;
        dueDate?: string;
      }>;
    };
    [key: string]: any;
  };
}

const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTabId, setActiveTabId] = useState('overview');
  const { t, tString, i18n } = useTypedTranslation();

  
  // Amplify Gen 2 클라이언트 생성
  const [client] = useState(() => generateClient());
  
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
        // Gen 2에 맞는 방식으로 수정
        const { data } = await client.graphql<GraphQLQuery<GetCourseQuery>>({
          query: getCourseCatalog,
          variables: { id: courseId },
          authMode: 'userPool' // 인증 모드 명시적 지정
        });
        
        const courseData = data.getCourse;
        
        if (!courseData) {
          setError(t('course_detail.errors.not_found'));
          return;
        }
        
        setCourse(courseData);
      } catch (err) {
        console.error(t('course_detail.errors.load_error_log'), err);
        setError(t('course_detail.errors.load_error'));
      } finally {
        setLoading(false);
      }
    }

    fetchCourseData();
  }, [courseId, client, t]);

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
    <MainLayout>
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
      </SpaceBetween>
    </MainLayout>
  );
};

export default CourseDetailPage;