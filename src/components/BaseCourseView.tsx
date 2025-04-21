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

// 백엔드 스키마와 일치하는 타입 정의
export interface CourseCatalog {
  catalogId: string;        // DynamoDB 테이블의 파티션 키
  version: string;          // DynamoDB 테이블의 정렬 키
  title: string;            // 과정 이름
  awsCode?: string;         // AWS 코드
  description?: string;
  category?: string;        // 카테고리
  level?: string;
  duration?: string;
  deliveryMethod?: string;  // 전달 방식
  objectives?: string[];
  targetAudience?: string[]; // 대상 고객
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 응답 타입 정의
export interface listCourseCatalogResponse {
  // 여러 가능한 응답 키를 처리할 수 있도록 인덱스 시그니처 사용
  [key: string]: {
    items: any[]; // 원시 API 응답 타입 (매핑 전)
    nextToken: string | null;
  };
}

// 데이터 매핑 함수 - API 응답을 UI 모델로 변환
const mapToCourseViewModel = (item: any): CourseCatalog => {
  return {
    catalogId: item.catalogId || item.id || '',
    version: item.version || 'v1',
    title: item.title || item.course_name || '',
    awsCode: item.awsCode || '',
    description: item.description || '',
    category: item.category || '',
    level: item.level || '',
    duration: item.duration || '',
    deliveryMethod: item.deliveryMethod || item.delivery_method || '',
    objectives: item.objectives || [],
    targetAudience: item.targetAudience || item.target_audience || [],
    // UI에 필요한 추가 필드 - 필요시 기본값 설정
    status: item.status || 'ACTIVE',
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  };
};

// BaseCourseView의 props 인터페이스 - 중복 제거
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
  
  // 과정 선택 콜백 추가
  onSelectCourse?: (course: CourseCatalog) => void;
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
  courses: initialCourses,
  onSelectCourse
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
            mapToCourseViewModel({ 
              catalogId: '1', 
              title: '타임아웃 - 샘플 과정', 
              description: '타임아웃으로 인한 샘플 데이터입니다.',
              level: '입문',
              category: '기타',
              duration: '0',
              status: 'ACTIVE',
            })
          ]);
        }
      }, 15000); // 15초 타임아웃
      
      try {
        // 1. 인증 확인
        await getCurrentUser();
        
        console.log('API 호출 시작...');
        
        try {
          // 2. 정의된 쿼리 사용 - DynamoDB 테이블 스키마에 맞게 filter 인자 제거
          const data = await executeGraphQL<listCourseCatalogResponse>(
            listCourseCatalogs as string,
            { limit: 100 }
          );
          
          console.log('API 응답:', data);
          
          // 3. 응답 데이터 처리 - 여러 가능한 키 처리
          let rawItems: any[] = [];
          
          // 가능한 응답 키 확인
          const responseKey = 
            data.listCourseCatalog ? 'listCourseCatalog' :
            data.listCourseCatalogs ? 'listCourseCatalogs' :
            data.listCourses ? 'listCourses' : 
            Object.keys(data)[0];
          
          console.log('응답 키:', responseKey);
          
          if (data[responseKey]?.items) {
            rawItems = data[responseKey].items;
            // 데이터 매핑 적용
            const mappedItems = rawItems.map(mapToCourseViewModel);
            setCourses(mappedItems);
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
            mapToCourseViewModel({
              catalogId: '1',
              version: 'v1',
              title: 'AWS Cloud Practitioner Essentials', 
              description: 'Learn the fundamentals of AWS Cloud',
              level: 'Beginner',
              category: 'Cloud',
              duration: '8',
              status: 'ACTIVE', 
            }),
            mapToCourseViewModel({ 
              catalogId: '2', 
              version: 'v1',
              title: 'AWS Solutions Architect Associate', 
              description: 'Learn advanced AWS architecture concepts',
              level: 'Intermediate',
              category: 'Architecture',
              duration: '24',
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

  // 상태에 따른 배지 색상 결정
  const getStatusColor = (status?: string): "green" | "blue" | "grey" => {
    if (!status) return 'grey';
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
        {/* 과정 선택 버튼 */}
        {onSelectCourse && (
          <Button onClick={() => onSelectCourse(item)}>
            {t('courses.view_stats')}
          </Button>
        )}
        
        {/* 관리 버튼은 관리자 뷰이고 showManageButton이 true일 때만 표시 */}
        {isAdminView && showManageButton && (
          <Button onClick={() => navigate(`\${managePath}\${item.catalogId}`)}>
            {t('courses.manage')}
          </Button>
        )}
        
        {/* 학습자 뷰 버튼 */}
        {showViewButton && (
          <Button iconName="external" onClick={() => navigate(`\${viewPath}\${item.catalogId}`)}>
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
                    {item.category && <div>{t('courses.category')}: {item.category}</div>}
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