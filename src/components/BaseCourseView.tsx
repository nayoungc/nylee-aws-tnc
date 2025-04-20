// BaseCourseView.tsx - 공통 로직을 담은 기본 컴포넌트
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
import { executeGraphQL } from '@utils/auth';
import { listCourseCatalogs } from '@graphql/queries';

// 공통 타입 정의
export interface CourseCatalog {
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

export interface ListCourseCatalogsResponse {
  listCourseCatalogs: {
    items: CourseCatalog[];
    nextToken: string | null;
  };
}

interface BaseCourseViewProps {
  title: string;
  description: string;
  createPath: string;
  managePath: string; // 예: /instructor/courses/ 또는 /course/
  viewPath: string;   // 수강생 뷰 경로
  showCreateButton?: boolean;
  additionalActions?: React.ReactNode;
}

export const BaseCourseView: React.FC<BaseCourseViewProps> = ({
  title,
  description,
  createPath,
  managePath,
  viewPath,
  showCreateButton = true,
  additionalActions
}) => {
  const navigate = useNavigate();
  const { t, tString } = useTypedTranslation();
  const [courses, setCourses] = useState<CourseCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 페이지 이동 함수
  const navigateToCreateCourse = useCallback(() => {
    navigate(createPath);
  }, [navigate, createPath]);

  useEffect(() => {
    const checkAuthAndFetchCourses = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // 1. 인증 확인
        await getCurrentUser();
        
        console.log('API 호출 시작...');
        
        try {
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
        } catch (graphqlError) {
          console.error('GraphQL 오류:', graphqlError);
          throw new Error('데이터를 불러오는 중 오류가 발생했습니다');
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
            { 
              id: '2', 
              title: 'AWS Solutions Architect Associate', 
              description: 'Learn advanced AWS architecture concepts',
              level: 'Intermediate',
              category: 'Architecture',
              duration: 24,
              status: 'ACTIVE', 
              price: 149 
            }
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

  // 로딩 상태 표시
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
          description={description}
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              {additionalActions}
              {showCreateButton && (
                <Button variant="primary" onClick={navigateToCreateCourse}>
                  {t('courses.create_button')}
                </Button>
              )}
            </SpaceBetween>
          }
        >
          {title}
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
                    <Button onClick={() => navigate(`\${managePath}\${item.id}`)}>
                      {t('courses.manage')}
                    </Button>
                    <Button iconName="external" onClick={() => navigate(`\${viewPath}\${item.id}`)}>
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