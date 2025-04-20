// BaseCourseView.tsx - 수정된 버전
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

// 타입 정의 (이전과 동일)
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
  
  // 모드와 권한 관련 프로퍼티
  isReadOnly?: boolean;          // 읽기 전용 모드 (카탈로그 뷰)
  isAdminView?: boolean;         // 관리자 뷰 여부
  
  // 경로 설정
  createPath?: string;           // 생성 페이지 경로 (관리자만)
  managePath: string;            // 관리 페이지 기본 경로
  viewPath: string;              // 학습자 뷰 경로
  
  // 버튼 표시 제어
  showCreateButton?: boolean;    // 생성 버튼 표시 여부
  showManageButton?: boolean;    // 관리 버튼 표시 여부
  showViewButton?: boolean;      // 학습자 뷰 버튼 표시 여부
  
  additionalActions?: React.ReactNode;
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
  additionalActions
}) => {
  const navigate = useNavigate();
  const { t, tString } = useTypedTranslation();
  const [courses, setCourses] = useState<CourseCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 페이지 이동 함수
  const navigateToCreateCourse = useCallback(() => {
    if (createPath) navigate(createPath);
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