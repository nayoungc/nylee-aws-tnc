import React, { useState, useEffect } from 'react';
import {
  Container,
  Header,
  Cards,
  SpaceBetween,
  Box,
  Button,
  Badge,
  Spinner
} from '@cloudscape-design/components';
import { useNavigate } from 'react-router-dom';
import { generateClient } from 'aws-amplify/api';

interface Course {
  id: string;
  title: string;
  startDate?: string;
  endDate?: string;
  instructorId?: string; 
  status: 'Active' | 'Inactive' | 'Completed';
  sessionCount?: number;
}

// GraphQL 쿼리 정의
const listCourses = /* GraphQL */ `
  query ListCourses(
    \$filter: ModelCourseFilterInput
    \$limit: Int
    \$nextToken: String
  ) {
    listCourses(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
      items {
        id
        title
        startDate
        endDate
        instructorId
        status
        sessionCount
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

const CoursesManagement: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Amplify GraphQL 클라이언트 생성
      const client = generateClient();
      
      // GraphQL 쿼리 실행
      const response = await client.graphql({
        query: listCourses,
        variables: {
          limit: 100,
          filter: {
            // 필요한 필터 조건 추가 가능
            // status: { eq: "ACTIVE" }
          }
        }
      });

      // any 타입을 사용하여 data 접근 문제 해결
      const responseAny: any = response;
      const courseItems = responseAny.data?.listCourses?.items || [];
      
      if (courseItems && courseItems.length > 0) {
        setCourses(courseItems);
      } else {
        setCourses([]);
      }
    } catch (error) {
      console.error('코스 로드 오류:', error);
      setError('코스 목록을 불러오는데 실패했습니다');
      
      // 개발 환경에서 샘플 데이터 사용
      if (process.env.NODE_ENV === 'development') {
        setCourses([
          { id: '1', title: 'AWS Cloud Practitioner Essentials', status: 'Active', sessionCount: 5 },
          { id: '2', title: 'AWS Solutions Architect - Associate', status: 'Active', sessionCount: 3 },
          { id: '3', title: 'AWS Developer - Associate', status: 'Inactive', sessionCount: 0 }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const navigateToCreateCourse = () => {
    navigate('/instructor/courses/create');
  };

  if (loading) {
    return (
      <Box padding="l" textAlign="center">
        <Spinner size="large" />
        <Box padding="s">코스 목록을 불러오는 중...</Box>
      </Box>
    );
  }

  return (
    <Container
      header={
        <Header
          variant="h2"
          description="현재 담당하고 있는 과정 목록"
          actions={
            <Button variant="primary" onClick={navigateToCreateCourse}>
              Create New Course
            </Button>
          }
        >
          My Courses
        </Header>
      }
    >
      <SpaceBetween size="l">
        {error && (
          <Box color="text-status-error">
            <span role="img" aria-label="error">⚠️</span> {error}
          </Box>
        )}
        
        <Cards
          cardDefinition={{
            header: item => (
              <SpaceBetween size="xxs">
                <div>{item.title}</div>
                <Badge color={item.status === 'Active' ? 'green' : (item.status === 'Completed' ? 'blue' : 'grey')}>
                  {item.status}
                </Badge>
              </SpaceBetween>
            ),
            sections: [
              {
                id: "date",
                header: "기간",
                content: item => item.startDate ? 
                  `\${new Date(item.startDate).toLocaleDateString()} ~ \${item.endDate ? new Date(item.endDate).toLocaleDateString() : '진행 중'}` 
                  : '날짜 미정'
              },
              {
                id: "sessions",
                header: "세션 수",
                content: item => `\${item.sessionCount || 0} 세션`
              },
              {
                id: "actions",
                content: item => (
                  <SpaceBetween direction="horizontal" size="xs">
                    <Button onClick={() => navigate(`/instructor/courses/\${item.id}`)}>
                      관리
                    </Button>
                    <Button iconName="external" onClick={() => navigate(`/course/\${item.id}`)}>
                      학생 화면 보기
                    </Button>
                  </SpaceBetween>
                )
              }
            ]
          }}
          cardsPerRow={[
            { cards: 1 },
            { minWidth: 500, cards: 2 }
          ]}
          items={courses}
          loadingText="Loading courses"
          empty={
            <Box textAlign="center" color="inherit">
              <b>개설된 과정이 없습니다</b>
              <Box padding={{ bottom: "s" }} variant="p" color="inherit">
                "Create New Course" 버튼을 클릭하여 새 과정을 개설하세요.
              </Box>
              <Button onClick={navigateToCreateCourse}>Create New Course</Button>
            </Box>
          }
        />
      </SpaceBetween>
    </Container>
  );
};

export default CoursesManagement;