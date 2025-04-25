// src/components/courses/BaseCourseView.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Header,
  Cards,
  SpaceBetween,
  Box,
  Button,
  Badge,
  Spinner,
  Alert
} from '@cloudscape-design/components';
import { useNavigate } from 'react-router-dom';
import { useTypedTranslation } from '@utils/i18n-utils';
import { listCourseCatalogs, CourseCatalog } from '@api';
import { useAuth, withAuthErrorHandling, createAuthErrorHandler } from '../../contexts/AuthContext';

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
  const { isAuthenticated, checkAuthStatus } = useAuth();
  const [courses, setCourses] = useState<CourseCatalog[]>(initialCourses || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState<boolean>(false);

  const navigateToCreateCourse = useCallback(() => {
    if (createPath) navigate(createPath);
  }, [navigate, createPath]);

  // 향상된 인증 확인 로직
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const isAuth = await checkAuthStatus();
        setAuthChecked(true);
      } catch (err) {
        setAuthChecked(true);
      }
    };
    
    verifyAuth();
  }, [checkAuthStatus]);

  // 데이터 로드 - 개선된 버전
  useEffect(() => {
    // 이미 초기 데이터가 있으면 사용
    if (initialCourses && initialCourses.length > 0) {
      setCourses(initialCourses);
      setLoading(false);
      return;
    }

    // 인증 상태 확인이 완료된 후에만 진행
    if (!authChecked) {
      return;
    }

    // 인증되지 않은 상태면 API 호출 없이 종료
    if (!isAuthenticated) {
      setLoading(false);
      setError(t('courses.errors.authentication'));
      
      if (process.env.NODE_ENV === 'development') {
        setCourses([
          mapToCourseViewModel({ 
            catalogId: '1', 
            title: '개발 환경 - 샘플 과정', 
            description: '로그인하지 않았을 때 표시되는 샘플 데이터입니다.',
            level: '입문',
            category: '기타',
            duration: 0,
            status: 'ACTIVE',
          })
        ]);
      }
      return;
    }

    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      
      // API 타임아웃 처리
      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(() => reject(new Error('API 요청 시간 초과')), 15000);
      });
      
      try {
        console.log('API 호출 시작...');
        
        // 인증 상태 확인
        const isAuth = await checkAuthStatus(true);
        if (!isAuth) {
          setError(t('courses.errors.authentication'));
          setLoading(false);
          return;
        }
        
        // 인증 에러 핸들러 생성
        const authErrorHandler = createAuthErrorHandler((err) => {
          setError(t('courses.errors.authentication'));
        }, navigate);
        
        // API 호출
        const wrappedAPI = withAuthErrorHandling(listCourseCatalogs, authErrorHandler);
        
        // 타임아웃과 API 호출 경쟁
        // @ts-ignore - race 타입 문제 무시
        const result = await Promise.race([
          wrappedAPI(),
          timeoutPromise
        ]);
        
        // 데이터 처리
        if (result && result.data && Array.isArray(result.data)) {
          const mappedItems = result.data.map(mapToCourseViewModel);
          setCourses(mappedItems);
        } else {
          setCourses([]);
        }
      } catch (error: any) {
        console.error('API 오류:', error);
        
        if (error.message === 'API 요청 시간 초과') {
          setError(t('courses.errors.timeout'));
        } else if (
          error.name === 'UserUnAuthenticatedException' || 
          error.message?.includes('인증') ||
          error.message?.includes('자격 증명')
        ) {
          setError(t('courses.errors.authentication'));
          // 인증 상태 재확인
          await checkAuthStatus(true);
        } else {
          setError(t('courses.errors.load_message'));
        }
        
        // 개발 환경에서는 샘플 데이터 제공
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
    
    if (isAuthenticated) {
      fetchCourses();
    }
  }, [t, initialCourses, authChecked, isAuthenticated, checkAuthStatus, navigate]);

  const getStatusColor = (status?: string): "green" | "blue" | "grey" => {
    if (!status) return 'grey';
    switch(status.toUpperCase()) {
      case 'ACTIVE': return 'green';
      case 'COMPLETED': return 'blue';
      default: return 'grey';
    }
  };

  // 로딩 중 UI
  if (loading) {
    return (
      <Box padding="l" textAlign="center">
        <Spinner size="large" />
        <Box padding="s">{t('courses.loading')}</Box>
      </Box>
    );
  }

  // 인증되지 않은 상태 UI
  if (!isAuthenticated && authChecked) {
    return (
      <Container>
        <Alert type="info" header={t('courses.auth_required') || "로그인 필요"}>
          <SpaceBetween direction="vertical" size="m">
            <div>{t('courses.please_login') || "이 기능을 사용하려면 로그인이 필요합니다."}</div>
            <Button variant="primary" onClick={() => navigate('/login')}>
              {t('courses.login') || "로그인하기"}
            </Button>
          </SpaceBetween>
        </Alert>
      </Container>
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