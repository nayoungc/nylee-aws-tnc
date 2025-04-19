// src/pages/CourseDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generateClient } from 'aws-amplify/api';
import { useTranslation } from 'react-i18next';
// 상대 경로로 변경
import MainLayout from '../../components/MainLayout';
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

// 상대 경로로 변경
import { getCourse } from '@/graphql/queries';

// 중복 선언 제거
// const getCourse = /* GraphQL */ `...`; 

const client = generateClient();

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
  const { t } = useTranslation();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTabId, setActiveTabId] = useState('overview');
  
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
      case 'PRE_QUIZ': return '사전 퀴즈';
      case 'POST_QUIZ': return '사후 퀴즈';
      case 'SURVEY': return '설문';
      default: return type;
    }
  };
  
  // 평가 상태에 따른 한글 이름
  const getAssessmentStatusName = (status: string): string => {
    switch(status) {
      case 'ACTIVE': return '활성';
      case 'COMPLETED': return '완료됨';
      case 'COMING_SOON': return '예정';
      case 'EXPIRED': return '만료됨';
      default: return status;
    }
  };
  
  // 날짜 포맷팅 함수
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    async function fetchCourseData() {
      if (!courseId) {
        setError('과정 ID가 유효하지 않습니다');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        // Gen 2에 맞는 방식으로 수정
        const { data } = await client.graphql<GraphQLQuery<GetCourseQuery>>({
          query: getCourse,
          variables: { id: courseId }
        });
        
        const courseData = data.getCourse;
        
        if (!courseData) {
          setError('과정을 찾을 수 없습니다');
          return;
        }
        
        setCourse(courseData);
      } catch (err) {
        console.error('과정 데이터 가져오기 오류:', err);
        setError('과정 정보를 불러오는 중 오류가 발생했습니다');
      } finally {
        setLoading(false);
      }
    }

    fetchCourseData();
  }, [courseId]);

  // 평가 항목 시작 핸들러
  const handleStartAssessment = (assessmentId: string, type: string) => {
    // 템플릿 문자열 수정 (이스케이프 제거)
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
        console.warn('알 수 없는 평가 유형:', type);
    }
  };

  if (loading) {
    return (
      <MainLayout title="과정 로딩 중...">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <StatusIndicator type="loading">과정 정보를 불러오는 중입니다...</StatusIndicator>
        </div>
      </MainLayout>
    );
  }

  if (error || !course) {
    return (
      <MainLayout title="오류">
        <Container>
          <Alert type="error" header="과정 로딩 실패">
            {error || '과정 정보를 불러올 수 없습니다'}
            <Box padding={{ top: 'm' }}>
              <Button onClick={() => navigate(-1)}>돌아가기</Button>
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
    action: assessment.status === 'ACTIVE' ? '시작' : '보기',
    actionEnabled: ['ACTIVE', 'COMPLETED'].includes(assessment.status)
  })) || [];

  return (
    <MainLayout title={course.title}>
      <SpaceBetween size="l">
        {activeAssessment && (
          <Alert
            header="활성 평가"
            type="info"
          >
            {/* 템플릿 문자열 수정 (이스케이프 제거) */}
            {`\${getAssessmentTypeName(activeAssessment.type)} "\${activeAssessment.name}"이(가) 지금 활성화되어 있습니다.`}
            <Box padding={{ top: 's' }}>
              <Button 
                variant="primary"
                onClick={() => handleStartAssessment(activeAssessment.id, activeAssessment.type)}
              >
                평가 시작
              </Button>
            </Box>
          </Alert>
        )}

        {/* 나머지 코드는 동일하게 유지 */}
        {/* ... */}
      </SpaceBetween>
    </MainLayout>
  );
};

export default CourseDetailPage;
