// src/components/BaseCourseView.tsx
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

// 타입 정의
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

// 응답 타입 - 서버 API 구조에 맞게 수정
export interface ListCourseCatalogsResponse {
  // 여러 가능한 응답 키를 처리할 수 있도록 인덱스 시그니처 사용
  [key: string]: {
    items: CourseCatalog[];
    nextToken: string | null;
  };
}

// BaseCourseView의 props 인터페이스
interface BaseCourseViewProps {
  title: string;
  description: string;
  
  // 모드와 권한 관련 프로퍼티
  isReadOnly?: boolean;
  isAdminView?: boolean;
  
  // 경로 설정
  createPath?: string;
  managePath: string;
  viewPath: string;
  
  // 버튼 표시 제어
  showCreateButton?: boolean;
  showManageButton?: boolean;
  showViewButton?: boolean;
  
  additionalActions?: React.ReactNode;
  courses?: CourseCatalog[];
}

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
  courses: initialCourses
}) => {
  const navigate = useNavigate();
  const { t, tString } = useTypedTranslation();
  const [courses, setCourses] = useState<CourseCatalog[]>(initialCourses || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 페이지 이동 함수
  const navigateToCreateCourse = useCallback(() => {
    if (createPath) navigate(createPath);
  }, [navigate, createPath]);

  useEffect(() => {
    // 이미 courses가 props로 제공된 경우 API 호출 생략
    if (initialCourses && initialCourses.length > 0) {
      setLoading(false);
      return;
    }

    const checkAuthAndFetchCourses = async () => {
      setLoading(true);
      setError(null);
      
      // 데이터 로딩 타임아웃 설정
      const timeoutId = setTimeout(() => {
        setLoading(false);
        setError(t('courses.errors.timeout'));
        
        // 개발 환경에서만 샘플 데이터 제공
        if (process.env.NODE_ENV === 'development') {
          setCourses([
            { 
              id: '1', 
              title: '타임아웃 - 샘플 과정', 
              description: '타임아웃으로 인한 샘플 데이터입니다.',
              level: '입문',
              category: '기타',
              duration: 0,
              status: 'ACTIVE',
              price: 0
            }
          ]);
        }
      }, 15000); // 15초 타임아웃
      
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
          
          // 3. 응답 데이터 처리 - 여러 가능한 키 처리
          let courseItems: CourseCatalog[] = [];
          
          // 가능한 응답 키 확인
          const responseKey = 
            data.listTncCourseCatalogs ? 'listTncCourseCatalogs' :
            data.listCourseCatalogs ? 'listCourseCatalogs' :
            data.listCourses ? 'listCourses' : 
            Object.keys(data)[0]; // 또는 첫 번째 키 사용
          
          if (data[responseKey]?.items) {
            courseItems = data[responseKey].items;
          }
          
          if (courseItems && courseItems.length > 0) {
            setCourses(courseItems);
          } else {
            setCourses([]);
          }
          
          // 타임아웃 제거
          clearTimeout(timeoutId);
        } catch (graphqlError) {
          console.error('GraphQL 오류:', graphqlError);
          clearTimeout(timeoutId);
          throw new Error('데이터를 불러오는 중 오류가 발생했습니다');
        }
      } catch (error: any) {
        console.error('Course load error:', error);
        clearTimeout(timeoutId);
        
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
  }, [t, initialCourses]);

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

  // 버튼 액션 섹션 렌더링
  const renderActionButtons = (item: CourseCatalog) => {
    return (
      <SpaceBetween direction="horizontal" size="xs">
        {/* 관리 버튼은 관리자 뷰이고 showManageButton이 true일 때만 표시 */}
        {isAdminView && showManageButton && (
          <Button onClick={() => navigate(`\${managePath}\${item.id}`)}>
            {t('courses.manage')}
          </Button>
        )}
        
        {/* 학습자 뷰 버튼 */}
        {showViewButton && (
          <Button iconName="external" onClick={() => navigate(`\${viewPath}\${item.id}`)}>
            {t('courses.view_student')}
          </Button>
        )}
        
        {/* 읽기 전용이 아닌 경우에만 등록 버튼 표시 */}
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
              
              {/* 관리자 뷰이고 showCreateButton이 true인 경우에만 생성 버튼 표시 */}
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