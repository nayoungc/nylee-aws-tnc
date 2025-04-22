// src/components/courses/BaseCourseView.tsx - 수정
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
import { listCourseCatalogs, CourseCatalog } from '@api';

// 데이터 매핑 함수 - API 응답을 UI 모델로 변환
const mapToCourseViewModel = (item: any): CourseCatalog => {
  return {
    catalogId: item.catalogId || '',
    version: item.version || 'v1',
    title: item.title || '',
    awsCode: item.awsCode,
    description: item.description,
    category: item.category || '',
    level: item.level,
    duration: item.duration,
    price: item.price,
    currency: item.currency,
    isPublished: item.isPublished !== undefined ? item.isPublished : true,
    publishedDate: item.publishedDate,
    deliveryMethod: item.deliveryMethod || '',
    objectives: item.objectives || [],
    targetAudience: item.targetAudience || [],
    status: item.status || 'ACTIVE',
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  };
};

// BaseCourseView의 props 인터페이스
interface BaseCourseViewProps {
  title: string;
  description: string;
  isReadOnly?: boolean;
  isAdminView?: boolean;
  createPath?: string;
  managePath: string;
  viewPath: string;
  showCreateButton?: boolean;
  showManageButton?: boolean;
  showViewButton?: boolean;
  additionalActions?: React.ReactNode;
  courses?: CourseCatalog[];
  onSelectCourse?: (course: CourseCatalog) => void;
}

export { mapToCourseViewModel, type CourseCatalog };

export const BaseCourseView: React.FC<BaseCourseViewProps> = ({
  title,
  description,
  isReadOnly = false,
  isAdminView = false,
  createPath = '',
  managePath,
  viewPath,
  showCreateButton = false,
  showManageButton = true,
  showViewButton = true,
  additionalActions,
  courses: initialCourses,
  onSelectCourse
}) => {
  const navigate = useNavigate();
  const { t, tString } = useTypedTranslation();
  const [courses, setCourses] = useState<CourseCatalog[]>(initialCourses || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigateToCreateCourse = useCallback(() => {
    if (createPath) navigate(createPath);
  }, [navigate, createPath]);

  useEffect(() => {
    if (initialCourses && initialCourses.length > 0) {
      setLoading(false);
      return;
    }

    const checkAuthAndFetchCourses = async () => {
      setLoading(true);
      setError(null);
      
      const timeoutId = setTimeout(() => {
        setLoading(false);
        setError(t('courses.errors.timeout'));
        
        if (process.env.NODE_ENV === 'development') {
          setCourses([
            mapToCourseViewModel({ 
              catalogId: '1', 
              title: '타임아웃 - 샘플 과정', 
              description: '타임아웃으로 인한 샘플 데이터입니다.',
              level: '입문',
              category: '기타',
              duration: 0,
              status: 'ACTIVE',
            })
          ]);
        }
      }, 15000);
      
      try {
        await getCurrentUser();
        
        console.log('API 호출 시작...');
        
        try {
          // 새로운 API 구조 사용
          const result = await listCourseCatalogs();
          
          console.log('API 응답:', result.data);
          
          if (result.data && Array.isArray(result.data)) {
            const mappedItems = result.data.map(mapToCourseViewModel);
            setCourses(mappedItems);
          } else {
            setCourses([]);
          }
          
          clearTimeout(timeoutId);
        } catch (apiError) {
          console.error('API 오류:', apiError);
          clearTimeout(timeoutId);
          throw new Error('데이터를 불러오는 중 오류가 발생했습니다');
        }
      } catch (error: any) {
        console.error('Course load error:', error);
        clearTimeout(timeoutId);
        
        if (error.name === 'UserUnAuthenticatedException' || 
            error.message?.includes('인증')) {
          setError(t('courses.errors.authentication'));
        } else {
          setError(t('courses.errors.load_message'));
        }
        
        if (process.env.NODE_ENV === 'development') {
          setCourses([
            mapToCourseViewModel({
              catalogId: '1',
              version: 'v1',
              title: 'AWS Cloud Practitioner Essentials',
              description: 'Learn the fundamentals of AWS Cloud',
              level: 'Beginner',
              category: 'Cloud',
              duration: 8,
              status: 'ACTIVE', 
            }),
            mapToCourseViewModel({ 
              catalogId: '2', 
              version: 'v1',
              title: 'AWS Solutions Architect Associate',
              description: 'Learn advanced AWS architecture concepts',
              level: 'Intermediate',
              category: 'Architecture',
              duration: 24,
              status: 'ACTIVE', 
            })
          ]);
        }
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthAndFetchCourses();
  }, [t, initialCourses]);

  const getStatusColor = (status?: string): "green" | "blue" | "grey" => {
    if (!status) return 'grey';
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

  const renderActionButtons = (item: CourseCatalog) => {
    return (
      <SpaceBetween direction="horizontal" size="xs">
        {onSelectCourse && (
          <Button onClick={() => onSelectCourse(item)}>
            {t('courses.view_stats')}
          </Button>
        )}
        
        {isAdminView && showManageButton && (
          <Button onClick={() => navigate(`\${managePath}\${item.catalogId}`)}>
            {t('courses.manage')}
          </Button>
        )}
        
        {showViewButton && (
          <Button iconName="external" onClick={() => navigate(`\${viewPath}\${item.catalogId}`)}>
            {t('courses.view_student')}
          </Button>
        )}
        
        {!isReadOnly && (
          <Button variant="normal">
            {t('courses.enroll')}
          </Button>
        )}
      </SpaceBetween>
    );
  };

  return (
    <Container>
      <SpaceBetween size="l">
        <Header
          variant="h1"
          description={description}
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              {additionalActions}
              
              {isAdminView && showCreateButton && createPath && (
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
                  {item.status || 'ACTIVE'}
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
                    <div>{t('courses.duration')}: {item.duration ? `\${item.duration} \${t('courses.hours')}` : t('courses.not_specified')}</div>
                    {item.deliveryMethod && <div>{t('courses.delivery')}: {item.deliveryMethod}</div>}
                    {item.version && <div>{t('courses.version')}: {item.version}</div>}
                  </SpaceBetween>
                )
              },
              {
                id: "actions",
                content: renderActionButtons
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
              {isAdminView && showCreateButton && createPath && (
                <Button onClick={navigateToCreateCourse}>
                  {t('courses.create_button')}
                </Button>
              )}
            </Box>
          }
        />
      </SpaceBetween>
    </Container>
  );
};