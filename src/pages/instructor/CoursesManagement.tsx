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
import { useTypedTranslation } from '@utils/i18n-utils';
import { executeGraphQL } from '@utils/auth'; // 경로 확인 필요
import { listCourseCatalogs } from '@graphql/queries'; // 쿼리 임포트

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

const CoursesManagement: React.FC = () => {
  const navigate = useNavigate();
  const { t, tString } = useTypedTranslation(); 
  const [courses, setCourses] = useState<CourseCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 페이지 이동 함수를 메모이제이션
  const navigateToCreateCourse = useCallback(() => {
    navigate('/instructor/courses/create');
  }, [navigate]);

  useEffect(() => {
    const checkAuthAndFetchCourses = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // 1. 인증 확인
        await getCurrentUser();
        
        console.log('API 호출 시작...');
        
        // 2. 정의된 쿼리 사용
        const data = await executeGraphQL<ListCourseCatalogsResponse>(
          listCourseCatalogs, 
          { limit: 100 }
        );
        
        console.log('API 응답:', data);
        
        // 3. 응답 데이터 처리
        const courseItems = data.listCourseCatalogs?.items || [];
        
        if (courseItems && courseItems.length > 0) {
          setCourses(courseItems);
        } else {
          setCourses([]);
        }
      } catch (error: any) {
        console.error('Course load error:', error);
        
        // 오류 처리
        if (error.name === 'UserUnAuthenticatedException' || 
            error.message?.includes('인증')) {
          setError(t('courses.errors.authentication'));
        } else {
          setError(t('courses.errors.load_message'));
        }
        
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
            // 기타 샘플 데이터 유지
          ]);
        }
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthAndFetchCourses();
  }, [t]);

  // 상태에 따른 배지 색상 결정
  const getStatusColor = (status: string): "green" | "blue" | "grey" => {
    switch(status.toUpperCase()) {
      case 'ACTIVE': return 'green';
      case 'COMPLETED': return 'blue';
      default: return 'grey';
    }
  };

  // 나머지 컴포넌트 렌더링 코드는 그대로 유지
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