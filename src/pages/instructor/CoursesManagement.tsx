// src/pages/instructor/CoursesManagement.tsx
import React, { useState, useEffect, useCallback } from 'react';
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
import { getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';
import type { GraphQLQuery, GraphQLResult } from '@aws-amplify/api';
import { useTypedTranslation } from '@utils/i18n-utils';

// CourseCatalog 테이블에 맞는 타입 정의
interface CourseCatalog {
  id: string;
  title: string;
  description?: string;
  level?: string;
  category?: string;
  duration?: number;
  status: string;
  price?: number;
  instructor?: string;
  createdAt?: string;
  updatedAt?: string;
}

// GraphQL 쿼리 응답 타입 정의
interface ListCourseCatalogsResponse {
  listCourseCatalogs: {
    items: CourseCatalog[];
    nextToken: string | null;
  };
}

// GraphQL query for Tnc-CourseCatalog table
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
        duration
        status
        price
        instructor
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

const CoursesManagement: React.FC = () => {
  const navigate = useNavigate();
  const { t, tString } = useTypedTranslation(); 
  const [courses, setCourses] = useState<CourseCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Amplify Gen 2 API 클라이언트 생성
  const client = generateClient();

  // 페이지 이동 함수를 메모이제이션
  const navigateToCreateCourse = useCallback(() => {
    navigate('/instructor/courses/create');
  }, [navigate]);

  // 컴포넌트 마운트 시 한 번만 실행되는 useEffect
  useEffect(() => {
    const checkAuthAndFetchCourses = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // 사용자 인증 확인
        await getCurrentUser();
        
        console.log('API 호출 시작...');
        const response = await client.graphql<GraphQLQuery<ListCourseCatalogsResponse>>({
          query: listCourseCatalogs, 
          variables: {
            limit: 100,
            filter: {
              // 필요한 필터링 조건 추가
            }
          },
          authMode: 'userPool'
        });
        
        console.log('API 응답:', response);

        // 타입 안전하게 응답 데이터 처리
        const courseItems = response.data?.listCourseCatalogs?.items || [];
        
        if (courseItems && courseItems.length > 0) {
          setCourses(courseItems);
        } else {
          setCourses([]);
        }
      } catch (error) {
        console.error(t('courses.errors.load_error'), error);
        setError(t('courses.errors.load_message'));
        
        // 개발 환경에서만 샘플 데이터 사용
        if (process.env.NODE_ENV === 'development') {
          setCourses([
            { 
              id: '1', 
              title: 'AWS Cloud Practitioner Essentials', 
              description: 'Learn the fundamentals of AWS Cloud',
              level: 'Beginner',
              category: 'Cloud',
              duration: 8,
              status: 'ACTIVE', 
              price: 99 
            },
            { 
              id: '2', 
              title: 'AWS Solutions Architect - Associate', 
              description: 'Design available, cost-efficient AWS architecture',
              level: 'Intermediate',
              category: 'Architecture',
              duration: 40,
              status: 'ACTIVE', 
              price: 149 
            },
            { 
              id: '3', 
              title: 'AWS Developer - Associate', 
              description: 'Develop and maintain AWS applications',
              level: 'Intermediate',
              category: 'Development',
              duration: 32,
              status: 'INACTIVE', 
              price: 149 
            }
          ]);
        }
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthAndFetchCourses();
  }, []); // 빈 배열로 초기 렌더링 시 한 번만 실행

  // 상태에 따른 배지 색상 결정
  const getStatusColor = (status: string): "green" | "blue" | "grey" => {
    switch(status.toUpperCase()) {
      case 'ACTIVE': return 'green';
      case 'COMPLETED': return 'blue';
      default: return 'grey';
    }
  };

  if (loading) {
    return (
      <Box padding="l" textAlign="center">
        <Spinner size="large" />
        <Box padding="s">{t('courses.loading')}</Box>
      </Box>
    );
  }

  return (
    <Container>
      <SpaceBetween size="l">
        <Header
          variant="h1"
          description={t('courses.description')}
          actions={
            <Button variant="primary" onClick={navigateToCreateCourse}>
              {t('courses.create_button')}
            </Button>
          }
        >
          {t('courses.title')}
        </Header>
        
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
                <Badge color={getStatusColor(item.status)}>
                  {item.status}
                </Badge>
              </SpaceBetween>
            ),
            sections: [
              {
                id: "description",
                content: item => item.description || t('courses.no_description')
              },
              {
                id: "details",
                header: t('courses.details'),
                content: item => (
                  <SpaceBetween size="xs">
                    <div>{t('courses.level')}: {item.level || t('courses.not_specified')}</div>
                    <div>{t('courses.category')}: {item.category || t('courses.not_specified')}</div>
                    <div>{t('courses.duration')}: {item.duration ? `\${item.duration} \${t('courses.hours')}` : t('courses.not_specified')}</div>
                    <div>{t('courses.price')}: {item.price ? `\${item.price} \${t('courses.currency')}` : t('courses.free')}</div>
                  </SpaceBetween>
                )
              },
              {
                id: "actions",
                content: item => (
                  <SpaceBetween direction="horizontal" size="xs">
                    <Button onClick={() => navigate(`/instructor/courses/\${item.id}`)}>
                      {t('courses.manage')}
                    </Button>
                    <Button iconName="external" onClick={() => navigate(`/course/\${item.id}`)}>
                      {t('courses.view_student')}
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
          loadingText={tString('courses.loading')}
          empty={
            <Box textAlign="center" color="inherit">
              <b>{t('courses.empty.title')}</b>
              <Box padding={{ bottom: "s" }} variant="p" color="inherit">
                {t('courses.empty.description')}
              </Box>
              <Button onClick={navigateToCreateCourse}>{t('courses.create_button')}</Button>
            </Box>
          }
        />
      </SpaceBetween>
    </Container>
  );
};

export default CoursesManagement;
